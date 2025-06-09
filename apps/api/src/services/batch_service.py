from typing import List
from uuid import UUID
from supabase import AsyncClient
from fastapi.responses import JSONResponse

from src.crud.referrals import referrals_crud
from src.crud.referrals_batch import referrals_batch_crud
from src.schemas import (
    ReferralBatchCreate,
    ReferralCreate,
    GenerateBatchRequest,
    GenerateBatchResponse
)
from src.utils.batch_utils import generate_random_prefix, get_unique_batch_prefix


class BatchService:
    """Service for handling referral batch operations"""

    @staticmethod
    async def generate_batch(
        db: AsyncClient, 
        request: GenerateBatchRequest
    ) -> GenerateBatchResponse:
        """
        Generate a new referral batch with the specified number of referrals
        
        Args:
            db: Database client
            request: Batch generation request containing parameters
            
        Returns:
            GenerateBatchResponse with batch details and created referrals count
        """
        # Generate unique batch prefix
        batch_prefix = await get_unique_batch_prefix(db)

        print(f"Batch prefix: {batch_prefix}")

        # Create the referral batch
        batch_create = ReferralBatchCreate(
            referral_outbound_facility_id=request.referral_outbound_facility_id,
            referral_inbound_facility_id=request.referral_inbound_facility_id,
            referral_batch_size=request.referral_batch_size,
            referral_batch_prefix=batch_prefix
        )

        # Create the referral batch
        batch = await referrals_batch_crud.create(db, obj_in=batch_create)
        
        # Create referrals for the batch
        referrals_to_create = []
        
        for i in range(request.referral_batch_size):
            # Generate random 5-character alphanumeric slug
            referral_slug = generate_random_prefix()
            
            referral_create = ReferralCreate(
                referral_outbound_facility_id=str(request.referral_outbound_facility_id),
                referral_inbound_facility_id=str(request.referral_inbound_facility_id),
                referral_batch_id=batch.referral_batch_id,
                referral_batch_prefix=batch_prefix,
                referral_scanned=False,
                referral_submitted=False,
                referral_slug=referral_slug
            )
            referrals_to_create.append(referral_create)


        print(f"Referral: {batch_prefix}")
        
        # Create all referrals in a batch
        created_referrals = await referrals_crud.create_batch(
            db, 
            referrals=referrals_to_create
        )
        
        return JSONResponse(
            content={
                "message": "Batch created successfully",
                "batch_id": str(batch.referral_batch_id),
                "referrals_created": len(created_referrals),
                "batch_prefix": batch_prefix
            }
        )

    @staticmethod
    async def get_batch_referrals(
        db: AsyncClient, 
        batch_id: UUID
    ) -> List:
        """
        Get all referrals for a specific batch
        
        Args:
            db: Database client
            batch_id: ID of the batch to retrieve referrals for
            
        Returns:
            List of referrals in the batch
        """
        return await referrals_crud.get_by_batch_id(db, batch_id=batch_id)

    @staticmethod
    async def get_batch_summary(
        db: AsyncClient, 
        batch_id: UUID
    ) -> dict:
        """
        Get a summary of a batch including statistics
        
        Args:
            db: Database client
            batch_id: ID of the batch to get summary for
            
        Returns:
            Dictionary with batch summary information
        """
        referrals = await referrals_crud.get_by_batch_id(db, batch_id=batch_id)
        
        total_referrals = len(referrals)
        scanned_referrals = sum(1 for r in referrals if r.referral_scanned)
        submitted_referrals = sum(1 for r in referrals if r.referral_submitted)
        
        return {
            "batch_id": str(batch_id),
            "total_referrals": total_referrals,
            "scanned_referrals": scanned_referrals,
            "submitted_referrals": submitted_referrals,
            "scan_rate": (scanned_referrals / total_referrals * 100) if total_referrals > 0 else 0,
            "submission_rate": (submitted_referrals / total_referrals * 100) if total_referrals > 0 else 0
        } 