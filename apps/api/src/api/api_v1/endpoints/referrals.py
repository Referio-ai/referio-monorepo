from typing import List, Optional, Dict, Any
from uuid import UUID
import json

from fastapi import APIRouter, HTTPException, UploadFile, Form, Request
from src.schemas.referrals import (
    Referral, 
    ReferralCreate,
    ReferralStatusUpdate, 
    ReferralUpdate,
    ReferralPagination,
    ReferralWithDetails,
    ReferralWithDetailsPagination,
)
from src.config.supabase_config import get_supabase_client
from src.utils.supabase.supabase_utils import upload_file
from src.schemas.fileresult import FileResult
from src.crud.referrals import referrals_crud
from src.services.referral_service import ReferralService
from src.services.referral_management_service import ReferralManagementService
from src.utils.reducto.reducto_utils import (
    reducto_referral_extraction,
    reducto_referral_extraction_async,
    reducto_referral_extraction_async_with_webhook,
    configure_reducto_webhook,
    verify_webhook_signature,
    get_reducto_job_status
)
from src.config.infisical import REDUCTO_WEBHOOK_SECRET

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
    document_category: Optional[str] = Form(None),
):
    """Upload a document for a referral"""
    db = await get_supabase_client()
    return await referrals_crud.upload_files(db=db, id=referral_id, files=files, type=type, bucket_name="referral-documents", base_path="referrals", document_category=document_category)


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

@router.post("/upload-form-async/{referral_id}", status_code=200)
async def upload_referral_form_with_extraction_async(
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
    return await ReferralService.upload_referral_form_async(
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

@router.get("/slug/{batch_prefix}/{referral_id}", status_code=200)
async def get_referral_by_slug(
    batch_prefix: str,
    referral_id: str,
) -> ReferralWithDetails:
    """Get a referral by slug with facility and patient details"""
    db = await get_supabase_client()
    return await ReferralService.fetch_referral_by_slug(db=db, referral_slug=referral_id, batch_prefix=batch_prefix)


@router.get("/with-details/", status_code=200)
async def get_referrals_with_details(
    page: int = 1, 
    page_size: int = 10, 
    search: str = "", 
    batch_prefix: Optional[str] = None
) -> ReferralWithDetailsPagination:
    """Get all referrals with patient and facility details for management dashboard"""
    try:
        db = await get_supabase_client()
        return await ReferralService.get_referrals_with_details_paginated(
            db=db, page=page, page_size=page_size, search=search, batch_prefix=batch_prefix
        )
    except HTTPException:
        # Re-raise HTTPException from CRUD layer
        raise
    except Exception as e:
        print(f"An error occurred while fetching referrals with details. {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching referrals with details. {str(e)}",
        )
    
@router.post("/mark-as-scanned/{slug}", status_code=200)
async def mark_referral_as_scanned(slug: str) -> Referral:
    """Mark a referral as scanned"""
    # w8FL7-a2Iws the first part of the slug is the batch prefix and the second part is the referral id
    try:

        slug = slug.split("-")
        slug = slug[1]  # the second part of the slug is the referral id
        db = await get_supabase_client()
        return await ReferralService.mark_referral_as_scanned(db=db, slug=slug)
    except HTTPException:
        # Re-raise HTTPException from CRUD layer
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while marking referral as scanned. {str(e)}",
        )
    
@router.post("/upload-document/{referral_id}", status_code=200)
async def upload_document(
    referral_id: str,
    formData: List[UploadFile] = Form(...),
    document_type: str = Form(...),
    document_category: str = Form(...),
):
    """Upload a document with document type and reference via referral_id and document_category"""
    try:
        db = await get_supabase_client()
        return await ReferralService.upload_document(db=db, referral_id=referral_id, form_data=formData, document_type=document_type, document_category=document_category)
    except HTTPException:
        # Re-raise HTTPException from CRUD layer
        raise   
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while uploading document. {str(e)}",
        )


@router.get("/scanned/", status_code=200)
async def get_scanned_referrals(page: int = 1, page_size: int = 10, search: str = "") -> ReferralWithDetailsPagination:
    """Get only scanned referrals with patient and facility details"""
    try:
        db = await get_supabase_client()
        return await ReferralManagementService.get_scanned_referrals_paginated(
            db=db, page=page, page_size=page_size, search=search
        )
    except HTTPException:
        # Re-raise HTTPException from service layer
        raise
    except Exception as e:
        print(f"An error occurred while fetching scanned referrals. {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching scanned referrals. {str(e)}",
        )


@router.get("/scanned/count", status_code=200)
async def get_scanned_referrals_count():
    """Get count of scanned referrals"""
    try:
        db = await get_supabase_client()
        return await ReferralManagementService.get_scanned_referrals_count(db=db)
    except HTTPException:
        # Re-raise HTTPException from service layer
        raise
    except Exception as e:
        print(f"An error occurred while getting scanned referrals count. {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while getting scanned referrals count. {str(e)}",
        )


@router.get("/qr-print/{batch_prefix}", status_code=200)
async def get_referrals_for_qr_printing(batch_prefix: str) -> dict:
    """
    Get all referrals for a specific batch prefix for QR code printing
    
    This endpoint retrieves all referrals within a batch and formats them
    with QR code URLs and essential information needed for printing.
    
    Args:
        batch_prefix: Batch prefix to filter referrals by branch
        
    Returns:
        Dict containing batch information and formatted referrals for QR printing
    """
    try:
        db = await get_supabase_client()
        return await ReferralService.get_referrals_for_qr_printing(db=db, batch_prefix=batch_prefix)
    except HTTPException:
        # Re-raise HTTPException from service layer
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching referrals for QR printing. {str(e)}",
        )


@router.get("/scanned/batch/{batch_id}", status_code=200)
async def get_scanned_referrals_by_batch(batch_id: UUID, page: int = 1, page_size: int = 10) -> ReferralWithDetailsPagination:
    """Get scanned referrals for a specific batch"""
    try:
        db = await get_supabase_client()
        return await ReferralManagementService.get_scanned_referrals_by_batch(
            db=db, batch_id=batch_id, page=page, page_size=page_size
        )
    except HTTPException:
        # Re-raise HTTPException from service layer
        raise
    except Exception as e:
        print(f"An error occurred while fetching scanned referrals by batch. {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching scanned referrals by batch. {str(e)}",
        )


@router.post("/webhook/reducto", status_code=200)
async def handle_reducto_webhook(request: Request):
    """
    Handle webhook notifications from Reducto for async extraction results.
    
    This endpoint:
    1. Receives webhook notifications from Reducto
    2. Verifies the webhook signature for security
    3. Processes the extraction results
    4. Updates the referral with extracted data
    
    Returns:
        Dict containing the processing result
    """
    try:
        # Get the raw body for signature verification
        body = await request.body()
        body_str = body.decode('utf-8')
        
        # Get headers
        headers = request.headers
        signature = headers.get("X-Reducto-Signature")
        
        # Verify webhook signature if secret is configured
        webhook_secret = REDUCTO_WEBHOOK_SECRET  # Should be from config
        if webhook_secret and signature:
            if not verify_webhook_signature(body_str, signature, webhook_secret):
                raise HTTPException(status_code=401, detail="Invalid webhook signature")
        
        # Parse the webhook payload
        webhook_data = json.loads(body_str)

        print(webhook_data, 'webhook_data')
        
        # Extract job information
        job_id = webhook_data.get("job_id")
        status = webhook_data.get("status")
        result = webhook_data.get("result", {})
        error = webhook_data.get("error")
        
        print(f"Received webhook for job {job_id} with status: {status}")
        
        if status == "Completed":

            # get the extraction via job id url https://platform.reducto.ai/job/job_id
            # get the extraction data

            # get the extraction data
            extraction_data = await get_reducto_job_status(job_id)
            print(extraction_data.get("result").get("result"), 'extraction_data');
            extracted_data = extraction_data.get("result").get("result")
            db = await get_supabase_client()    
            await ReferralService.process_extracted_referral_data(db=db, job_id=job_id, extracted_data=extracted_data)

            # save the extraction data to the database
  
            return {
                "status": "success",
                "job_id": job_id,
                "message": "Webhook processed successfully",
    
            }
            
        elif status == "failed":
            # Handle failed extraction
            print(f"Extraction failed for job {job_id}: {error}")
            
            return {
                "status": "failed",
                "job_id": job_id,
                "error": error,
                "message": "Extraction failed"
            }
        
        else:
            # Handle other statuses
            return {
                "status": "unknown",
                "job_id": job_id,
                "message": f"Unknown status: {status}"
            }
            
    except Exception as e:
        print(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail=f"Webhook processing error: {str(e)}")


@router.post("/extract-async-with-webhook/{referral_id}", status_code=200)
async def extract_referral_with_webhook(
    referral_id: str,
    document_url: str,
    webhook_url: str = None,
    webhook_secret: str = None
):
    """
    Extract information from a document using Reducto API async endpoint with webhook.
    
    Args:
        referral_id: ID of the referral to associate with the extraction
        document_url: URL of the document to extract from
        webhook_url: URL where Reducto will send the completion notification
        webhook_secret: Optional secret for webhook authentication
    
    Returns:
        Dict containing the job information
    """
    try:
        # Use default webhook URL if not provided
        if not webhook_url:
            webhook_url = f"https://your-domain.com/api/v1/referrals/webhook/reducto"
        
        # Submit async extraction with webhook
        job_info = await reducto_referral_extraction_async_with_webhook(
            document_url=document_url,
            webhook_url=webhook_url,
            referral_id=referral_id,
            webhook_secret=webhook_secret
        )
        
        # Store job information in database for tracking
        db = await get_supabase_client()
        # Job_id is now automatically saved to the referral in the reducto function
        
        return {
            "referral_id": referral_id,
            "job_info": job_info,
            "message": "Async extraction with webhook submitted successfully"
        }
        
    except Exception as e:
        print(f"Error submitting async extraction with webhook: {e}")
        raise HTTPException(status_code=500, detail=f"Extraction submission error: {str(e)}")


@router.post("/extract-async/{referral_id}", status_code=200)
async def extract_referral_async(
    referral_id: str,
    document_url: str,
):
    """
    Extract information from a document using Reducto API async endpoint."""
    try:
        job_id = await reducto_referral_extraction_async(
            document_url=document_url,
            referral_id=referral_id
        )
        
        return {
            "status": "success",
            "job_id": job_id,
            "message": "Async extraction submitted successfully"
        }
        
    except Exception as e:
        print(f"Error submitting async extraction: {e}")
        raise HTTPException(status_code=500, detail=f"Extraction submission error: {str(e)}")


@router.post("/configure-webhook", status_code=200)
async def configure_reducto_webhook_endpoint(
    webhook_url: str,
    webhook_secret: str = None
):
    """
    Configure webhook settings for Reducto API.
    
    Args:
        webhook_url: URL where Reducto will send notifications
        webhook_secret: Optional secret for webhook authentication
    
    Returns:
        Dict containing the webhook configuration result
    """
    try:
        result = await configure_reducto_webhook(
            webhook_url=webhook_url,
            webhook_secret=webhook_secret
        )
        
        return {
            "status": "success",
            "webhook_url": webhook_url,
            "result": result,
            "message": "Webhook configured successfully"
        }
        
    except Exception as e:
        print(f"Error configuring webhook: {e}")
        raise HTTPException(status_code=500, detail=f"Webhook configuration error: {str(e)}")
