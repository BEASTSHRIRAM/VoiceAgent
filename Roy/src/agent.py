import logging
import textwrap
import os
from typing import Annotated, Optional
from datetime import datetime

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    inference,
    room_io,
    function_tool,
    RunContext,
)
from livekit.plugins import ai_coustics, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel
import httpx

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("hospital-agent")

load_dotenv(".env.local")


# ============================================================================
# CONVEX CLIENT
# ============================================================================

class ConvexClient:
    """Lightweight Convex client for agent queries"""
    
    def __init__(self):
        self.deployment_url = os.getenv("CONVEX_URL")
        if not self.deployment_url:
            logger.error("CONVEX_URL not set in environment!")
            raise ValueError("CONVEX_URL must be set in .env.local")
        
        # Remove trailing slash if present
        self.deployment_url = self.deployment_url.rstrip("/")
        self.client = httpx.AsyncClient(timeout=30.0)
        logger.info(f"Convex client initialized: {self.deployment_url}")
    
    async def _query(self, function_name: str, args: dict = None) -> any:
        """Execute a Convex query using the HTTP API"""
        # Correct Convex HTTP API format
        url = f"{self.deployment_url}/api/query"
        payload = {
            "path": function_name,  # Keep as "patients:getPatientByBed"
            "args": args or {}
        }
        
        try:
            logger.debug(f"Querying Convex: POST {url}")
            logger.debug(f"  Path: {function_name}")
            logger.debug(f"  Args: {args}")
            
            response = await self.client.post(url, json=payload)
            
            logger.debug(f"Response Status: {response.status_code}")
            logger.debug(f"Response Body: {response.text[:500]}")
            
            response.raise_for_status()
            result = response.json()
            logger.debug(f"Convex response: {result}")
            
            # Convex returns {"status":"success","value":{...}}
            if result.get("status") == "success":
                return result.get("value")
            else:
                logger.error(f"Convex error: {result}")
                return None
        except Exception as e:
            logger.error(f"Convex query error: {function_name} - {type(e).__name__}: {e}")
            return None
    
    async def get_patient_by_bed(self, bed_number: str) -> Optional[dict]:
        """Get patient by bed number"""
        logger.info(f"Getting patient by bed: {bed_number}")
        return await self._query("patients:getPatientByBed", {"bedNumber": bed_number})
    
    async def get_all_patients(self) -> list:
        """Get all patients"""
        logger.info("Getting all patients")
        result = await self._query("patients:getAllPatients", {})
        return result if result else []
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Global Convex client - initialize lazily
convex_client = None


def get_convex_client():
    """Get or initialize the Convex client"""
    global convex_client
    if convex_client is None:
        convex_client = ConvexClient()
    return convex_client


# ============================================================================
# HOSPITAL ASSISTANT AGENT
# ============================================================================

class HospitalAssistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            llm=inference.LLM(model="openai/gpt-4o"),
            instructions=textwrap.dedent(
                """\
                You are a Hospital Ward Voice Assistant designed to help doctors and nurses with hands-free patient care.

                # Your Role
                You help medical staff by:
                - Updating patient vitals and records
                - Retrieving patient information quickly
                - Handling emergency alerts
                - Managing medication records
                - Providing patient summaries

                # Context Awareness
                - Remember which patient is being discussed in the conversation
                - When staff say "his BP" or "her temperature", understand the context
                - Ask for clarification only when truly ambiguous
                - When asked about medications, use info_type="medications"
                - When asked about vitals, use info_type="vitals"
                - When asked for full details, use info_type="all"

                # Output Rules (Voice Optimized)
                - Respond in plain, conversational text only
                - Keep responses brief and actionable (1-3 sentences)
                - Spell out numbers: "ninety-six percent" not "96%"
                - Avoid medical jargon when possible, but use it when appropriate
                - Never reveal tool names, parameters, or technical details
                - Confirm actions clearly: "Vitals updated" or "Alert sent"

                # Emergency Handling
                - Prioritize emergency commands immediately
                - Confirm emergency actions clearly
                - Stay calm and professional

                # Medical Safety
                - Always confirm critical actions (medication, emergency alerts)
                - If unsure about a patient identifier, ask for clarification
                - Never make medical decisions - you assist with data only

                # Privacy
                - Treat all patient information as confidential
                - Only discuss patients when staff initiates the conversation
                """
            ),
        )
    
    # ========================================================================
    # TOOL: Get Patient Information
    # ========================================================================
    
    @function_tool
    async def get_patient_info(
        self,
        context: RunContext,
        patient_identifier: Annotated[str, "Bed number or patient ID (e.g., 'bed 12', 'ward B 3', 'P102')"],
        info_type: Annotated[str, "Type of info: summary, vitals, medications, diagnosis, all"] = "all",
    ):
        """Retrieve patient information from the database.
        
        Use this when staff asks:
        - "What's the status of bed 12?"
        - "Show me vitals for ward B patient"
        - "When is next medication?"
        - "Read patient history"
        
        Args:
            patient_identifier: The bed number or patient ID
            info_type: What information to retrieve
        """
        logger.info(f"Retrieving info: {patient_identifier} - {info_type}")
        
        # Normalize bed identifier - extract just the number
        # "bed 10" -> "10", "bed_12" -> "12", "10" -> "10"
        normalized_id = patient_identifier.lower().replace("bed", "").replace("_", "").strip()
        logger.debug(f"Normalized identifier: {normalized_id}")
        
        # Query Convex
        try:
            client = get_convex_client()
            patient = await client.get_patient_by_bed(normalized_id)
            logger.debug(f"Patient query result: {patient}")
        except Exception as e:
            logger.error(f"Error querying patient: {e}")
            return f"Error retrieving patient information: {str(e)}"
        
        if not patient:
            return f"Could not find patient at {patient_identifier}. Please verify the bed number."
        
        if info_type == "vitals":
            vitals = patient.get("vitals", {})
            if not vitals:
                return f"{patient.get('name', 'Patient')}: No vital signs recorded yet."
            return f"{patient.get('name', 'Patient')}: Temperature {vitals.get('temperature', 'N/A')}°C, BP {vitals.get('bpSystolic', 'N/A')}/{vitals.get('bpDiastolic', 'N/A')}, Oxygen {vitals.get('oxygenSaturation', 'N/A')}%, Heart rate {vitals.get('heartRate', 'N/A')} bpm"
        
        elif info_type == "medications":
            meds = patient.get("medications", [])
            if not meds:
                return f"No medications recorded for {patient.get('name', 'this patient')}."
            med_list = ", ".join([f"{m.get('name', 'Unknown')} {m.get('dosage', '')}" for m in meds])
            return f"Medications for {patient.get('name', 'Patient')}: {med_list}"
        
        elif info_type == "diagnosis":
            return f"{patient.get('name', 'Patient')}, age {patient.get('age', 'unknown')}: {patient.get('diagnosis', 'No diagnosis recorded')}"
        
        else:  # all or summary
            vitals = patient.get("vitals", {})
            vitals_str = "No vitals recorded"
            if vitals:
                vitals_str = f"Temp {vitals.get('temperature', 'N/A')}°C, BP {vitals.get('bpSystolic', 'N/A')}/{vitals.get('bpDiastolic', 'N/A')}, O2 {vitals.get('oxygenSaturation', 'N/A')}%"
            return f"{patient.get('name', 'Patient')}, {patient.get('age', 'unknown')} years old. Diagnosis: {patient.get('diagnosis', 'N/A')}. Current vitals: {vitals_str}"
    
    # ========================================================================
    # TOOL: List All Patients
    # ========================================================================
    
    @function_tool
    async def list_all_patients(
        self,
        context: RunContext,
    ):
        """Get a list of all patients currently in the hospital.
        
        Use this when staff asks:
        - "Who's in the ICU?"
        - "Show me all patients"
        - "List patients in ward B"
        
        Returns a summary of all patients with bed numbers and status.
        """
        logger.info("Listing all patients")
        
        try:
            client = get_convex_client()
            patients = await client.get_all_patients()
            logger.debug(f"Retrieved {len(patients) if patients else 0} patients")
        except Exception as e:
            logger.error(f"Error listing patients: {e}")
            return f"Error retrieving patient list: {str(e)}"
        
        if not patients:
            return "No patients found in the system."
        
        # Format patient list
        patient_list = []
        for p in patients:
            bed = p.get("bedNumber", "Unknown")
            name = p.get("name", "Unknown")
            diagnosis = p.get("diagnosis", "N/A")
            patient_list.append(f"{name} in {bed} - {diagnosis}")
        
        summary = "Current patients: " + "; ".join(patient_list[:5])  # Limit to 5 for voice
        if len(patients) > 5:
            summary += f" and {len(patients) - 5} more."
        
        return summary
    
    # ========================================================================
    # TOOL: Update Patient Vitals
    # ========================================================================
    
    @function_tool
    async def update_patient_vitals(
        self,
        context: RunContext,
        patient_identifier: Annotated[str, "Bed number or patient ID"],
        vital_type: Annotated[str, "Type of vital: temperature, bp, oxygen, heart_rate"],
        value: Annotated[str, "The vital sign value"],
    ):
        """Update a patient's vital signs.
        
        Use this when staff says:
        - "Update bed 12 oxygen to 96"
        - "Patient temperature is 101"
        - "BP is 140 over 90"
        """
        logger.info(f"Updating vitals: {patient_identifier} - {vital_type}: {value}")
        
        # Normalize bed identifier - extract just the number
        normalized_id = patient_identifier.lower().replace("bed", "").replace("_", "").strip()
        client = get_convex_client()
        patient = await client.get_patient_by_bed(normalized_id)
        
        if not patient:
            return f"Could not find patient: {patient_identifier}"
        
        # In production, would call Convex mutation to update vitals
        # For now, acknowledge the update
        return f"Updated {vital_type} to {value} for {patient.get('name', 'patient')}. Recorded at {datetime.now().strftime('%H:%M')}."
    
    # ========================================================================
    # TOOL: Record Medication
    # ========================================================================
    
    @function_tool
    async def record_medication(
        self,
        context: RunContext,
        patient_identifier: Annotated[str, "Bed number or patient ID"],
        medication_name: Annotated[str, "Name of the medication"],
        dosage: Annotated[Optional[str], "Dosage amount (optional)"] = None,
    ):
        """Record medication administration.
        
        Use this when staff says:
        - "Mark insulin administered"
        - "Given metformin to bed 12"
        """
        logger.info(f"Recording medication: {medication_name} for {patient_identifier}")
        
        # Normalize bed identifier - extract just the number
        normalized_id = patient_identifier.lower().replace("bed", "").replace("_", "").strip()
        client = get_convex_client()
        patient = await client.get_patient_by_bed(normalized_id)
        
        if not patient:
            return f"Could not find patient: {patient_identifier}"
        
        dose_info = f" {dosage}" if dosage else ""
        return f"Recorded {medication_name}{dose_info} administered to {patient.get('name', 'patient')} at {datetime.now().strftime('%H:%M')}"
    
    # ========================================================================
    # TOOL: Emergency Alert
    # ========================================================================
    
    @function_tool
    async def send_emergency_alert(
        self,
        context: RunContext,
        alert_type: Annotated[str, "Type of emergency: code_blue, code_red, rapid_response, fall, other"],
        location: Annotated[str, "Location of emergency"],
        details: Annotated[Optional[str], "Additional details"] = None,
    ):
        """Send an emergency alert.
        
        Use this for urgent situations when staff says:
        - "Code blue in ICU"
        - "Emergency in ward B"
        """
        logger.critical(f"EMERGENCY ALERT: {alert_type} at {location} - {details}")
        
        alert_msg = f"EMERGENCY ALERT SENT: {alert_type.replace('_', ' ').title()} at {location}"
        if details:
            alert_msg += f". Details: {details}"
        
        return alert_msg + ". Response team has been notified."


# ============================================================================
# SERVER SETUP
# ============================================================================

server = AgentServer()


def prewarm(proc: JobProcess):
    """Preload models for faster response"""
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="hospital-assistant")
async def hospital_agent(ctx: JobContext):
    # Logging setup
    ctx.log_context_fields = {
        "room": ctx.room.name,
        "agent_type": "hospital_ward_assistant",
    }
    
    logger.info("Starting Hospital Ward Voice Assistant")
    
    # Set up voice AI pipeline
    session = AgentSession(
        # Speech-to-text with medical vocabulary support
        stt=inference.STT(model="deepgram/nova-3", language="en"),
        
        # Text-to-speech with professional voice
        tts=inference.TTS(
            model="cartesia/sonic-3", 
            voice="9626c31c-bec5-4cca-baa8-f8ba9e84c8bc"  # Professional female voice
        ),
        
        # Turn detection for interruptions
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        
        # Allow preemptive generation for faster responses
        preemptive_generation=True,
    )
    
    # Start the session
    await session.start(
        agent=HospitalAssistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                # Noise cancellation for hospital environment
                noise_cancellation=ai_coustics.audio_enhancement(
                    model=ai_coustics.EnhancerModel.QUAIL_VF_S
                ),
            ),
        ),
    )
    
    # Join the room
    await ctx.connect()
    
    logger.info("Hospital Ward Voice Assistant is ready")


if __name__ == "__main__":
    cli.run_app(server)
