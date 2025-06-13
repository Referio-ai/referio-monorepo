from typing import Optional, List
from uuid import UUID

from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.base import CRUDBase
from src.schemas.referral_messages import ReferralMessages, ReferralMessagesCreate, ReferralMessagesUpdate
import json


class CRUDReferralsMessages(CRUDBase[ReferralMessages, ReferralMessagesCreate, ReferralMessagesUpdate]):

    async def get(self, db: AsyncClient, *, id: str) -> Optional[ReferralMessages]:
        """Get a reward  by ID"""
        try:
            return await super().get("referral_messages", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"ReferralMessages  not found. {str(e)}",
            )
        
    async def get_messages_by_referral_id(self, db: AsyncClient, *, referral_id: str) -> Optional[ReferralMessages]:
        """Get a reward  by ID"""
        try:
            return await super().get("referral_messages", db, referral_id=referral_id)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"ReferralMessages  not found. {str(e)}",
            )

    async def get_all(self, db: AsyncClient) -> List[ReferralMessages]:
        """Get all reward es"""
        try:
            return await super().get_all("referral_messages", db)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching reward es. {str(e)}",
            )

    async def create(self, db: AsyncClient, *, obj_in: ReferralMessagesCreate) -> ReferralMessages:
        """Create a new reward"""
        try:
            return await super().create("referral_messages", db, obj_in=obj_in)
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create reward . {str(e)}",
            )

    async def update(self, db: AsyncClient, *, obj_in: ReferralMessagesUpdate) -> ReferralMessages:
        """Update a reward """
        try:
            return await super().update("referral_messages", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update reward . {str(e)}",
            )


referral_messages_crud = CRUDReferralsMessages(ReferralMessages) 