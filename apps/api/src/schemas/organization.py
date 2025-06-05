from pydantic import BaseModel

class Organization(BaseModel):
    organization_id: str
    organization_name: str
    organization_address: dict
    organization_primary_contact_fname: str
    organization_primary_contact_mname: str
    organization_primary_contact_lname: str
    organization_primary_contact_email: str
    organization_primary_contact_phone_number: str
    organization_prefix: str


class OrganizationCreate(BaseModel):
    organization_name: str
    organization_address: dict
    organization_primary_contact_fname: str
    organization_primary_contact_mname: str
    organization_primary_contact_lname: str
    organization_primary_contact_email: str
    organization_primary_contact_phone_number: str
    organization_prefix: str


class OrganizationUpdate(BaseModel):
    organization_name: str
    organization_address: dict
    organization_primary_contact_fname: str
    organization_primary_contact_mname: str
    organization_primary_contact_lname: str
    organization_primary_contact_email: str
    organization_primary_contact_phone_number: str
    organization_prefix: str