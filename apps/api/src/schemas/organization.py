from typing import ClassVar, Sequence, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class Organization(BaseModel):
    organization_id: UUID
    organization_name: str
    organization_address: Dict[str, Any]
    organization_primary_contact_fname: str
    organization_primary_contact_mname: Optional[str] = None
    organization_primary_contact_lname: str
    organization_primary_contact_phone_number: str
    organization_primary_contact_email: EmailStr
    organization_prefix: str
    table_name: ClassVar[str] = "organization"


class OrganizationCreate(BaseModel):
    organization_name: str
    organization_address: Dict[str, Any]
    organization_primary_contact_fname: str
    organization_primary_contact_mname: Optional[str] = None
    organization_primary_contact_lname: str
    organization_primary_contact_phone_number: str = Field(..., pattern=r'^\+?1?\d{9,15}$')
    organization_primary_contact_email: EmailStr
    organization_prefix: str


class OrganizationUpdate(BaseModel):
    organization_name: Optional[str] = None
    organization_address: Optional[Dict[str, Any]] = None
    organization_primary_contact_fname: Optional[str] = None
    organization_primary_contact_mname: Optional[str] = None
    organization_primary_contact_lname: Optional[str] = None
    organization_primary_contact_phone_number: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')
    organization_primary_contact_email: Optional[EmailStr] = None
    organization_prefix: Optional[str] = None


class OrganizationSearchResults(BaseModel):
    results: Sequence[Organization] 