from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException
from src.schemas.facilities import (
    Facility, 
    FacilityCreate,
    FacilityUpdate,
    FacilitySearchResults,
)
from src.config.supabase_config import get_supabase_client
from src.crud.facilities import facilities_crud

router = APIRouter()


@router.get("/", status_code=200)
async def get_facilities() -> List[Facility]:
    """Get all facilities"""
    db = await get_supabase_client()
    return await facilities_crud.get_all(db=db)


@router.get("/{facility_id}", status_code=200)
async def get_facility(facility_id: str) -> Facility:
    """Get a specific facility by ID"""
    db = await get_supabase_client()
    return await facilities_crud.get(db=db, id=facility_id)


@router.post("/", status_code=201)
async def create_facility(facility: FacilityCreate) -> Facility:
    """Create a new facility"""
    db = await get_supabase_client()
    return await facilities_crud.create(db=db, obj_in=facility)


@router.put("/{facility_id}", status_code=200)
async def update_facility(facility_id: str, facility: FacilityUpdate) -> Facility:
    """Update a facility"""
    db = await get_supabase_client()
    facility.id = facility_id
    return await facilities_crud.update(db=db, obj_in=facility)