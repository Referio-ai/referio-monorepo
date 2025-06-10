from typing import ClassVar, Sequence, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ReferralBatch(BaseModel):
    referral_batch_id: UUID
    referral_batch_prefix: str
    referral_batch_size: int
    referral_outbound_facility_id: UUID
    referral_inbound_facility_id: UUID


class ReferralBatchCreate(BaseModel):
    referral_batch_size: int
    referral_outbound_facility_id: UUID
    referral_inbound_facility_id: UUID
    referral_batch_prefix: Optional[str] = None

class ReferralBatchUpdate(BaseModel):
    referral_batch_id: UUID


class ReferralBatchSearchResults(BaseModel):
    results: Sequence[ReferralBatch]


class GenerateBatchRequest(BaseModel):
    """Request model for generating a batch of referrals"""
    referral_batch_size: int
    referral_outbound_facility_id: UUID 
    referral_inbound_facility_id: UUID 

class GenerateBatchResponse(BaseModel):
    """Response model for batch generation"""
    batch: Optional[ReferralBatch] = None
    referrals_created: int = 0
    batch_prefix: str 