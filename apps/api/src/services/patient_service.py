from typing import Optional, List
from uuid import UUID
from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.patients.patients_crud import patients_crud
from src.schemas.patients import Patient, PatientCreate, PatientUpdate


class PatientService:
    """Service class for patient-related operations"""

    async def get_patient_by_id(self, db: AsyncClient, patient_id: str) -> Optional[Patient]:
        """Get a patient by their ID"""
        try:
            return await db.table("patients").select("*").eq("patient_id", patient_id).execute()
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching patient. {str(e)}"
            )

    async def get_all_patients(self, db: AsyncClient) -> List[Patient]:
        """Get all patients"""
        try:
            return await patients_crud.get_all(db)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching patients. {str(e)}"
            )

    async def create_patient(self, db: AsyncClient, patient_data: PatientCreate) -> Patient:
        """Create a new patient"""
        try:
            return await patients_crud.create(db, obj_in=patient_data)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create patient. {str(e)}"
            )

    async def update_patient_by_id(self, db: AsyncClient, patient_id: str, patient_data: PatientUpdate) -> Patient:
        """Update patient information by patient ID"""
        try:
            # First, get the existing patient to ensure it exists using direct database query
            result = await db.table("patients").select("*").eq("patient_id", patient_id).execute()
            if not result.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Patient with ID {patient_id} not found"
                )
            
            existing_patient = Patient(**result.data[0])
            
            # Create an update object with only the fields that are provided
            update_data = patient_data.model_dump(exclude_unset=True)
            
            # Only update if we have changes to make
            if update_data:
                # Use direct database update using patient_id field
                result = await db.table("patients").update(update_data).eq("patient_id", patient_id).execute()
                
                if result.data:
                    # Return the updated patient
                    return Patient(**result.data[0])
                else:
                    raise HTTPException(
                        status_code=400,
                        detail="Failed to update patient - no data returned"
                    )
            else:
                # No updates to make, return the existing patient
                return existing_patient
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update patient. {str(e)}"
            )

    async def delete_patient(self, db: AsyncClient, patient_id: str) -> Patient:
        """Delete a patient by ID"""
        try:
            return await patients_crud.delete(db, id=patient_id)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete patient. {str(e)}"
            )

    async def search_patients(self, db: AsyncClient, field: str, search_value: str, max_results: int = 10) -> List[Patient]:
        """Search patients by field and value"""
        try:
            return await patients_crud.search_all(db, field=field, search_value=search_value, max_results=max_results)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while searching patients. {str(e)}"
            )

    async def get_patients_paginated(
        self, 
        db: AsyncClient, 
        page: int = 1, 
        page_size: int = 10,
        search: str = ""
    ) -> dict:
        """Get paginated patients"""
        try:
            return await patients_crud.get_all_paginated(
                "patients", 
                db, 
                page=page, 
                page_size=page_size,
                search=search
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching paginated patients. {str(e)}"
            )


# Create a singleton instance
patient_service = PatientService()
