"""
Database models for Hospital Ward Voice Assistant
This file provides the structure for integrating with a real EMR/database system
"""

from datetime import datetime
from typing import List, Optional
from dataclasses import dataclass


@dataclass
class VitalSigns:
    """Patient vital signs"""
    temperature: float  # Fahrenheit
    blood_pressure_systolic: int
    blood_pressure_diastolic: int
    oxygen_saturation: int  # Percentage
    heart_rate: int  # BPM
    respiratory_rate: Optional[int] = None
    recorded_at: datetime = None
    recorded_by: Optional[str] = None
    
    @property
    def bp_formatted(self) -> str:
        return f"{self.blood_pressure_systolic}/{self.blood_pressure_diastolic}"


@dataclass
class Medication:
    """Medication information"""
    name: str
    dosage: str
    frequency: str
    route: str  # oral, IV, injection, etc.
    start_date: datetime
    end_date: Optional[datetime] = None
    prescribing_doctor: Optional[str] = None


@dataclass
class MedicationAdministration:
    """Record of medication administration"""
    medication_name: str
    dosage: str
    administered_at: datetime
    administered_by: str
    patient_id: str
    notes: Optional[str] = None


@dataclass
class Patient:
    """Patient information"""
    id: str
    name: str
    age: int
    gender: str
    bed_number: str
    ward: str
    admission_date: datetime
    diagnosis: str
    allergies: List[str]
    current_vitals: Optional[VitalSigns] = None
    medications: List[Medication] = None
    attending_physician: Optional[str] = None
    nurse_assigned: Optional[str] = None


@dataclass
class EmergencyAlert:
    """Emergency alert record"""
    alert_type: str  # code_blue, code_red, rapid_response, etc.
    location: str
    patient_id: Optional[str]
    initiated_by: str
    initiated_at: datetime
    details: Optional[str] = None
    response_time: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    outcome: Optional[str] = None


# ============================================================================
# DATABASE INTERFACE (To be implemented with your actual database)
# ============================================================================

class DatabaseInterface:
    """
    Interface for database operations
    Implement these methods to connect to your actual EMR/database system
    """
    
    async def get_patient_by_bed(self, bed_number: str) -> Optional[Patient]:
        """Retrieve patient by bed number"""
        raise NotImplementedError
    
    async def get_patient_by_id(self, patient_id: str) -> Optional[Patient]:
        """Retrieve patient by ID"""
        raise NotImplementedError
    
    async def update_vitals(self, patient_id: str, vitals: VitalSigns) -> bool:
        """Update patient vital signs"""
        raise NotImplementedError
    
    async def record_medication_administration(
        self, 
        admin: MedicationAdministration
    ) -> bool:
        """Record medication administration"""
        raise NotImplementedError
    
    async def create_emergency_alert(self, alert: EmergencyAlert) -> str:
        """Create emergency alert and return alert ID"""
        raise NotImplementedError
    
    async def get_patient_medications(self, patient_id: str) -> List[Medication]:
        """Get all current medications for a patient"""
        raise NotImplementedError
    
    async def get_vital_history(
        self, 
        patient_id: str, 
        hours: int = 24
    ) -> List[VitalSigns]:
        """Get vital signs history for specified time period"""
        raise NotImplementedError


# ============================================================================
# POSTGRESQL IMPLEMENTATION EXAMPLE
# ============================================================================

class PostgreSQLDatabase(DatabaseInterface):
    """
    Example PostgreSQL implementation
    Install: pip install asyncpg
    """
    
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.pool = None
    
    async def connect(self):
        """Initialize database connection pool"""
        import asyncpg
        self.pool = await asyncpg.create_pool(self.connection_string)
    
    async def get_patient_by_bed(self, bed_number: str) -> Optional[Patient]:
        """Retrieve patient by bed number"""
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(
                """
                SELECT p.*, v.* 
                FROM patients p
                LEFT JOIN vital_signs v ON p.id = v.patient_id
                WHERE p.bed_number = $1 
                AND v.recorded_at = (
                    SELECT MAX(recorded_at) 
                    FROM vital_signs 
                    WHERE patient_id = p.id
                )
                """,
                bed_number
            )
            
            if row:
                return Patient(
                    id=row['id'],
                    name=row['name'],
                    age=row['age'],
                    gender=row['gender'],
                    bed_number=row['bed_number'],
                    ward=row['ward'],
                    admission_date=row['admission_date'],
                    diagnosis=row['diagnosis'],
                    allergies=row['allergies'],
                    current_vitals=VitalSigns(
                        temperature=row['temperature'],
                        blood_pressure_systolic=row['bp_systolic'],
                        blood_pressure_diastolic=row['bp_diastolic'],
                        oxygen_saturation=row['oxygen_saturation'],
                        heart_rate=row['heart_rate'],
                        recorded_at=row['recorded_at']
                    ) if row.get('temperature') else None
                )
            return None
    
    async def update_vitals(self, patient_id: str, vitals: VitalSigns) -> bool:
        """Update patient vital signs"""
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO vital_signs (
                    patient_id, temperature, bp_systolic, bp_diastolic,
                    oxygen_saturation, heart_rate, recorded_at, recorded_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                """,
                patient_id,
                vitals.temperature,
                vitals.blood_pressure_systolic,
                vitals.blood_pressure_diastolic,
                vitals.oxygen_saturation,
                vitals.heart_rate,
                vitals.recorded_at or datetime.now(),
                vitals.recorded_by
            )
            return True
    
    async def record_medication_administration(
        self, 
        admin: MedicationAdministration
    ) -> bool:
        """Record medication administration"""
        async with self.pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO medication_administration (
                    patient_id, medication_name, dosage, 
                    administered_at, administered_by, notes
                ) VALUES ($1, $2, $3, $4, $5, $6)
                """,
                admin.patient_id,
                admin.medication_name,
                admin.dosage,
                admin.administered_at,
                admin.administered_by,
                admin.notes
            )
            return True
    
    async def create_emergency_alert(self, alert: EmergencyAlert) -> str:
        """Create emergency alert and return alert ID"""
        async with self.pool.acquire() as conn:
            alert_id = await conn.fetchval(
                """
                INSERT INTO emergency_alerts (
                    alert_type, location, patient_id, 
                    initiated_by, initiated_at, details
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
                """,
                alert.alert_type,
                alert.location,
                alert.patient_id,
                alert.initiated_by,
                alert.initiated_at,
                alert.details
            )
            return str(alert_id)


# ============================================================================
# SQL SCHEMA FOR REFERENCE
# ============================================================================

SQL_SCHEMA = """
-- Patients table
CREATE TABLE patients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(20),
    bed_number VARCHAR(50) UNIQUE,
    ward VARCHAR(100),
    admission_date TIMESTAMP NOT NULL,
    diagnosis TEXT,
    allergies TEXT[],
    attending_physician VARCHAR(255),
    nurse_assigned VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vital signs table
CREATE TABLE vital_signs (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id),
    temperature DECIMAL(4,1),
    bp_systolic INTEGER,
    bp_diastolic INTEGER,
    oxygen_saturation INTEGER,
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    recorded_at TIMESTAMP NOT NULL,
    recorded_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medications table
CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id),
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    route VARCHAR(50),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    prescribing_doctor VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medication administration records
CREATE TABLE medication_administration (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id),
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    administered_at TIMESTAMP NOT NULL,
    administered_by VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emergency alerts table
CREATE TABLE emergency_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    patient_id VARCHAR(50) REFERENCES patients(id),
    initiated_by VARCHAR(255) NOT NULL,
    initiated_at TIMESTAMP NOT NULL,
    details TEXT,
    response_time TIMESTAMP,
    resolved_at TIMESTAMP,
    outcome TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_patients_bed ON patients(bed_number);
CREATE INDEX idx_vitals_patient ON vital_signs(patient_id, recorded_at DESC);
CREATE INDEX idx_meds_patient ON medications(patient_id);
CREATE INDEX idx_alerts_time ON emergency_alerts(initiated_at DESC);
"""
