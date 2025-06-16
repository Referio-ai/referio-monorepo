from typing import ClassVar, Sequence, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class Facility(BaseModel):
    facility_id: UUID
    organization_id: UUID
    facility_name: str
    facility_address: Dict[str, Any]
    facility_primary_contact_fname: str
    facility_primary_contact_mname: Optional[str] = None
    facility_primary_contact_lname: str
    facility_primary_contact_phone_number: str
    facility_primary_contact_email: EmailStr
    propelauth_facility_id: UUID
    table_name: ClassVar[str] = "facility"


class FacilityCreate(BaseModel):
    organization_id: UUID
    facility_name: str
    facility_address: Dict[str, Any]
    facility_primary_contact_fname: str
    facility_primary_contact_mname: Optional[str] = None
    facility_primary_contact_lname: str
    facility_primary_contact_phone_number: str = Field(..., pattern=r'^\+?1?\d{9,15}$')
    facility_primary_contact_email: EmailStr
    propelauth_facility_id: UUID


class FacilityUpdate(BaseModel):
    organization_id: Optional[UUID] = None
    facility_name: Optional[str] = None
    facility_address: Optional[Dict[str, Any]] = None
    facility_primary_contact_fname: Optional[str] = None
    facility_primary_contact_mname: Optional[str] = None
    facility_primary_contact_lname: Optional[str] = None
    facility_primary_contact_phone_number: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')
    facility_primary_contact_email: Optional[EmailStr] = None
    propelauth_facility_id: Optional[UUID] = None


class FacilitySearchResults(BaseModel):
    results: Sequence[Facility]


class FacilityPagination(BaseModel):
    items: Sequence[Facility]
    pagination: Dict[str, Any]
