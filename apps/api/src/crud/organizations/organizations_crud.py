from typing import Optional

from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.base import CRUDBase
from src.schemas import Organization, OrganizationCreate, OrganizationUpdate


class CRUDOrganizations(CRUDBase[Organization, OrganizationCreate, OrganizationUpdate]):

    async def get(self, db: AsyncClient, *, id: str) -> Optional[Organization]:
        try:
            return await super().get("organizations", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"{e.code}: Organization not found. {e.details}",
            )

    async def get_all(self, db: AsyncClient) -> list[Organization]:
        try:
            return await super().get_all("organizations", db)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"An error occurred while fetching organizations. {e}",
            )

    async def get_all_paginated(
        self, 
        db: AsyncClient, 
        *, 
        page: int = 1, 
        page_size: int = 10,
        search: str = ""
    ) -> dict:
        """Get paginated organizations with search"""
        try:
            return await super().get_all_paginated(
                "organizations", 
                db, 
                page=page, 
                page_size=page_size,
                search=search
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching organizations. {e}",
            )

    async def update(self, db: AsyncClient, *, obj_in: OrganizationUpdate, id: str = None) -> Organization:
        """Update an organization"""
        try:
            return await super().update("organizations", db, obj_in=obj_in, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update organization. {e}",
            )

    async def create(self, db: AsyncClient, *, obj_in: OrganizationCreate) -> Organization:
        """Create an organization"""
        print(f"CRUD create called with: {obj_in}")
        try:
            result = await super().create("organizations", db, obj_in=obj_in)
            print(f"CRUD create result: {result}")
            return result
        except Exception as e:
            print(f"CRUD create error: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create organization. {e}",
            )


organizations_crud = CRUDOrganizations(Organization)