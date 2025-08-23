from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException
from src.schemas.facilitators import (
    Facilitator, 
    FacilitatorCreate,
    FacilitatorCreateWithMultipleFacilities,
    FacilitatorUpdate,
    FacilitatorUpdateWithMultipleFacilities,
    FacilitatorSearchResults,
    FacilitatorPagination,
    PasswordChangeRequest,
)
from src.config.supabase_config import get_supabase_client
from src.services.facilitator_service import facilitator_service

router = APIRouter()


@router.get("/", status_code=200)
async def get_facilitators(
    page: int = 1, 
    page_size: int = 10, 
    search: str = "",
    facility_id: str = None
) -> FacilitatorPagination:
    """Get all facilitators with optional facility filtering"""
    try:
        db = await get_supabase_client()
        return await facilitator_service.get_facilitators_paginated(
            db=db, 
            page=page, 
            page_size=page_size, 
            search=search,
            facility_id=facility_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching facilitators. {str(e)}",
        )


@router.get("/{facilitator_id}", status_code=200)
async def get_facilitator(facilitator_id: str) -> Facilitator:
    """Get a specific facilitator by ID"""
    try:
        db = await get_supabase_client()
        return await facilitator_service.get_facilitator_by_id(db=db, facilitator_id=facilitator_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching facilitator. {str(e)}",
        )


@router.get("/facility/{facility_id}", status_code=200)
async def get_facilitators_by_facility(facility_id: str) -> List[Facilitator]:
    """Get all facilitators for a specific facility"""
    try:
        db = await get_supabase_client()
        return await facilitator_service.get_facilitators_by_facility(db=db, facility_id=facility_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching facilitators for facility. {str(e)}",
        )


@router.get("/propelauth/{propelauth_user_id}", status_code=200)
async def get_facilitator_by_propelauth_user_id(propelauth_user_id: str) -> Facilitator:
    """Get a facilitator by PropelAuth user ID"""
    try:
        db = await get_supabase_client()
        facilitator = await facilitator_service.get_facilitator_by_propelauth_user_id(db=db, propelauth_user_id=propelauth_user_id)
        if not facilitator:
            raise HTTPException(
                status_code=404,
                detail="Facilitator not found for this PropelAuth user ID",
            )
        return facilitator
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching facilitator by PropelAuth user ID. {str(e)}",
        )


@router.post("/", status_code=201)
async def create_facilitator(facilitator: FacilitatorCreate) -> Facilitator:
    """Create a new facilitator with PropelAuth account"""
    try:
        db = await get_supabase_client()
        return await facilitator_service.create_facilitator_with_propelauth(db=db, facilitator_data=facilitator)
    except HTTPException:
        # Re-raise HTTPException from service layer
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create facilitator with PropelAuth account. {str(e)}",
        )


@router.post("/multiple-facilities", status_code=201)
async def create_facilitator_with_multiple_facilities(facilitator_data: FacilitatorCreateWithMultipleFacilities):
    """Create a new facilitator with PropelAuth account and multiple facility associations"""
    try:
        db = await get_supabase_client()
        
        # Convert to FacilitatorCreate format
        facilitator_create = FacilitatorCreate(
            facilitator_first_name=facilitator_data.facilitator_first_name,
            facilitator_last_name=facilitator_data.facilitator_last_name,
            facilitator_full_name=facilitator_data.facilitator_full_name,
            facilitator_email=facilitator_data.facilitator_email,
            facilitator_status=facilitator_data.facilitator_status,
            deleted=facilitator_data.deleted,
            password=facilitator_data.password,
            facilitator_phone_number=facilitator_data.facilitator_phone_number,
            propelauth_user_id=facilitator_data.propelauth_user_id,
            facility_id=UUID("00000000-0000-0000-0000-000000000000")  # Placeholder, will be ignored
        )
        
        return await facilitator_service.create_facilitator_with_multiple_facilities(
            db=db, 
            facilitator_data=facilitator_create, 
            facility_ids=facilitator_data.facility_ids
        )
    except HTTPException:
        # Re-raise HTTPException from service layer
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create facilitator with multiple facilities. {str(e)}",
        )


@router.put("/{facilitator_id}", status_code=200)
async def update_facilitator(facilitator_id: str, facilitator: FacilitatorUpdate) -> Facilitator:
    """Update a facilitator"""
    try:
        db = await get_supabase_client()
        return await facilitator_service.update_facilitator(db=db, facilitator_id=facilitator_id, facilitator_data=facilitator)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update facilitator. {str(e)}",
        )


@router.put("/{facilitator_id}/multiple-facilities", status_code=200)
async def update_facilitator_with_multiple_facilities(facilitator_id: str, facilitator: FacilitatorUpdateWithMultipleFacilities) -> dict:
    """Update a facilitator with multiple facility associations"""
    try:
        db = await get_supabase_client()
        return await facilitator_service.update_facilitator_with_multiple_facilities(db=db, facilitator_id=facilitator_id, facilitator_data=facilitator)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update facilitator with multiple facilities. {str(e)}",
        )


@router.get("/{facilitator_id}/user-facilities", status_code=200)
async def get_user_facilities_by_facilitator_id(facilitator_id: str) -> List[dict]:
    """Get all user-facility associations for a specific facilitator"""
    try:
        db = await get_supabase_client()
        return await facilitator_service.get_user_facilities_by_facilitator_id(db=db, facilitator_id=facilitator_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching user facilities. {str(e)}",
        )


@router.delete("/{facilitator_id}", status_code=200)
async def delete_facilitator(facilitator_id: str) -> Facilitator:
    """Delete a facilitator"""
    try:
        db = await get_supabase_client()
        return await facilitator_service.delete_facilitator(db=db, facilitator_id=facilitator_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to delete facilitator. {str(e)}",
        )


@router.post("/{facilitator_id}/change-password", status_code=200)
async def change_facilitator_password(facilitator_id: str, password_request: PasswordChangeRequest) -> dict:
    """Change a facilitator's password"""
    try:
        success = await facilitator_service.change_facilitator_password(
            facilitator_id=facilitator_id,
            new_password=password_request.new_password
        )
        return {"success": success, "message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to change password. {str(e)}",
        )


@router.get("/test/propelauth", status_code=200)
async def test_propelauth_connection():
    """Test PropelAuth API connection and configuration"""
    try:
        return await facilitator_service.test_propelauth_connection()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to test PropelAuth connection. {str(e)}",
        )


@router.get("/test/propelauth/user/{user_id}", status_code=200)
async def test_propelauth_user_by_id(user_id: str):
    """Test getting PropelAuth user by ID"""
    try:
        return await facilitator_service.get_propelauth_user_by_id(user_id=user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get PropelAuth user by ID. {str(e)}",
        ) 