from typing import ClassVar, Sequence, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ReferralState(BaseModel):
    referral_status_id: UUID
    referral_id: UUID
    referral_status: str
    table_name: ClassVar[str] = "referrals_states"


class ReferralStateCreate(BaseModel):
    referral_id: UUID
    referral_status: str


class ReferralStateUpdate(BaseModel):
    referral_id: Optional[UUID] = None
    referral_status: Optional[str] = None


class ReferralStateSearchResults(BaseModel):
    results: Sequence[ReferralState] 