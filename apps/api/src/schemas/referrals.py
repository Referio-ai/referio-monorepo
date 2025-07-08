from typing import ClassVar, Sequence, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


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

class ReferralStatusUpdate(BaseModel):
    id: str
    referral_status: Optional[str] = None

class ReferralSearchResults(BaseModel):
    results: Sequence[Referral]


class ReferralPagination(BaseModel):
    items: Sequence[Referral]
    pagination: Dict[str, Any]
