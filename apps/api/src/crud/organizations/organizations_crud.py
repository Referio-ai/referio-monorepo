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
                detail=f"{e.code}: User not found. {e.details}",
            )

    async def get_all(self, db: AsyncClient) -> list[Organization]:
        try:
            return await super().get_all("organizations", db)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"An error occurred while fetching users. {e}",
            )


organizations_crud = CRUDOrganizations(Organization)