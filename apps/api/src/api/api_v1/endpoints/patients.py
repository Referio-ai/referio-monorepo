from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException
from src.schemas.patients import (
    Patient,
    PatientCreate,
    PatientUpdate,
)
from src.config.supabase_config import get_supabase_client
from src.crud.patients.patients_crud import patients_crud

router = APIRouter()


@router.get("/", status_code=200, response_model=List[Patient])
async def get_patients() -> List[Patient]:
    """
    Get all patients
    
    Returns:
        List[Patient]: A list of all patients in the system
            Each Patient contains:
            - patient_id: UUID - Unique identifier for the patient
            - patient_fname: str - First name of the patient
            - patient_mname: Optional[str] - Middle name of the patient
            - patient_lname: str - Last name of the patient
            - patient_dob: date - Date of birth of the patient
            - patient_contact_phone: str - Contact phone number of the patient
            - patient_contact_email: EmailStr - Contact email address of the patient
            - patient_dob: str - Date of birth of the patient
            - patient_contact_phone: str - Contact phone number of the patient
            - patient_contact_email: EmailStr - Contact email address of the patient
            - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
    """
    db = await get_supabase_client()
    return await patients_crud.get_all(db=db)

@router.get("/{patient_id}", status_code=200, response_model=Patient)
async def get_patient(patient_id: str) -> Patient:
    """
    Get a specific patient by ID
    
    Parameters:
        patient_id (str): The unique identifier of the patient to retrieve
        
    Returns:
        Patient: The requested patient object containing:
            - patient_id: UUID - Unique identifier for the patient
            - patient_fname: str - First name of the patient
            - patient_mname: Optional[str] - Middle name of the patient
            - patient_lname: str - Last name of the patient
            - patient_dob: date - Date of birth of the patient
            - patient_contact_phone: str - Contact phone number of the patient
            - patient_contact_email: EmailStr - Contact email address of the patient
            - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
            
    Raises:
        HTTPException: 404 if the patient is not found
    """
    db = await get_supabase_client()
    patient = await patients_crud.get(db=db, id=patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.post("/", status_code=201, response_model=Patient)
async def create_patient(patient: PatientCreate) -> Patient:
    """
    Create a new patient
    
    Parameters:
        patient (PatientCreate): The patient data to create
        
    Returns:
        Patient: The created patient object containing:
            - patient_id: UUID - Unique identifier for the patient
            - patient_fname: str - First name of the patient
            - patient_mname: Optional[str] - Middle name of the patient
            - patient_lname: str - Last name of the patient
            - patient_dob: date - Date of birth of the patient
            - patient_contact_phone: str - Contact phone number of the patient
            - patient_contact_email: EmailStr - Contact email address of the patient
            - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
            
    Raises:
        HTTPException: 400 if the creation fails
    """
    try:
        db = await get_supabase_client()
        return await patients_crud.create(db=db, obj_in=patient)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create patient. {str(e)}",
        )


@router.put("/{patient_id}", status_code=200, response_model=Patient)
async def update_patient(patient_id: str, patient: PatientUpdate) -> Patient:
    """
    Update a patient
    
    Parameters:
        patient_id (str): The unique identifier of the patient to update
        patient (PatientUpdate): The updated patient data
        
    Returns:
        Patient: The updated patient object containing:
            - patient_id: UUID - Unique identifier for the patient
            - patient_fname: str - First name of the patient
            - patient_mname: Optional[str] - Middle name of the patient
            - patient_lname: str - Last name of the patient
            - patient_dob: date - Date of birth of the patient
            - patient_contact_phone: str - Contact phone number of the patient
            - patient_contact_email: EmailStr - Contact email address of the patient
            - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
            
    Raises:
        HTTPException: 400 if the update fails
    """
    try:
        db = await get_supabase_client()
        patient.id = patient_id
        return await patients_crud.update(db=db, obj_in=patient)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update patient. {str(e)}",
        )


@router.delete("/{patient_id}", status_code=200, response_model=Patient)
async def delete_patient(patient_id: str) -> Patient:
    """
    Delete a patient
    
    Parameters:
        patient_id (str): The unique identifier of the patient to delete
        
    Returns:
        Patient: The deleted patient object containing:
            - patient_id: UUID - Unique identifier for the patient
            - patient_fname: str - First name of the patient
            - patient_mname: Optional[str] - Middle name of the patient
            - patient_lname: str - Last name of the patient
            - patient_dob: date - Date of birth of the patient
            - patient_contact_phone: str - Contact phone number of the patient
            - patient_contact_email: EmailStr - Contact email address of the patient
            - patient_insurance_member_id: Optional[str] - Insurance member ID of the patient
            
    Raises:
        HTTPException: 400 if the deletion fails
    """
    try:
        db = await get_supabase_client()
        return await patients_crud.delete(db=db, id=patient_id)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to delete patient. {str(e)}",
        )