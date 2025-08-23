from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException
from src.schemas.facilities import (
    Facility, 
    FacilityCreate,
    FacilityUpdate,
    FacilitySearchResults,
    FacilityPagination,
)
from src.services.facilities_service import facilities_service

router = APIRouter()


@router.get("/", status_code=200)
async def get_facilities(
    page: int = 1, 
    page_size: int = 10, 
    search: str = "", 
    organization_id: Optional[str] = None
) -> FacilityPagination:
    """Get all facilities"""
    return await facilities_service.get_facilities_paginated(
        page=page, 
        page_size=page_size, 
        search=search, 
        organization_id=organization_id
    )


@router.post("/", status_code=201)
async def create_facility(facility: FacilityCreate) -> Facility:
    """Create a new facility"""
    return await facilities_service.create_facility(facility)


@router.get("/{facility_id}", status_code=200)
async def get_facility(facility_id: str) -> Facility:
    """Get a specific facility by ID"""
    return await facilities_service.get_facility_by_id(facility_id)


@router.put("/{facility_id}", status_code=200)
async def update_facility(facility_id: str, facility: FacilityUpdate) -> Facility:
    """Update a facility"""
    return await facilities_service.update_facility(facility_id, facility)


@router.delete("/{facility_id}", status_code=200)
async def delete_facility(facility_id: str) -> Facility:
    """Delete a facility (soft delete)"""
    return await facilities_service.delete_facility(facility_id)


@router.get("/by-user/{user_id}", status_code=200)
async def get_facilities_by_user(user_id: str) -> List[Facility]:
    """Get all facilities for a user"""
    return await facilities_service.get_facilities_by_user(user_id) 