from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, UploadFile, Form
from src.schemas.referrals import (
    Referral, 
    ReferralCreate,
    ReferralStatusUpdate, 
    ReferralUpdate,
    ReferralPagination,
    ReferralWithDetails,
)
from src.config.supabase_config import get_supabase_client
from src.utils.supabase.supabase_utils import upload_file
from src.schemas.fileresult import FileResult
from src.crud.referrals import referrals_crud
from src.services.referral_service import ReferralService

router = APIRouter()


@router.get("/", status_code=200)
async def get_referrals(page: int = 1, page_size: int = 10, search: str = "") -> ReferralPagination:
    """Get all referrals"""
    try:
        db = await get_supabase_client()
        return await referrals_crud.get_all_paginated(db=db, table_name="referrals", page=page, page_size=page_size, search=search)
    except HTTPException:
        # Re-raise HTTPException from CRUD layer
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching referrals. {str(e)}",
        )


@router.get("/{referral_id}", status_code=200)
async def get_referral(referral_id: str) -> Referral:
    """Get a specific referral by ID"""
    db = await get_supabase_client()
    referral = await referrals_crud.get(db=db, id=referral_id)
    if not referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    return referral


@router.post("/", status_code=201)
async def create_referral(referral: ReferralCreate) -> Referral:
    """Create a new referral"""
    db = await get_supabase_client()
    return await referrals_crud.create(db=db, obj_in=referral)


@router.put("/{referral_id}", status_code=200)
async def update_referral(referral_id: str, referral: ReferralUpdate) -> Referral:
    """Update a referral"""
    db = await get_supabase_client()
    referral.id = referral_id
    return await referrals_crud.update(db=db, obj_in=referral)

@router.put("/status/{referral_id}", status_code=200)
async def update_referral_status(referral_id: str, referral: ReferralStatusUpdate) -> Referral:
    """Update a referral"""
    db = await get_supabase_client()
    referral.id = referral_id
    return await referrals_crud.update_status(db=db, obj_in=referral)


@router.delete("/{referral_id}", status_code=200)
async def delete_referral(referral_id: str) -> Referral:
    """Delete a referral"""
    db = await get_supabase_client()
    return await referrals_crud.delete(db=db, id=referral_id)


@router.get("/batch/{batch_id}", status_code=200)
async def get_referrals_by_batch(batch_id: UUID) -> List[Referral]:
    """Get all referrals for a specific batch"""
    db = await get_supabase_client()
    return await referrals_crud.get_by_batch_id(db=db, batch_id=batch_id) 


@router.post("/upload/{referral_id}/{type}", status_code=200)
async def upload_referral_document(
    referral_id: str,
    type: str,
    files: List[UploadFile] = Form(None),
):
    """Upload a document for a referral"""
    db = await get_supabase_client()
    return await referrals_crud.upload_files(db=db, id=referral_id, files=files, type=type, bucket_name="referral-documents", base_path="referrals")


@router.post("/upload-form/{referral_id}", status_code=200)
async def upload_referral_form_with_extraction(
    referral_id: str,
    files: List[UploadFile] = Form(...),
):
    """
    Upload referral form(s) and extract data using Reducto AI
    
    This endpoint:
    1. Uploads the referral form files to storage
    2. Processes each file through Reducto for data extraction
    3. Stores the extraction results
    4. Returns both upload results and extracted data
    
    Args:
        referral_id: ID of the referral to attach the forms to
        files: List of referral form files to upload and process
        
    Returns:
        Dict containing:
        - upload_results: File upload information
        - extraction_results: Reducto extraction results for each file
        - referral_id: The referral ID
        - processed_files: Number of files processed
        - successful_extractions: Number of successful extractions
    """
    db = await get_supabase_client()
    return await ReferralService.upload_referral_form(
        db=db, 
        referral_id=referral_id, 
        form_data=files
    )


@router.get("/file/{referral_id}/{type}", status_code=200)
async def get_referral_files(
    referral_id: str,
    type: str,
) :
    """Get a file for a referral"""
    db = await get_supabase_client()
    return await referrals_crud.get_files(db=db, id=referral_id, type=type, bucket_name="referral-documents", base_path="referrals")

@router.get("/slug/{referral_id}", status_code=200)
async def get_referral_by_slug(
    referral_id: str,
) -> ReferralWithDetails:
    """Get a referral by slug with facility and patient details"""
    db = await get_supabase_client()
    return await ReferralService.fetch_referral_by_slug(db=db, referral_slug=referral_id)
