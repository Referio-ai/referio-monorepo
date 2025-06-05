from typing import ClassVar, Sequence, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class Reward(BaseModel):
    reward_id: UUID
    referral_id: UUID
    reward_claimed: bool
    reward_email: Optional[str] = None
    reward_phone_number: Optional[str] = None
    reward_claimed_date: Optional[datetime] = None
    table_name: ClassVar[str] = "rewards"


class RewardCreate(BaseModel):
    referral_id: UUID
    reward_claimed: bool = False
    reward_email: Optional[str] = None
    reward_phone_number: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')
    reward_claimed_date: Optional[datetime] = None


class RewardUpdate(BaseModel):
    referral_id: Optional[UUID] = None
    reward_claimed: Optional[bool] = None
    reward_email: Optional[str] = None
    reward_phone_number: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')
    reward_claimed_date: Optional[datetime] = None


class RewardSearchResults(BaseModel):
    results: Sequence[Reward] 