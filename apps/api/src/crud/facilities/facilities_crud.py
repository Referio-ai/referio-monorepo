from typing import Optional, List
from uuid import UUID

from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.base import CRUDBase
from src.schemas import Facility, FacilityCreate, FacilityUpdate
import json


class CRUDFacilityBatch(CRUDBase[Facility, FacilityCreate, FacilityUpdate]):

    async def get(self, db: AsyncClient, *, id: str) -> Optional[Facility]:
        """Get a facility  by ID"""
        try:
            return await super().get("facility_entity", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Facility  not found. {str(e)}",
            )

    async def get_all(self, db: AsyncClient) -> List[Facility]:
        """Get all facility es"""
        try:
            return await super().get_all("facility_entity", db)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facility es. {str(e)}",
            )

    async def create(self, db: AsyncClient, *, obj_in: FacilityCreate) -> Facility:
        """Create a new facility"""

        # convert the UUIDs to strings
        obj_in.organization_id = str(obj_in.organization_id)
        obj_in.propelauth_facility_id = str(obj_in.propelauth_facility_id)

        try:
            #serialize the UUIDs to strings
            return await super().create("facility_entity", db, obj_in=obj_in)
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create facility . {str(e)}",
            )

    async def update(self, db: AsyncClient, *, obj_in: FacilityUpdate) -> Facility:
        """Update a facility """
        try:
            return await super().update("facility_entity", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update facility . {str(e)}",
            )

    async def delete(self, db: AsyncClient, *, id: str) -> Facility:
        """Delete a facility """
        try:
            return await super().delete("facility_entity", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete facility . {str(e)}",
            )


facilities_crud = CRUDFacilityBatch(Facility) 