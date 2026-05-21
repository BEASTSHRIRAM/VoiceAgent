"""
Convex Database Client for Hospital Voice Assistant
Handles all database operations with Convex
"""

import os
import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime
import logging

logger = logging.getLogger("convex-client")


class ConvexClient:
    """Client for interacting with Convex database"""
    
    def __init__(self, deployment_url: Optional[str] = None):
        self.deployment_url = deployment_url or os.getenv("CONVEX_URL")
        if not self.deployment_url:
            raise ValueError("CONVEX_URL not set in environment")
        
        self.client = httpx.AsyncClient(timeout=30.0)
        logger.info(f"Convex client initialized: {self.deployment_url}")
    
    async def _query(self, function_name: str, args: Dict[str, Any] = None) -> Any:
        """Execute a Convex query"""
        url = f"{self.deployment_url}/api/query"
        payload = {
            "path": function_name,
            "args": args or {},
            "format": "json"
        }
        
        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            return result.get("value")
        except Exception as e:
            logger.error(f"Query error: {function_name} - {e}")
            raise
    
    async def _mutation(self, function_name: str, args: Dict[str, Any]) -> Any:
        """Execute a Convex mutation"""
        url = f"{self.deployment_url}/api/mutation"
        payload = {
            "path": function_name,
            "args": args,
            "format": "json"
        }
        
        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            return result.get("value")
        except Exception as e:
            logger.error(f"Mutation error: {function_name} - {e}")
            raise
    
    # ========================================================================
    # PATIENT OPERATIONS
    # ========================================================================
    
    async def get_patient_by_bed(self, bed_number: str) -> Optional[Dict]:
        """Get patient by bed number"""
        return await self._query("patients:getPatientByBed", {"bedNumber": bed_number})
    
    async def get_patient_by_id(self, patient_id: str) -> Optional[Dict]:
        """Get patient by ID"""
        return await self._query("patients:getPatientById", {"patientId": patient_id})
    
    async def get_all_patients(self) -> List[Dict]:
        """Get all patients"""
        return await self._query("patients:getAllPatients")
    
    async def upsert_patient(
        self,
        patient_id: str,
        name: str,
        age: int,
        bed_number: str,
        ward: str,
        diagnosis: str,
        **kwargs
    ) -> str:
        """Create or update a patient"""
        args = {
            "patientId": patient_id,
            "name": name,
            "age": age,
            "bedNumber": bed_number,
            "ward": ward,
            "diagnosis": diagnosis,
            "admissionDate": kwargs.get("admission_date", datetime.now().isoformat()),
            "allergies": kwargs.get("allergies", []),
            "gender": kwargs.get("gender"),
            "attendingPhysician": kwargs.get("attending_physician"),
            "nurseAssigned": kwargs.get("nurse_assigned"),
        }
        return await self._mutation("patients:upsertPatient", args)
    
    # ========================================================================
    # VITAL SIGNS OPERATIONS
    # ========================================================================
    
    async def add_vital_signs(
        self,
        patient_id: str,
        temperature: float,
        bp_systolic: int,
        bp_diastolic: int,
        oxygen_saturation: int,
        heart_rate: int,
        recorded_by: Optional[str] = None,
        respiratory_rate: Optional[int] = None,
    ) -> str:
        """Add vital signs for a patient"""
        args = {
            "patientId": patient_id,
            "temperature": temperature,
            "bpSystolic": bp_systolic,
            "bpDiastolic": bp_diastolic,
            "oxygenSaturation": oxygen_saturation,
            "heartRate": heart_rate,
        }
        
        if recorded_by:
            args["recordedBy"] = recorded_by
        if respiratory_rate:
            args["respiratoryRate"] = respiratory_rate
        
        return await self._mutation("patients:addVitalSigns", args)
    
    async def get_vital_history(
        self,
        patient_id: str,
        limit: int = 24
    ) -> List[Dict]:
        """Get vital signs history"""
        return await self._query(
            "patients:getVitalHistory",
            {"patientId": patient_id, "limit": limit}
        )
    
    # ========================================================================
    # MEDICATION OPERATIONS
    # ========================================================================
    
    async def record_medication_administration(
        self,
        patient_id: str,
        medication_name: str,
        dosage: str,
        administered_by: str,
        notes: Optional[str] = None,
    ) -> str:
        """Record medication administration"""
        args = {
            "patientId": patient_id,
            "medicationName": medication_name,
            "dosage": dosage,
            "administeredBy": administered_by,
        }
        
        if notes:
            args["notes"] = notes
        
        return await self._mutation("patients:recordMedicationAdministration", args)
    
    async def get_medication_history(
        self,
        patient_id: str,
        limit: int = 50
    ) -> List[Dict]:
        """Get medication administration history"""
        return await self._query(
            "patients:getMedicationHistory",
            {"patientId": patient_id, "limit": limit}
        )
    
    async def add_medication(
        self,
        patient_id: str,
        name: str,
        dosage: str,
        frequency: str,
        route: str,
        prescribing_doctor: Optional[str] = None,
    ) -> str:
        """Add a medication to patient's regimen"""
        args = {
            "patientId": patient_id,
            "name": name,
            "dosage": dosage,
            "frequency": frequency,
            "route": route,
        }
        
        if prescribing_doctor:
            args["prescribingDoctor"] = prescribing_doctor
        
        return await self._mutation("patients:addMedication", args)
    
    # ========================================================================
    # EMERGENCY ALERT OPERATIONS
    # ========================================================================
    
    async def create_emergency_alert(
        self,
        alert_type: str,
        location: str,
        initiated_by: str,
        patient_id: Optional[str] = None,
        details: Optional[str] = None,
    ) -> str:
        """Create an emergency alert"""
        args = {
            "alertType": alert_type,
            "location": location,
            "initiatedBy": initiated_by,
        }
        
        if patient_id:
            args["patientId"] = patient_id
        if details:
            args["details"] = details
        
        return await self._mutation("patients:createEmergencyAlert", args)
    
    async def get_active_alerts(self) -> List[Dict]:
        """Get all active emergency alerts"""
        return await self._query("patients:getActiveAlerts")
    
    async def resolve_alert(
        self,
        alert_id: str,
        outcome: Optional[str] = None
    ) -> str:
        """Resolve an emergency alert"""
        args = {"alertId": alert_id}
        if outcome:
            args["outcome"] = outcome
        
        return await self._mutation("patients:resolveEmergencyAlert", args)
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    def normalize_bed_identifier(self, identifier: str) -> str:
        """Normalize bed identifier for consistent lookups"""
        # Convert "bed 12" -> "bed_12", "ward B 3" -> "ward_b_3"
        return identifier.lower().replace(" ", "_")
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

async def get_convex_client() -> ConvexClient:
    """Get a Convex client instance"""
    return ConvexClient()
