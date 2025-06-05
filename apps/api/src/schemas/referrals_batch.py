from typing import ClassVar, Sequence, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ReferralBatch(BaseModel):
    referral_batch_id: UUID
    referral_batch_counter: int
    table_name: ClassVar[str] = "referrals_batch"


class ReferralBatchCreate(BaseModel):
    referral_batch_counter: int


class ReferralBatchUpdate(BaseModel):
    referral_batch_counter: Optional[int] = None


class ReferralBatchSearchResults(BaseModel):
    results: Sequence[ReferralBatch] 