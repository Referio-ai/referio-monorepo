from typing import ClassVar, Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class UserFacility(BaseModel):
    user_facility_id: UUID
    user_id: UUID  # This will be the propelauth_user_id
    facility_id: UUID
    table_name: ClassVar[str] = "user_facility"


class UserFacilityCreate(BaseModel):
    user_id: str
    facility_id: str


class UserFacilityUpdate(BaseModel):
    user_id: Optional[str] = None
    facility_id: Optional[UUID] = None