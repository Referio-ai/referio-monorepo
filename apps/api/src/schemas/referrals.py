from typing import ClassVar, Sequence, Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class Referral(BaseModel):
    referral_id: UUID
    referral_outbound_facility_id: UUID
    referral_inbound_facility_id: UUID
    referral_outbound_date: Optional[datetime] = None
    referral_batch_prefix: str
    referral_slug: str
    patient_id: Optional[UUID] = None
    referral_scanned: bool
    referral_scanned_date: Optional[datetime] = None
    referral_submitted: bool
    referral_submitted_date: Optional[datetime] = None
    referral_status: Optional[str] = None
    deleted: Optional[bool] = False

    @field_validator('referral_id', 'referral_outbound_facility_id', 'referral_inbound_facility_id', 'patient_id', mode='before')
    @classmethod
    def validate_uuid_fields(cls, v):
        """Convert string UUIDs to UUID objects"""
        if v is None:
            return v
        if isinstance(v, str):
            return UUID(v)
        return v


class ReferralCreate(BaseModel):
    referral_outbound_facility_id: UUID
    referral_inbound_facility_id: UUID
    referral_batch_prefix: Optional[str] = None
    patient_id: Optional[UUID] = None
    referral_slug: Optional[str] = None
    referral_scanned: bool = False
    referral_scanned_date: Optional[datetime] = None
    referral_submitted: bool = False
    referral_submitted_date: Optional[datetime] = None
    referral_status: Optional[str] = None
    deleted: Optional[bool] = False


class ReferralUpdate(BaseModel):
    id: str
    referral_outbound_facility_id: Optional[UUID] = None
    referral_inbound_facility_id: Optional[UUID] = None
    referral_outbound_date: Optional[datetime] = None   
    patient_id: Optional[UUID] = None
    referral_scanned: Optional[bool] = None
    referral_scanned_date: Optional[datetime] = None
    referral_submitted: Optional[bool] = None
    referral_submitted_date: Optional[datetime] = None
    referral_status: Optional[str] = None
    deleted: Optional[bool] = None


class ReferralWithDetails(BaseModel):
    """Referral response with facility and patient details"""
    referral_id: UUID
    referral_outbound_facility_id: UUID
    referral_inbound_facility_id: UUID
    referral_outbound_date: Optional[datetime] = None
    referral_batch_prefix: str
    referral_slug: str
    patient_id: Optional[UUID] = None
    referral_scanned: bool
    referral_scanned_date: Optional[datetime] = None
    referral_submitted: bool
    referral_submitted_date: Optional[datetime] = None
    referral_status: Optional[str] = None
    referral_remark: Optional[str] = None
    referral_doctor_name: Optional[str] = None
    deleted: Optional[bool] = False
    
    # Facility details
    outbound_facility_name: Optional[str] = None
    inbound_facility_name: Optional[str] = None
    
    # Patient details (only if patient exists)
    patient_fname: Optional[str] = None
    patient_mname: Optional[str] = None
    patient_lname: Optional[str] = None
    patient_dob: Optional[datetime] = None
    patient_contact_phone: Optional[str] = None
    patient_contact_email: Optional[str] = None
    patient_gender: Optional[str] = None
    patient_insurance_member_id: Optional[str] = None
    
    # Document details
    documents: Optional[List[Dict[str, Any]]] = None
    document_count: Optional[int] = 0

    @field_validator('referral_id', 'referral_outbound_facility_id', 'referral_inbound_facility_id', 'patient_id', mode='before')
    @classmethod
    def validate_uuid_fields(cls, v):
        """Convert string UUIDs to UUID objects"""
        if v is None:
            return v
        if isinstance(v, str):
            return UUID(v)
        return v


class ReferralStatusUpdate(BaseModel):
    id: str
    referral_status: Optional[str] = None

class ReferralSearchResults(BaseModel):
    results: Sequence[Referral]


class ReferralPagination(BaseModel):
    items: Sequence[Referral]
    pagination: Dict[str, Any]


class ReferralWithDetailsPagination(BaseModel):
    items: Sequence[ReferralWithDetails]
    pagination: Dict[str, Any]
