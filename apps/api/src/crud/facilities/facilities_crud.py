from typing import Optional, List
from uuid import UUID

from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.base import CRUDBase
from src.schemas import Facility, FacilityCreate, FacilityUpdate
import json


class CRUDFacilityBatch(CRUDBase[Facility, FacilityCreate, FacilityUpdate]):

    async def get(self, db: AsyncClient, *, id: str) -> Optional[Facility]:
        """Get a facility  by ID"""
        try:
            return await super().get("facility_entity", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Facility  not found. {str(e)}",
            )

    async def get_all(self, db: AsyncClient) -> List[Facility]:
        """Get all facility es"""
        try:
            return await super().get_all("facility_entity", db)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facility es. {str(e)}",
            )
        
    async def get_all_paginated(
        self, 
        db: AsyncClient, 
        *, 
        page: int = 1, 
        page_size: int = 10, 
        search: str = "",
        organization_id: Optional[str] = None
    ) -> List[Facility]:
        """Get all facilities paginated with optional organization filtering"""
        try:
            # Start with base query
            query = db.table("facility_entity").select("*").eq("deleted", False)
            
            # Add organization filter if provided
            if organization_id:
                query = query.eq("organization_id", organization_id)
            
            # Add search filter if provided
            if search:
                query = query.or_(f"facility_name.ilike.%{search}%,facility_primary_contact_fname.ilike.%{search}%,facility_primary_contact_lname.ilike.%{search}%")
            
            # Get total count for pagination
            count_query = query
            count_result = await count_query.execute()
            total_count = len(count_result.data)
            
            # Apply pagination
            offset = (page - 1) * page_size
            query = query.range(offset, offset + page_size - 1)
            
            # Execute query
            result = await query.execute()
            data = result.data
            
            # Convert to Facility objects
            facilities = [Facility(**item) for item in data]
            
            # Create pagination response
            from src.schemas.facilities import FacilityPagination
            return FacilityPagination(
                items=facilities,
                pagination={
                    "total_count": total_count,
                    "total_pages": (total_count + page_size - 1) // page_size,
                    "current_page": page,
                    "page_size": page_size
                }
            )
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilities. {str(e)}",
            )

    async def create(self, db: AsyncClient, *, obj_in: FacilityCreate) -> Facility:
        """Create a new facility"""

        # convert the UUIDs to strings
        obj_in.organization_id = str(obj_in.organization_id)
        obj_in.propelauth_facility_id = str(obj_in.propelauth_facility_id)

        try:
            #serialize the UUIDs to strings
            return await super().create("facility_entity", db, obj_in=obj_in)
            
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create facility . {str(e)}",
            )

    async def update(self, db: AsyncClient, *, obj_in: FacilityUpdate) -> Facility:
        """Update a facility """
        try:
            # Convert UUIDs to strings if they exist
            if obj_in.organization_id:
                obj_in.organization_id = str(obj_in.organization_id)
            if obj_in.propelauth_facility_id:
                obj_in.propelauth_facility_id = str(obj_in.propelauth_facility_id)
            if obj_in.facility_id:
                obj_in.facility_id = str(obj_in.facility_id)
            
            # Use direct database query since the base class uses 'id' but we use 'facility_id'
            result = await db.table("facility_entity").update(
                obj_in.model_dump(exclude_none=True)
            ).eq("facility_id", obj_in.facility_id).execute()
            
            data = result.data
            if not data:
                raise HTTPException(status_code=404, detail="Facility not found")
            
            return Facility(**data[0])
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update facility. {str(e)}",
            )

    async def delete(self, db: AsyncClient, *, id: str) -> Facility:
        """Delete a facility (soft delete)"""
        try:
            # Use direct database query for soft delete
            result = await db.table("facility_entity").update({"deleted": True}).eq("facility_id", id).execute()
            data = result.data
            return Facility(**data[0]) if data else None
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete facility . {str(e)}",
            )

    async def get_facilities_by_user_with_organizations(self, db: AsyncClient, user_id: str) -> List[Facility]:
        """Get all facilities for a user with organization names"""
        try:
            # First, get the facilitator_id from the facilitators table using propelauth_user_id
            facilitator_result = await db.table("facilitators").select("facilitator_id").eq("propelauth_user_id", user_id).execute()
            
            if not facilitator_result.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Facilitator not found for user_id: {user_id}",
                )
            
            facilitator_id = facilitator_result.data[0]["facilitator_id"]
            
            # Get facility_ids from user_facility table using facilitator_id
            user_facility_result = await db.table("user_facility").select("facility_id").eq("user_id", facilitator_id).execute()
            
            if not user_facility_result.data:
                return []
            
            # Extract facility_ids
            facility_ids = [item["facility_id"] for item in user_facility_result.data]
            
            # Get facilities with organization names by joining with organizations table
            facilities_with_orgs = []
            for facility_id in facility_ids:
                # First get the facility data
                facility_result = await db.table("facility_entity").select("*").eq("facility_id", facility_id).eq("deleted", False).execute()
                
                if facility_result.data:
                    facility_data = facility_result.data[0]
                    
                    # Then get the organization name separately
                    org_result = await db.table("organizations").select("organization_name").eq("organization_id", facility_data["organization_id"]).execute()
                    organization_name = None
                    if org_result.data:
                        organization_name = org_result.data[0]["organization_name"]
                    
                    # Create Facility object with organization_name
                    facility = Facility(
                        facility_id=facility_data["facility_id"],
                        organization_id=facility_data["organization_id"],
                        organization_name=organization_name,
                        facility_name=facility_data["facility_name"],
                        facility_address=facility_data["facility_address"],
                        facility_primary_contact_fname=facility_data["facility_primary_contact_fname"],
                        facility_primary_contact_mname=facility_data.get("facility_primary_contact_mname"),
                        facility_primary_contact_lname=facility_data["facility_primary_contact_lname"],
                        facility_primary_contact_phone_number=facility_data["facility_primary_contact_phone_number"],
                        facility_primary_contact_email=facility_data["facility_primary_contact_email"],
                        propelauth_facility_id=facility_data["propelauth_facility_id"],
                        deleted=facility_data.get("deleted", False)
                    )
                    facilities_with_orgs.append(facility)
            
            return facilities_with_orgs
        except HTTPException:
            # Re-raise HTTPException from above
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilities with organizations for user. {str(e)}",
            )


facilities_crud = CRUDFacilityBatch(Facility) 