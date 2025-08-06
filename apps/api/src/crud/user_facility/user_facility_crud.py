from typing import List, Optional
from uuid import UUID
from supabase import AsyncClient
from fastapi import HTTPException
from ...schemas.user_facility import UserFacility, UserFacilityCreate, UserFacilityUpdate
from ..base import CRUDBase


class CRUDUserFacility(CRUDBase[UserFacility, UserFacilityCreate, UserFacilityUpdate]):
    async def get_by_user_id(self, db: AsyncClient, *, user_id: str) -> List[UserFacility]:
        """Get all facility associations for a specific user"""
        try:
            
            # get the facilitator info from the facilitator table
            facilitator = await db.table("facilitators").select("*").eq("propelauth_user_id", user_id).execute()
            facilitator_data = facilitator.data
            
            if not facilitator_data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Facilitator not found for user_id: {user_id}",
                )
            
            facilitator_id = facilitator_data[0]["facilitator_id"]

            # get the user-facility associations for the facilitator
            result = await db.table("user_facility").select("*").eq("user_id", facilitator_id).execute()
            data = result.data
            return [UserFacility(**item) for item in data]
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching user facility associations. {str(e)}",
            )

    async def get_by_facility_id(self, db: AsyncClient, *, facility_id: str) -> List[UserFacility]:
        """Get all user associations for a specific facility"""
        try:
            result = await db.table("user_facility").select("*").eq("facility_id", facility_id).neq("deleted", True).execute()
            data = result.data
            return [UserFacility(**item) for item in data]
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facility user associations. {str(e)}",
            )

    async def create_multiple(self, db: AsyncClient, *, user_id: str, facility_ids: List[str]) -> List[UserFacility]:
        """Create multiple user-facility associations"""
        try:
            user_facilities = []
            for facility_id in facility_ids:
                user_facility_data = UserFacilityCreate(
                    user_id=user_id,
                    facility_id=UUID(facility_id)
                )
                user_facility = await self.create(db, obj_in=user_facility_data)
                user_facilities.append(user_facility)
            return user_facilities
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create user facility associations. {str(e)}",
            )

    async def delete_by_user_id(self, db: AsyncClient, *, user_id: str) -> bool:
        """Delete all facility associations for a specific user"""
        try:
            await db.table("user_facility").update({"deleted": True}).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while deleting user facility associations. {str(e)}",
            )

    async def delete_by_facility_id(self, db: AsyncClient, *, facility_id: str) -> bool:
        """Delete all user associations for a specific facility"""
        try:
            await db.table("user_facility").update({"deleted": True}).eq("facility_id", facility_id).execute()
            return True
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while deleting facility user associations. {str(e)}",
            )


user_facility_crud = CRUDUserFacility(UserFacility) 