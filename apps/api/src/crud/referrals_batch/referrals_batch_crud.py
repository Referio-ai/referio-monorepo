from typing import Optional, List
from uuid import UUID

from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.base import CRUDBase
from src.schemas import ReferralBatch, ReferralBatchCreate, ReferralBatchUpdate
from src.utils.batch_utils import get_unique_batch_prefix
import json


class CRUDReferralBatch(CRUDBase[ReferralBatch, ReferralBatchCreate, ReferralBatchUpdate]):

    async def get(self, db: AsyncClient, *, id: str) -> Optional[ReferralBatch]:
        """Get a referral batch by ID"""
        try:
            return await super().get("referrals_batch", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Referral batch not found. {str(e)}",
            )

    async def get_all(self, db: AsyncClient) -> List[ReferralBatch]:
        """Get all referral batches"""
        try:
            return await super().get_all("referrals_batch", db)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching referral batches. {str(e)}",
            )

    async def create(self, db: AsyncClient, *, obj_in: ReferralBatchCreate) -> ReferralBatch:
        """Create a new referral batch"""
        try:
            #serialize the UUIDs to strings
            obj_in.referral_outbound_facility_id = str(obj_in.referral_outbound_facility_id)
            obj_in.referral_inbound_facility_id = str(obj_in.referral_inbound_facility_id)

            return await super().create("referrals_batch", db, obj_in=obj_in)
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create referral batch. {str(e)}",
            )

    async def update(self, db: AsyncClient, *, obj_in: ReferralBatchUpdate) -> ReferralBatch:
        """Update a referral batch"""
        try:
            return await super().update("referrals_batch", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update referral batch. {str(e)}",
            )

    async def delete(self, db: AsyncClient, *, id: str) -> ReferralBatch:
        """Delete a referral batch"""
        try:
            return await super().delete("referrals_batch", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete referral batch. {str(e)}",
            )


referrals_batch_crud = CRUDReferralBatch(ReferralBatch) 