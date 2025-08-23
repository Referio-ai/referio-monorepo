from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.organizations import organizations_crud
from src.schemas.organization import (
    Organization,
    OrganizationCreate,
    OrganizationUpdate,
)
from src.config.supabase_config import get_supabase_client


class OrganizationsService:
    """Service layer for organizations operations"""

    @staticmethod
    async def get_organizations_paginated(
        page: int = 1, 
        page_size: int = 10, 
        search: str = ""
    ) -> dict:
        """Get all organizations with pagination"""
        try:
            db = await get_supabase_client()
            return await organizations_crud.get_all_paginated(
                db=db, 
                page=page, 
                page_size=page_size, 
                search=search
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching organizations. {str(e)}",
            )

    @staticmethod
    async def create_organization(organization_data: OrganizationCreate) -> Organization:
        """Create a new organization"""
        print(f"Creating organization with data: {organization_data}")
        try:
            db = await get_supabase_client()
            print("Got database client")
            result = await organizations_crud.create(db=db, obj_in=organization_data)
            print(f"Organization created in database: {result}")
            return result
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            print("HTTPException occurred")
            raise
        except Exception as e:
            print(f"Exception occurred: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create organization. {str(e)}",
            )

    @staticmethod
    async def get_organization_by_id(organization_id: str) -> Organization:
        """Get a specific organization by ID"""
        try:
            db = await get_supabase_client()
            organization = await organizations_crud.get(db=db, id=organization_id)
            if not organization:
                raise HTTPException(status_code=404, detail="Organization not found")
            return organization
        except HTTPException:
            # Re-raise HTTPException from CRUD layer or explicit 404
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching organization. {str(e)}",
            )

    @staticmethod
    async def update_organization(organization_id: str, organization_data: OrganizationUpdate) -> Organization:
        """Update an organization"""
        try:
            db = await get_supabase_client()
            
            # First check if the organization exists
            existing_organization = await organizations_crud.get(db=db, id=organization_id)
            if not existing_organization:
                raise HTTPException(status_code=404, detail="Organization not found")
            
            # Use the CRUD layer to update the organization, passing the organization_id
            return await organizations_crud.update(db=db, obj_in=organization_data, id=organization_id)
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update organization. {str(e)}",
            )

    @staticmethod
    async def delete_organization(organization_id: str) -> Organization:
        """Delete an organization (soft delete)"""
        try:
            db = await get_supabase_client()
            return await organizations_crud.delete(db=db, id=organization_id)
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete organization. {str(e)}",
            )

    @staticmethod
    async def get_all_organizations() -> List[Organization]:
        """Get all organizations without pagination"""
        try:
            db = await get_supabase_client()
            return await organizations_crud.get_all(db=db)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching organizations. {str(e)}",
            )


# Create a singleton instance
organizations_service = OrganizationsService()
