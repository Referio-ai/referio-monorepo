from typing import Optional, List
from uuid import UUID

from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.base import CRUDBase
from src.schemas.facilitators import Facilitator, FacilitatorCreate, FacilitatorUpdate


class CRUDFacilitators(CRUDBase[Facilitator, FacilitatorCreate, FacilitatorUpdate]):

    async def get(self, db: AsyncClient, *, id: str) -> Optional[Facilitator]:
        """Get a facilitator by ID"""
        try:
            return await super().get("facilitators", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Facilitator not found. {str(e)}",
            )

    async def get_all(self, db: AsyncClient) -> List[Facilitator]:
        """Get all facilitators"""
        try:
            return await super().get_all("facilitators", db)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilitators. {str(e)}",
            )
        
    async def get_all_paginated(self, db: AsyncClient, *, page: int = 1, page_size: int = 10, search: str = "") -> List[Facilitator]:
        """Get all facilitators paginated"""
        try:
            return await super().get_all_paginated("facilitators", db, page=page, page_size=page_size, search=search)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilitators. {str(e)}",
            )

    async def get_by_facility(self, db: AsyncClient, *, facility_id: str) -> List[Facilitator]:
        """Get all facilitators for a specific facility"""
        try:
            result = await db.table("facilitators").select("*").eq("facility_id", facility_id).neq("deleted", True).execute()
            data = result.data
            return [Facilitator(**item) for item in data]
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilitators for facility. {str(e)}",
            )

    async def get_by_propelauth_user_id(self, db: AsyncClient, *, propelauth_user_id: str) -> Optional[Facilitator]:
        """Get a facilitator by PropelAuth user ID"""
        try:
            result = await db.table("facilitators").select("*").eq("propelauth_user_id", propelauth_user_id).neq("deleted", True).execute()
            data = result.data
            return Facilitator(**data[0]) if data else None
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilitator by PropelAuth user ID. {str(e)}",
            )

    async def create(self, db: AsyncClient, *, obj_in: FacilitatorCreate) -> Facilitator:
        """Create a new facilitator"""
        # Convert the UUIDs to strings
        obj_in.facility_id = str(obj_in.facility_id)
        obj_in.propelauth_user_id = str(obj_in.propelauth_user_id)

        try:
            return await super().create("facilitators", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create facilitator. {str(e)}",
            )

    async def update(self, db: AsyncClient, *, obj_in: FacilitatorUpdate) -> Facilitator:
        """Update a facilitator"""
        try:
            return await super().update("facilitators", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update facilitator. {str(e)}",
            )

    async def delete(self, db: AsyncClient, *, id: str) -> Facilitator:
        """Delete a facilitator"""
        try:
            return await super().delete("facilitators", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete facilitator. {str(e)}",
            )


facilitators_crud = CRUDFacilitators(Facilitator) 