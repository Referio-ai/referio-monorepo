from typing import ClassVar, Sequence, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class ReferralStatusHistory(BaseModel):
    """Schema for referral status history entries"""
    status_history_id: UUID
    referral_id: UUID
    status_type: str  # The specific status type (Scheduled, Declined Services, etc.)
    database_status: str  # The mapped database status (active, archive, etc.)
    notes: Optional[str] = None
    updated_by_id: Optional[UUID] = None  # User ID who made the change
    updated_by_name: Optional[str] = None  # User name who made the change
    appointment_date: Optional[str] = None  # For scheduled appointments
    appointment_type: Optional[str] = None  # For scheduled appointments
    created_at: datetime
    table_name: ClassVar[str] = "referral_status_history"


class ReferralStatusHistoryCreate(BaseModel):
    """Schema for creating new status history entries"""
    referral_id: UUID
    status_type: str
    database_status: str
    notes: Optional[str] = None
    updated_by_id: Optional[UUID] = None
    updated_by_name: Optional[str] = None
    appointment_date: Optional[str] = None
    appointment_type: Optional[str] = None


class ReferralStatusHistoryUpdate(BaseModel):
    """Schema for updating status history entries"""
    status_type: Optional[str] = None
    database_status: Optional[str] = None
    notes: Optional[str] = None
    updated_by_id: Optional[UUID] = None
    updated_by_name: Optional[str] = None
    appointment_date: Optional[str] = None
    appointment_type: Optional[str] = None


class ReferralStatusHistorySearchResults(BaseModel):
    """Schema for status history search results"""
    results: Sequence[ReferralStatusHistory]
    total_count: int
    page: int
    page_size: int 