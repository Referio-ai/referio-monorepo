from typing import ClassVar, Sequence, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class ReferralMessages(BaseModel):
    referral_messages_id: UUID
    created_at: str
    message: str
    sender: str
    referral_id: UUID


class ReferralMessagesCreate(BaseModel):
    message: str
    sender: str
    referral_id: UUID

class ReferralMessagesUpdate(BaseModel):
    message: str
    sender: str
    referral_id: UUID

