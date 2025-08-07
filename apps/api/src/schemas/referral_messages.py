from typing import ClassVar, Sequence, Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel, Field


class ReferralMessages(BaseModel):
    referrals_messages_id: UUID
    created_at: str
    message: str
    sender: str
    referral_id: str
    sender_id: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = None


class ReferralMessagesCreate(BaseModel):
    message: str
    sender: str
    referral_id: str
    sender_id: Optional[str] = None

class ReferralMessagesUpdate(BaseModel):
    message: str
    sender: str
    referral_id: str
    sender_id: Optional[str] = None


# New request schemas for API endpoints
class AddMessageRequest(BaseModel):
    message: str = Field(..., description="The message content")
    sender: str = Field(..., description="The sender identifier")
    sender_id: str = Field(..., description="The sender's user ID")
    user_info: Optional[Dict[str, Any]] = Field(None, description="Optional user information")


class AddMessageWithContextRequest(BaseModel):
    message: str = Field(..., description="The message content")
    sender_id: str = Field(..., description="The sender's user ID")
    user_name: Optional[str] = Field(None, description="The user name")
    user_role: Optional[str] = Field(None, description="The user role (e.g., 'facilitator', 'admin')")
    additional_context: Optional[Dict[str, Any]] = Field(None, description="Additional context data")


class AddSystemMessageRequest(BaseModel):
    message: str = Field(..., description="The system message content")
    system_action: Optional[str] = Field(None, description="The system action that triggered this message")


class UpdateMessageRequest(BaseModel):
    updated_message: str = Field(..., description="The updated message content")
    sender_id: str = Field(..., description="The sender's user ID")


class MessageHistoryResponse(BaseModel):
    messages: list[ReferralMessages]
    total_count: int
    limit: Optional[int]
    offset: Optional[int]
    referral_id: str

