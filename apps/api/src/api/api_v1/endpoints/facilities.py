from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException
from src.schemas.facilities import (
    Facility, 
    FacilityCreate,
    FacilityUpdate,
    FacilitySearchResults,
    FacilityPagination,
)
from src.config.supabase_config import get_supabase_client
from src.crud.facilities import facilities_crud

router = APIRouter()


@router.get("/", status_code=200)
async def get_facilities(page: int = 1, page_size: int = 10, search: str = "") -> FacilityPagination:
    """Get all facilities"""
    try:
        db = await get_supabase_client()
        return await facilities_crud.get_all_paginated(db=db, page=page, page_size=page_size, search=search)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching facilities. {str(e)}",
        )


@router.get("/{facility_id}", status_code=200)
async def get_facility(facility_id: str) -> Facility:
    """Get a specific facility by ID"""
    try:
        db = await get_supabase_client()
        facility = await facilities_crud.get(db=db, id=facility_id)
        if not facility:
            raise HTTPException(status_code=404, detail="Facility not found")
        return facility
    except HTTPException:
        # Re-raise HTTPException from CRUD layer or explicit 404
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching facility. {str(e)}",
        )


@router.post("/", status_code=201)
async def create_facility(facility: FacilityCreate) -> Facility:
    """Create a new facility"""
    try:
        db = await get_supabase_client()
        return await facilities_crud.create(db=db, obj_in=facility)
    except HTTPException:
        # Re-raise HTTPException from CRUD layer
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create facility. {str(e)}",
        )


@router.put("/{facility_id}", status_code=200)
async def update_facility(facility_id: str, facility: FacilityUpdate) -> Facility:
    """Update a facility"""
    try:
        db = await get_supabase_client()
        facility.id = facility_id
        return await facilities_crud.update(db=db, obj_in=facility)
    except HTTPException:
        # Re-raise HTTPException from CRUD layer
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update facility. {str(e)}",
        )