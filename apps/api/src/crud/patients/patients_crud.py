from typing import Optional, List
from uuid import UUID

from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.base import CRUDBase
from src.schemas import Patient, PatientCreate, PatientUpdate


class CRUDPatients(CRUDBase[Patient, PatientCreate, PatientUpdate]):

    async def get(self, db: AsyncClient, *, id: str) -> Optional[Patient]:
        """Get a patient by ID"""
        try:
            return await super().get("patients", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Patient not found. {str(e)}",
            )

    async def get_all(self, db: AsyncClient) -> List[Patient]:
        """Get all patients"""
        try:
            return await super().get_all("patients", db)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching patients. {str(e)}",
            )

    async def create(self, db: AsyncClient, *, obj_in: PatientCreate) -> Patient:
        """Create a new patient"""
        try:
            return await super().create("patients", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create patient. {str(e)}",
            )

    async def update(self, db: AsyncClient, *, obj_in: PatientUpdate) -> Patient:
        """Update a patient"""
        try:
            return await super().update("patients", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update patient. {str(e)}",
            )

    async def delete(self, db: AsyncClient, *, id: str) -> Patient:
        """Delete a patient"""
        try:
            return await super().delete("patients", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete patient. {str(e)}",
            )


patients_crud = CRUDPatients(Patient)
