from typing import List

from fastapi import APIRouter, HTTPException
from src.schemas.organization import Organization, OrganizationCreate, OrganizationUpdate
from src.services.organizations_service import organizations_service

router = APIRouter()


@router.get("/", status_code=200)
async def get_organizations(page: int = 1, page_size: int = 10, search: str = "") -> dict:
    """Get all organizations with pagination"""
    return await organizations_service.get_organizations_paginated(page=page, page_size=page_size, search=search)


@router.post("/", status_code=201)
async def create_organization(organization: OrganizationCreate) -> Organization:
    """Create a new organization"""
    print(f"Received organization creation request: {organization}")
    try:
        result = await organizations_service.create_organization(organization)
        print(f"Organization created successfully: {result}")
        return result
    except Exception as e:
        print(f"Error creating organization: {e}")
        raise


@router.get("/{organization_id}", status_code=200)
async def get_organization(organization_id: str) -> Organization:
    """Get a specific organization by ID"""
    return await organizations_service.get_organization_by_id(organization_id)


@router.put("/{organization_id}", status_code=200)
async def update_organization(organization_id: str, organization: OrganizationUpdate) -> Organization:
    """Update an organization"""
    return await organizations_service.update_organization(organization_id, organization)


@router.delete("/{organization_id}", status_code=200)
async def delete_organization(organization_id: str) -> Organization:
    """Delete an organization (soft delete)"""
    return await organizations_service.delete_organization(organization_id)


@router.get("/all/list", status_code=200)
async def get_all_organizations() -> List[Organization]:
    """Get all organizations without pagination"""
    return await organizations_service.get_all_organizations()


 