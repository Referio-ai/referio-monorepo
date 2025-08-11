from typing import ClassVar, Sequence, Optional, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class Notification(BaseModel):
    notification_id: UUID
    type: str
    value: str
    message: str
    title: str
    have_link: Optional[str] = None
    created_at: datetime
    users_seen: List[str] = []
    facility_id: Optional[UUID] = None
    created_by_id: Optional[UUID] = None
    created_by_name: Optional[str] = None
    is_active: bool = True
    table_name: ClassVar[str] = "notifications"


class NotificationCreate(BaseModel):
    type: str = Field(..., description="Type of notification")
    value: str = Field(..., description="Value/identifier for the notification subscription")
    message: str = Field(..., description="Notification message text")
    title: str = Field(..., description="Notification title")
    have_link: Optional[str] = Field(None, description="Redirection link when notification is clicked")
    facility_id: Optional[UUID] = Field(None, description="Facility ID (NULL for system-wide)")
    created_by_id: Optional[UUID] = Field(None, description="User ID who created the notification")
    created_by_name: Optional[str] = Field(None, description="User name who created the notification")
    is_active: bool = Field(True, description="Whether the notification is still active")


class NotificationUpdate(BaseModel):
    notification_id: str
    message: Optional[str] = None
    title: Optional[str] = None
    have_link: Optional[str] = None
    is_active: Optional[bool] = None
    users_seen: Optional[List[str]] = None


class NotificationMarkSeen(BaseModel):
    notification_id: str
    user_id: str


class NotificationSearchResults(BaseModel):
    results: Sequence[Notification]
    total: int


class NotificationPagination(BaseModel):
    items: Sequence[Notification]
    total: int
    page: int
    page_size: int
    total_pages: int


class NotificationStats(BaseModel):
    total_notifications: int
    unread_notifications: int
    notifications_by_type: dict 