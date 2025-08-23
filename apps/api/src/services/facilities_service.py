from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.facilities import facilities_crud
from src.schemas.facilities import (
    Facility,
    FacilityCreate,
    FacilityUpdate,
    FacilityPagination,
)
from src.config.supabase_config import get_supabase_client


class FacilitiesService:
    """Service layer for facilities operations"""

    @staticmethod
    async def get_facilities_paginated(
        page: int = 1, 
        page_size: int = 10, 
        search: str = "",
        organization_id: Optional[str] = None
    ) -> FacilityPagination:
        """Get all facilities with pagination"""
        try:
            db = await get_supabase_client()
            return await facilities_crud.get_all_paginated(
                db=db, 
                page=page, 
                page_size=page_size, 
                search=search,
                organization_id=organization_id
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilities. {str(e)}",
            )

    @staticmethod
    async def create_facility(facility_data: FacilityCreate) -> Facility:
        """Create a new facility"""
        try:
            db = await get_supabase_client()
            return await facilities_crud.create(db=db, obj_in=facility_data)
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create facility. {str(e)}",
            )

    @staticmethod
    async def get_facility_by_id(facility_id: str) -> Facility:
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

    @staticmethod
    async def update_facility(facility_id: str, facility_data: FacilityUpdate) -> Facility:
        """Update a facility"""
        try:
            db = await get_supabase_client()
            
            # Set the facility_id in the update data
            facility_data.facility_id = facility_id
            
            # First check if the facility exists
            existing_facility = await facilities_crud.get(db=db, id=facility_id)
            if not existing_facility:
                raise HTTPException(status_code=404, detail="Facility not found")
            
            # Use the CRUD layer to update the facility
            return await facilities_crud.update(db=db, obj_in=facility_data)
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update facility. {str(e)}",
            )

    @staticmethod
    async def delete_facility(facility_id: str) -> Facility:
        """Delete a facility (soft delete)"""
        try:
            db = await get_supabase_client()
            return await facilities_crud.delete(db=db, id=facility_id)
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete facility. {str(e)}",
            )

    @staticmethod
    async def get_all_facilities() -> List[Facility]:
        """Get all facilities without pagination"""
        try:
            db = await get_supabase_client()
            return await facilities_crud.get_all(db=db)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilities. {str(e)}",
            )
        
    @staticmethod
    async def get_facilities_by_user_with_organizations(user_id: str) -> List[Facility]:
        """Get all facilities for a user with organization names"""
        try:
            db = await get_supabase_client()
            return await facilities_crud.get_facilities_by_user_with_organizations(db=db, user_id=user_id)
        except HTTPException:
            # Re-raise HTTPException from above
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilities with organizations for user. {str(e)}",
            )

    @staticmethod
    async def get_facilities_by_user(user_id: str) -> List[Facility]:
        """Get all facilities for a user (now with organization names)"""
        try:
            # Use the new method that includes organization names
            return await FacilitiesService.get_facilities_by_user_with_organizations(user_id)
        except HTTPException:
            # Re-raise HTTPException from above
            raise
        except Exception as e:
            print(f"Error fetching facilities for user: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilities for user. {str(e)}",
            )


# Create a singleton instance
facilities_service = FacilitiesService()
