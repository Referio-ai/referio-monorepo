from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException
from src.schemas import (
    ReferralBatch, 
    ReferralBatchCreate, 
    ReferralBatchUpdate, 
    ReferralBatchSearchResults,
    GenerateBatchRequest,
    GenerateBatchResponse
)
from src.config.supabase_config import get_supabase_client
from src.crud.referrals_batch import referrals_batch_crud
from src.services import BatchService

router = APIRouter()


@router.get("/", status_code=200)
async def get_batches() -> List[ReferralBatch]:
    """
    Get all referral batches
    
    Returns:
        List[ReferralBatch]: A list of all referral batches in the system
            Each ReferralBatch contains:
            - id: UUID - Unique identifier for the batch
            - name: str - Name of the batch
            - description: Optional[str] - Description of the batch
            - created_at: datetime - Creation timestamp
            - updated_at: datetime - Last update timestamp
    """
    db = await get_supabase_client()
    return await referrals_batch_crud.get_all(db=db)


@router.get("/{batch_id}", status_code=200)
async def get_batch(batch_id: str) -> ReferralBatch:
    """
    Get a specific referral batch by ID
    
    Parameters:
        batch_id (str): The unique identifier of the batch to retrieve
        
    Returns:
        ReferralBatch: The requested referral batch object containing:
            - id: UUID - Unique identifier for the batch
            - name: str - Name of the batch
            - description: Optional[str] - Description of the batch
            - created_at: datetime - Creation timestamp
            - updated_at: datetime - Last update timestamp
            
    Raises:
        HTTPException: 404 if the batch is not found
    """
    db = await get_supabase_client()
    batch = await referrals_batch_crud.get(db=db, id=batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Referral batch not found")
    return batch


@router.post("/", status_code=201)
async def create_batch(batch: ReferralBatchCreate) -> ReferralBatch:
    """
    Create a new referral batch
    
    Parameters:
        batch (ReferralBatchCreate): The batch data to create containing:
            - referral_batch_size: int - Size of the batch
            - referral_outbound_facility_id: UUID - Outbound facility ID
            - referral_inbound_facility_id: UUID - Inbound facility ID
            
    Returns:
        ReferralBatch: The created referral batch object with:
            - referral_batch_id: UUID - Batch identifier
            - referral_batch_prefix: str - Prefix of the batch
            - referral_batch_size: int - Size of the batch
            - referral_outbound_facility_id: UUID - Outbound facility ID
            - referral_inbound_facility_id: UUID - Inbound facility ID
            - created_at: datetime - Creation timestamp
            - updated_at: datetime - Last update timestamp
    """
    db = await get_supabase_client()
    return await BatchService.generate_batch(db=db, request=batch)

    # return await referrals_batch_crud.create(db=db, obj_in=batch)


@router.put("/{batch_id}", status_code=200)
async def update_batch(batch_id: str, batch: ReferralBatchUpdate) -> ReferralBatch:
    """
    Update a referral batch
    
    Parameters:
        batch_id (str): The unique identifier of the batch to update
        batch (ReferralBatchUpdate): The updated batch data containing:
            - name: Optional[str] - New name of the batch
            - description: Optional[str] - New description of the batch
            
    Returns:
        ReferralBatch: The updated referral batch object with:
            - id: UUID - Batch identifier
            - name: str - Updated name
            - description: Optional[str] - Updated description
            - created_at: datetime - Original creation timestamp
            - updated_at: datetime - New update timestamp
    """
    db = await get_supabase_client()
    batch.id = batch_id
    return await referrals_batch_crud.update(db=db, obj_in=batch)


@router.delete("/{batch_id}", status_code=200)
async def delete_batch(batch_id: str) -> ReferralBatch:
    """
    Delete a referral batch
    
    Parameters:
        batch_id (str): The unique identifier of the batch to delete
        
    Returns:
        ReferralBatch: The deleted referral batch object containing:
            - id: UUID - Deleted batch identifier
            - name: str - Name of the deleted batch
            - description: Optional[str] - Description of the deleted batch
            - created_at: datetime - Creation timestamp
            - updated_at: datetime - Last update timestamp
    """
    db = await get_supabase_client()
    return await referrals_batch_crud.delete(db=db, id=batch_id)


@router.post("/generate", status_code=201)
async def generate_batch(request: GenerateBatchRequest) -> GenerateBatchResponse:
    """
    Generate a new batch of referrals
    
    This endpoint creates a new referral batch and generates the specified number
    of referrals within that batch. Each referral will be associated with the
    batch and can be tracked together.
    
    Parameters:
        request (GenerateBatchRequest): The batch generation request containing:
            - name: str - Name for the new batch
            - description: Optional[str] - Description of the batch
            - count: int - Number of referrals to generate
            - template_id: Optional[UUID] - ID of the referral template to use
            
    Returns:
        GenerateBatchResponse: The generation result containing:
            - batch: ReferralBatch - The created batch object
            - referrals: List[Referral] - List of generated referrals
            - total_generated: int - Total number of referrals generated
    """
    db = await get_supabase_client()
    return await BatchService.generate_batch(db=db, request=request)


@router.get("/{batch_id}/referrals", status_code=200)
async def get_batch_referrals(batch_id: UUID) -> List:
    """
    Get all referrals for a specific batch
    
    Parameters:
        batch_id (UUID): The unique identifier of the batch
        
    Returns:
        List: A list of referrals associated with the batch, each containing:
            - id: UUID - Referral identifier
            - code: str - Unique referral code
            - status: str - Current status of the referral
            - created_at: datetime - Creation timestamp
            - batch_id: UUID - Associated batch identifier
    """
    db = await get_supabase_client()
    return await BatchService.get_batch_referrals(db=db, batch_id=batch_id)


@router.get("/{batch_id}/summary", status_code=200)
async def get_batch_summary(batch_id: UUID) -> dict:
    """
    Get a summary of a batch including statistics
    
    Parameters:
        batch_id (UUID): The unique identifier of the batch
        
    Returns:
        dict: A summary dictionary containing:
            - total_referrals: int - Total number of referrals in the batch
            - active_referrals: int - Number of active referrals
            - used_referrals: int - Number of used referrals
            - conversion_rate: float - Percentage of referrals converted
            - created_at: datetime - Batch creation timestamp
            - last_activity: datetime - Timestamp of last referral activity
    """
    db = await get_supabase_client()
    return await BatchService.get_batch_summary(db=db, batch_id=batch_id) 