from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from supabase import AsyncClient
from fastapi import HTTPException

from src.crud.base import CRUDBase
from src.schemas.referral_status_history import (
    ReferralStatusHistory,
    ReferralStatusHistoryCreate,
    ReferralStatusHistoryUpdate,
    ReferralStatusHistorySearchResults
)


class CRUDReferralStatusHistory(CRUDBase[ReferralStatusHistory, ReferralStatusHistoryCreate, ReferralStatusHistoryUpdate]):
    """CRUD operations for referral status history"""

    async def create_status_history(
        self, 
        db: AsyncClient, 
        *, 
        obj_in: ReferralStatusHistoryCreate
    ) -> ReferralStatusHistory:
        """Create a new status history entry"""
        try:
            # Convert UUIDs to strings for database storage
            history_data = obj_in.model_dump()
            history_data["referral_id"] = str(history_data["referral_id"])
            if history_data.get("updated_by_id"):
                history_data["updated_by_id"] = str(history_data["updated_by_id"])
            
            # Add timestamp
            history_data["created_at"] = datetime.now().isoformat()
            
            result = await db.table("referral_status_history").insert(history_data).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to create status history entry"
                )
            
            return ReferralStatusHistory(**result.data[0])
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create status history entry: {str(e)}"
            )

    async def get_status_history_by_referral(
        self, 
        db: AsyncClient, 
        *, 
        referral_id: str,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> ReferralStatusHistorySearchResults:
        """Get status history for a specific referral with pagination"""
        try:
            # Build query
            query = db.table("referral_status_history").select("*").eq("referral_id", referral_id).order("created_at", desc=True)
            
            # Apply pagination if provided
            if limit:
                query = query.limit(limit)
            if offset:
                query = query.range(offset, offset + (limit or 100) - 1)
            
            # Execute query
            result = await query.execute()
            history_entries = result.data
            
            # Convert to ReferralStatusHistory objects
            history_objects = [ReferralStatusHistory(**entry) for entry in history_entries]
            
            # Get total count for pagination metadata
            count_result = await db.table("referral_status_history").select("status_history_id", count="exact").eq("referral_id", referral_id).execute()
            total_count = count_result.count if hasattr(count_result, 'count') else len(history_entries)
            
            return ReferralStatusHistorySearchResults(
                results=history_objects,
                total_count=total_count,
                page=offset // (limit or 100) + 1 if offset else 1,
                page_size=limit or 100
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to get status history: {str(e)}"
            )

    async def get_latest_status_history(
        self, 
        db: AsyncClient, 
        *, 
        referral_id: str
    ) -> Optional[ReferralStatusHistory]:
        """Get the latest status history entry for a referral"""
        try:
            result = await db.table("referral_status_history").select("*").eq("referral_id", referral_id).order("created_at", desc=True).limit(1).execute()
            
            if not result.data:
                return None
            
            return ReferralStatusHistory(**result.data[0])
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to get latest status history: {str(e)}"
            )

    async def delete_status_history_by_referral(
        self, 
        db: AsyncClient, 
        *, 
        referral_id: str
    ) -> Dict[str, Any]:
        """Delete all status history entries for a referral (useful when deleting referrals)"""
        try:
            result = await db.table("referral_status_history").delete().eq("referral_id", referral_id).execute()
            
            return {
                "status": "success",
                "deleted_count": len(result.data) if result.data else 0,
                "message": f"Deleted status history for referral {referral_id}"
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete status history: {str(e)}"
            )


# Create instance
referral_status_history_crud = CRUDReferralStatusHistory(ReferralStatusHistory) 