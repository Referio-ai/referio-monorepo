from typing import Optional, List
from uuid import UUID
import uuid

from fastapi import HTTPException, UploadFile
from supabase import AsyncClient

from src.schemas.fileresult import FileResult
from src.utils.supabase.supabase_utils import get_files, upload_file
from src.crud.base import CRUDBase
from src.schemas.referrals import Referral, ReferralCreate, ReferralStatusUpdate, ReferralUpdate


class CRUDReferrals(CRUDBase[Referral, ReferralCreate, ReferralUpdate]):

    async def get(self, db: AsyncClient, *, id: str) -> Optional[Referral]:
        """Get a referral by ID"""
        try:
            return await super().get("referrals", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Referral not found. {str(e)}",
            )

    async def get_all(self, db: AsyncClient) -> List[Referral]:
        """Get all referrals"""
        try:
            return await super().get_all("referrals", db)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching referrals. {str(e)}",
            )

    async def get_by_batch_id(self, db: AsyncClient, *, batch_id: UUID, include_deleted: bool = False) -> List[Referral]:
        """Get all referrals by batch ID"""
        try:
            query = (
                db.table("referrals")
                .select("*")
                .eq("referral_batch_id", str(batch_id))
            )
            
            # Filter out deleted records unless explicitly requested
            if not include_deleted:
                query = query.neq("deleted", True)
                
            result = await query.execute()
            data = result.data
            return [Referral(**item) for item in data]
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching referrals by batch. {str(e)}",
            )

    async def create(self, db: AsyncClient, *, obj_in: ReferralCreate) -> Referral:
        """Create a new referral"""
        try:
            return await super().create("referrals", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create referral. {str(e)}",
            )

    async def create_batch(self, db: AsyncClient, *, referrals: List[ReferralCreate]) -> List[Referral]:
        """Create multiple referrals in a batch"""
        try:

            # serialize the UUIDs to strings
            for referral in referrals:
                referral.referral_outbound_facility_id = str(referral.referral_outbound_facility_id)
                referral.referral_inbound_facility_id = str(referral.referral_inbound_facility_id)
            
            result = await db.table("referrals").insert([referral.model_dump() for referral in referrals]).execute()
            data = result.data
            return [Referral(**item) for item in data]
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create referral batch ss. {str(e)}",
            )

    async def update(self, db: AsyncClient, *, obj_in: ReferralUpdate) -> Referral:
        """Update a referral"""
        try:
            return await super().update("referrals", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update referral. {str(e)}",
            )
        
    async def update_status(self, db: AsyncClient, *, obj_in: ReferralStatusUpdate) -> Referral:
        """Update a referral"""
        try:
            return await super().update_status("referrals", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update referral. {str(e)}",
            )

    async def delete(self, db: AsyncClient, *, id: str) -> Referral:
        """Delete a referral"""
        try:
            return await super().delete("referrals", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete referral. {str(e)}",
            )
    
    async def upload_files(self, db: AsyncClient, *, id: str, files: List[UploadFile], bucket_name: str, base_path:str, type: str, document_category: Optional[str] = None, user_id: Optional[str] = None):
        """Upload files for a referral"""
        try:
            fileResults = []
            if not files:
                raise HTTPException(status_code=400, detail="No files provided")
            for file in files:
              fileResult = await upload_file(
                id=id,
                file=file,
                bucket_name=bucket_name,
                file_name=str(uuid.uuid4()),
                base_path=base_path,
                type=type
                )
              # Add document_category to the fileResult if provided
              if document_category:
                  fileResult.document_category = document_category
              fileResults.append(fileResult)
            
            # Update referral to mark it has file updates
            # Add the current user to the list since they've already seen the files they uploaded
            await db.table("referrals").update({
                "has_update": True,
                "has_update_users": []  # Add the user to the list since they've seen the files
            }).eq("referral_id", id).execute()
            
            return fileResults
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to upload files for referral. {str(e)}",
            )
        
    async def get_files(self, db: AsyncClient, *, id: str, bucket_name: str, base_path: str, type: Optional[str] = None):
        """Get files for a referral"""
        try:
            return await get_files(
                id=id,
                bucket_name=bucket_name,
                base_path=base_path,
                type=type
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to get files for referral. {str(e)}",
            )



referrals_crud = CRUDReferrals(Referral)
