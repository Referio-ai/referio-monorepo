from typing import ClassVar, Sequence, Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, computed_field


class Facilitator(BaseModel):
    facilitator_id: UUID
    created_at: datetime
    updated_at: datetime
    facilitator_first_name: str
    facilitator_last_name: str
    facilitator_full_name: str  # Stored in database for search purposes
    propelauth_user_id: str
    facilitator_phone_number: str
    facilitator_email: str
    deleted: bool = False
    facilitator_status: str = "active"  # active, inactive, suspended
    facility_id: Optional[UUID] = None
    table_name: ClassVar[str] = "facilitators"


class FacilitatorCreate(BaseModel):
    facilitator_first_name: str
    facilitator_last_name: str
    facilitator_full_name: str  # Will be computed from first and last name
    facilitator_email: str
    facilitator_status: str = "active"
    facility_id: UUID
    deleted: bool = False
    password: str = None
    facilitator_phone_number: str
    propelauth_user_id: Optional[str] = None


class FacilitatorCreateWithMultipleFacilities(BaseModel):
    facilitator_first_name: str
    facilitator_last_name: str
    facilitator_full_name: str  # Will be computed from first and last name
    facilitator_email: str
    facilitator_status: str = "active"
    deleted: bool = False
    password: str = None
    facilitator_phone_number: str
    propelauth_user_id: Optional[str] = None
    facility_ids: List[str]


class FacilitatorUpdate(BaseModel):
    facilitator_first_name: Optional[str] = None
    facilitator_last_name: Optional[str] = None
    facilitator_full_name: Optional[str] = None
    facilitator_email: Optional[str] = None
    facilitator_status: Optional[str] = None
    facility_id: Optional[UUID] = None
    facilitator_phone_number: Optional[str] = None
    deleted: Optional[bool] = None


class FacilitatorUpdateWithMultipleFacilities(BaseModel):
    facilitator_first_name: Optional[str] = None
    facilitator_last_name: Optional[str] = None
    facilitator_full_name: Optional[str] = None
    facilitator_email: Optional[str] = None
    facilitator_status: Optional[str] = None
    facilitator_phone_number: Optional[str] = None
    deleted: Optional[bool] = None
    facility_ids: Optional[List[str]] = None


class PasswordChangeRequest(BaseModel):
    new_password: str


class FacilitatorSearchResults(BaseModel):
    results: Sequence[Facilitator]
    total: int


class FacilitatorPagination(BaseModel):
    items: Sequence[Facilitator]
    total: int
    page: int
    page_size: int
    total_pages: int 