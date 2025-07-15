from typing import ClassVar, Sequence, Optional
from uuid import UUID
from datetime import date
from pydantic import BaseModel, EmailStr


class Patient(BaseModel):
    patient_id: UUID
    patient_fname: str
    patient_mname: Optional[str] = None
    patient_lname: str
    patient_dob: str # YYYY-MM-DD
    patient_contact_phone: str
    patient_contact_email: EmailStr
    patient_gender: str
    patient_insurance_member_id: Optional[str] = None
    table_name: ClassVar[str] = "patient"


class PatientCreate(BaseModel):
    patient_fname: str
    patient_mname: Optional[str] = None
    patient_lname: str
    patient_dob: str # YYYY-MM-DD
    patient_contact_phone: str
    patient_contact_email: EmailStr
    patient_gender: str
    patient_insurance_member_id: Optional[str] = None


class PatientUpdate(BaseModel):
    patient_fname: Optional[str] = None
    patient_mname: Optional[str] = None
    patient_lname: Optional[str] = None
    patient_dob: Optional[str] = None
    patient_contact_phone: Optional[str] = None
    patient_contact_email: Optional[EmailStr] = None
    patient_gender: Optional[str] = None
    patient_insurance_member_id: Optional[str] = None


class PatientSearchResults(BaseModel):
    results: Sequence[Patient]
