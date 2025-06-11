from typing import Optional, List
from uuid import UUID

from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.base import CRUDBase
from src.schemas import Reward, RewardCreate, RewardUpdate
import json


class CRUDRewardBatch(CRUDBase[Reward, RewardCreate, RewardUpdate]):

    async def get(self, db: AsyncClient, *, id: str) -> Optional[Reward]:
        """Get a reward  by ID"""
        try:
            return await super().get("rewards", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Reward  not found. {str(e)}",
            )

    async def get_all(self, db: AsyncClient) -> List[Reward]:
        """Get all reward es"""
        try:
            return await super().get_all("rewards", db)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching reward es. {str(e)}",
            )

    async def create(self, db: AsyncClient, *, obj_in: RewardCreate) -> Reward:
        """Create a new reward"""
        try:
            return await super().create("rewards", db, obj_in=obj_in)
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create reward . {str(e)}",
            )

    async def update(self, db: AsyncClient, *, obj_in: RewardUpdate) -> Reward:
        """Update a reward """
        try:
            return await super().update("rewards", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update reward . {str(e)}",
            )

    async def delete(self, db: AsyncClient, *, id: str) -> Reward:
        """Delete a reward """
        try:
            return await super().delete("rewards", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete reward . {str(e)}",
            )


rewards_crud = CRUDRewardBatch(Reward) 