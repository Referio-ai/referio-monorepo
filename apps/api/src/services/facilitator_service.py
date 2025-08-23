import requests
from datetime import datetime
import json
import uuid
from typing import Optional, List, Dict, Any
from uuid import UUID
from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.facilitators.facilitators_crud import facilitators_crud
from src.crud.user_facility.user_facility_crud import user_facility_crud
from src.schemas.facilitators import Facilitator, FacilitatorCreate, FacilitatorUpdate, FacilitatorUpdateWithMultipleFacilities, FacilitatorWithFacilities
from src.schemas.user_facility import UserFacilityCreate
from src.config.infisical import PROPEL_AUTH_URL, PROPEL_API_KEY
from src.config.supabase_config import get_supabase_client


class FacilitatorService:
    """Service class for facilitator-related operations with PropelAuth integration"""

    def __init__(self):
        self.propelauth_url = PROPEL_AUTH_URL
        self.propelauth_api_key = PROPEL_API_KEY

    async def create_propelauth_user(self, facilitator_data: FacilitatorCreate, password: str = None) -> Dict[str, Any]:
        """Create a PropelAuth user account for the facilitator"""
        try:
            # Validate PropelAuth configuration
            if not self.propelauth_url or not self.propelauth_api_key:
                raise HTTPException(
                    status_code=500,
                    detail="PropelAuth configuration is missing. Please check PROPEL_AUTH_URL and PROPEL_API_KEY."
                )
            
            # Use provided password or generate a secure one if not provided
            user_password = password if password else self._generate_secure_password()
            
            # Use the separate first and last name fields
            first_name = facilitator_data.facilitator_first_name
            last_name = facilitator_data.facilitator_last_name
            
            # Prepare the user data for PropelAuth
            user_data = {
                "email": facilitator_data.facilitator_email,
                "email_confirmed": True,
                "send_email_to_confirm_email_address": False,
                "ignore_domain_restrictions": False,
                "password": user_password,
                "ask_user_to_update_password_on_login": False,
                "first_name": first_name,
                "last_name": last_name,
                "properties": {
                    "metadata": {
                        "phone_number": facilitator_data.facilitator_phone_number,
                        "facility_id": str(facilitator_data.facility_id),
                        "user_type": "facilitator"
                    }
                }
            }

            # Make API request to PropelAuth
            headers = {
                "Authorization": f"Bearer {self.propelauth_api_key}",
                "Content-Type": "application/json"
            }
          
            # Log the API URL for debugging (remove in production)
            print(f"PropelAuth API URL: {self.propelauth_url}")
            print(f"PropelAuth API Key: {self.propelauth_api_key[:10]}..." if self.propelauth_api_key else "No API key")

            response = requests.post(
                f"{self.propelauth_url}/api/backend/v1/user/",
                json=user_data,
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                user_info = response.json()
                return {
                    "user_id": user_info.get("user_id"),
                    "email": user_info.get("email"),
                    "status": "created"
                }
            elif response.status_code == 400:
                # Bad request - check the error details
                error_detail = response.json() if response.text else "Unknown error"
                raise HTTPException(
                    status_code=400,
                    detail=f"Bad request to PropelAuth API: {error_detail}"
                )
            elif response.status_code == 409:
                # User already exists, get the existing user
                return await self._get_existing_propelauth_user(facilitator_data.facilitator_email)
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to create PropelAuth user: {response.text}"
                )

        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=500,
                detail=f"PropelAuth API request failed: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error creating PropelAuth user: {str(e)}"
            )

    async def _get_existing_propelauth_user(self, email: str) -> Dict[str, Any]:
        """Get existing PropelAuth user by email"""
        try:
            # Validate PropelAuth configuration
            if not self.propelauth_url or not self.propelauth_api_key:
                raise HTTPException(
                    status_code=500,
                    detail="PropelAuth configuration is missing. Please check PROPEL_AUTH_URL and PROPEL_API_KEY."
                )
            
            headers = {
                "Authorization": f"Bearer {self.propelauth_api_key}",
                "Content-Type": "application/json"
            }

            # According to PropelAuth docs: https://docs.propelauth.com/reference/api/get-user
            # The correct endpoint for getting user by email is /api/backend/v1/users with email parameter
            response = requests.get(
                f"{self.propelauth_url}/api/backend/v1/users",
                params={"email": email},
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                user_info = response.json()
                return {
                    "user_id": user_info.get("user_id"),
                    "email": user_info.get("email"),
                    "status": "existing"
                }
            elif response.status_code == 404:
                # User not found by email
                raise HTTPException(
                    status_code=404,
                    detail=f"PropelAuth user not found with email: {email}"
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to get existing PropelAuth user: {response.text}"
                )

        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=500,
                detail=f"PropelAuth API request failed: {str(e)}"
            )

    async def get_propelauth_user_by_id(self, user_id: str) -> Dict[str, Any]:
        """Get PropelAuth user by user ID"""
        try:
            # Validate PropelAuth configuration
            if not self.propelauth_url or not self.propelauth_api_key:
                raise HTTPException(
                    status_code=500,
                    detail="PropelAuth configuration is missing. Please check PROPEL_AUTH_URL and PROPEL_API_KEY."
                )
            
            headers = {
                "Authorization": f"Bearer {self.propelauth_api_key}",
                "Content-Type": "application/json"
            }

            # According to PropelAuth docs: https://docs.propelauth.com/reference/api/get-user
            # The correct endpoint for getting user by ID is /api/backend/v1/users/{user_id}
            response = requests.get(
                f"{self.propelauth_url}/api/backend/v1/users/{user_id}",
                headers=headers,
                timeout=30
            )

            if response.status_code == 200:
                user_info = response.json()
                return {
                    "user_id": user_info.get("user_id"),
                    "email": user_info.get("email"),
                    "first_name": user_info.get("first_name"),
                    "last_name": user_info.get("last_name"),
                    "metadata": user_info.get("metadata", {}),
                    "status": "found"
                }
            elif response.status_code == 404:
                raise HTTPException(
                    status_code=404,
                    detail=f"PropelAuth user not found with ID: {user_id}"
                )
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to get PropelAuth user: {response.text}"
                )

        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=500,
                detail=f"PropelAuth API request failed: {str(e)}"
            )

    def _generate_secure_password(self) -> str:
        """Generate a secure password for the facilitator"""
        import secrets
        import string
        
        # Generate a secure password with letters, digits, and symbols
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        password = ''.join(secrets.choice(alphabet) for i in range(12))
        return password

    async def test_propelauth_connection(self) -> Dict[str, Any]:
        """Test PropelAuth API connection and validate configuration"""
        try:
            # Validate PropelAuth configuration
            if not self.propelauth_url or not self.propelauth_api_key:
                return {
                    "status": "error",
                    "message": "PropelAuth configuration is missing",
                    "propelauth_url": self.propelauth_url,
                    "has_api_key": bool(self.propelauth_api_key)
                }
            
            headers = {
                "Authorization": f"Bearer {self.propelauth_api_key}",
                "Content-Type": "application/json"
            }

            # Test the API connection by making a simple request
            # Using the get users endpoint to test connectivity
            # Note: This endpoint requires a user_id parameter, so we'll test with a dummy ID
            response = requests.get(
                f"{self.propelauth_url}/api/backend/v1/users/test-user-id",
                headers=headers,
                timeout=10
            )

            return {
                "status": "success" if response.status_code in [200, 401, 403] else "error",
                "status_code": response.status_code,
                "propelauth_url": self.propelauth_url,
                "api_key_length": len(self.propelauth_api_key) if self.propelauth_api_key else 0,
                "response_text": response.text[:200] if response.text else "No response text"
            }

        except requests.exceptions.RequestException as e:
            return {
                "status": "error",
                "message": f"Connection failed: {str(e)}",
                "propelauth_url": self.propelauth_url,
                "has_api_key": bool(self.propelauth_api_key)
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Unexpected error: {str(e)}",
                "propelauth_url": self.propelauth_url,
                "has_api_key": bool(self.propelauth_api_key)
            }

    async def update_propelauth_user_metadata(self, user_id: str, metadata: Dict[str, Any]) -> bool:
        """Update PropelAuth user metadata"""
        try:
            # Validate PropelAuth configuration
            if not self.propelauth_url or not self.propelauth_api_key:
                raise HTTPException(
                    status_code=500,
                    detail="PropelAuth configuration is missing. Please check PROPEL_AUTH_URL and PROPEL_API_KEY."
                )
            
            headers = {
                "Authorization": f"Bearer {self.propelauth_api_key}",
                "Content-Type": "application/json"
            }

            # According to PropelAuth docs: https://docs.propelauth.com/reference/api/update-user
            response = requests.patch(
                f"{self.propelauth_url}/api/backend/v1/users/{user_id}",
                json={"metadata": metadata},
                headers=headers,
                timeout=30
            )

            return response.status_code == 200

        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=500,
                detail=f"PropelAuth API request failed: {str(e)}"
            )

    async def create_facilitator_with_propelauth(self, db: AsyncClient, facilitator_data: FacilitatorCreate) -> Facilitator:
        """Create a facilitator with PropelAuth user account"""
        try:
            # First, create the PropelAuth user
            propelauth_user = await self.create_propelauth_user(facilitator_data, facilitator_data.password)

            print(f"PropelAuth user ID: {propelauth_user}")
            
            # Update the facilitator data with the PropelAuth user ID
            facilitator_data.propelauth_user_id = UUID(propelauth_user["user_id"])
            
            # Validate that facility_id is not empty
            if not facilitator_data.facility_id:
                raise HTTPException(
                    status_code=400,
                    detail="facility_id cannot be empty"
                )
            
            # Generate a UUID for the facilitator_id
            import uuid
            facilitator_uuid = uuid.uuid4()
            
            # Prepare the data for database insertion
            facilitator_dict = facilitator_data.model_dump()
            # Convert UUIDs to strings for database storage
            facilitator_dict["facility_id"] = str(facilitator_data.facility_id)
            facilitator_dict["propelauth_user_id"] = str(propelauth_user["user_id"])
            facilitator_dict["created_at"] = datetime.now().isoformat()
            facilitator_dict["updated_at"] = datetime.now().isoformat()
            # Set the facilitator_id to the generated UUID
            facilitator_dict["facilitator_id"] = str(facilitator_uuid)
            # Add computed full name for search purposes
            facilitator_dict["facilitator_full_name"] = f"{facilitator_data.facilitator_first_name} {facilitator_data.facilitator_last_name}".strip()
            # Remove password field as it's not stored in the database
            facilitator_dict.pop("password", None)
            print(f"Facilitator dictionary: {facilitator_dict}")
            
            # Create the facilitator in the database using direct query
            result = await db.table("facilitators").insert(facilitator_dict).execute()
            
            if result.data:
                return Facilitator(**result.data[0])
            else:
                print(f"Failed to create facilitator - no data returned: {result.data}")
                raise HTTPException(
                    status_code=400,
                    detail="Failed to create facilitator - no data returned"
                )

        except HTTPException:
            raise
        except Exception as e:
            print(f"Error creating facilitator with PropelAuth account: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create facilitator with PropelAuth account. {str(e)}"
            )

    async def create_facilitator_with_multiple_facilities(self, db: AsyncClient, facilitator_data: FacilitatorCreate, facility_ids: List[str]) -> Dict[str, Any]:
        """Create a facilitator with PropelAuth user account and multiple facility associations"""
        try:
            # First, create the PropelAuth user
            propelauth_user = await self.create_propelauth_user(facilitator_data, facilitator_data.password)

            print(f"PropelAuth user ID: {propelauth_user}")
            
            # Update the facilitator data with the PropelAuth user ID
            facilitator_data.propelauth_user_id = UUID(propelauth_user["user_id"])
            
            # Validate that facility_ids is not empty
            if not facility_ids:
                raise HTTPException(
                    status_code=400,
                    detail="At least one facility_id must be provided"
                )
            
            # Generate a UUID for the facilitator_id
            import uuid
            facilitator_uuid = uuid.uuid4()
            
            # Prepare the data for database insertion
            facilitator_dict = facilitator_data.model_dump()
            # Convert UUIDs to strings for database storage
            facilitator_dict["propelauth_user_id"] = str(propelauth_user["user_id"])
            facilitator_dict["created_at"] = datetime.now().isoformat()
            facilitator_dict["updated_at"] = datetime.now().isoformat()
            # Set the facilitator_id to the generated UUID
            facilitator_dict["facilitator_id"] = str(facilitator_uuid)
            # Add computed full name for search purposes
            facilitator_dict["facilitator_full_name"] = f"{facilitator_data.facilitator_first_name} {facilitator_data.facilitator_last_name}".strip()
            # Remove password field as it's not stored in the database
            facilitator_dict.pop("password", None)
            # Remove facility_id as we'll handle it separately
            facilitator_dict.pop("facility_id", None)
            
            print(f"Facilitator dictionary: {facilitator_dict}")
            
            # Create the facilitator in the database using direct query
            result = await db.table("facilitators").insert(facilitator_dict).execute()
            
            if not result.data:
                print(f"Failed to create facilitator - no data returned: {result.data}")
                raise HTTPException(
                    status_code=400,
                    detail="Failed to create facilitator - no data returned"
                )
            
            created_facilitator = Facilitator(**result.data[0])
            
            # Create user-facility associations for each facility
            user_facilities = []
            for facility_id in facility_ids:
                # Check if user_facility exists
                existing_user_facility = await db.table("user_facility").select("*").eq("user_id", str(propelauth_user["user_id"])).eq("facility_id", facility_id).execute()
                
                # Prepare user_facility data as dictionary
                user_facility_dict = {
                    "user_facility_id": str(uuid.uuid4()),  # Generate UUID for user_facility_id
                    "user_id": str(facilitator_uuid),
                    "facility_id": str(facility_id)
                }
                
                if existing_user_facility.data:
                    # Update existing record
                    user_facility_result = await db.table("user_facility").update(user_facility_dict).eq("user_id", str(propelauth_user["user_id"])).eq("facility_id", facility_id).execute()
                else:
                    # Insert new record
                    user_facility_result = await db.table("user_facility").insert(user_facility_dict).execute()
                
                if user_facility_result.data:
                    user_facilities.append(user_facility_result.data[0])
            
            return {
                "facilitator": created_facilitator,
                "user_facilities": user_facilities,
                "propelauth_user": propelauth_user
            }

        except HTTPException:
            raise
        except Exception as e:
            print(f"Error creating facilitator with multiple facilities: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create facilitator with multiple facilities. {str(e)}"
            )

    async def get_facilitator_by_id(self, db: AsyncClient, facilitator_id: str) -> Optional[Facilitator]:
        """Get a facilitator by their ID"""
        try:
            # Use direct database query since base CRUD expects 'id' field but schema uses 'facilitator_id'
            result = await db.table("facilitators").select("*").eq("facilitator_id", facilitator_id).neq("deleted", True).execute()
            data = result.data
            return Facilitator(**data[0]) if data else None
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilitator. {str(e)}"
            )

    async def get_all_facilitators(self, db: AsyncClient) -> List[Facilitator]:
        """Get all facilitators"""
        try:
            result = await db.table("facilitators").select("*").neq("deleted", True).execute()
            data = result.data
            return [Facilitator(**item) for item in data]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilitators. {str(e)}"
            )

    async def get_facilitators_paginated(
        self, 
        db: AsyncClient, 
        page: int = 1, 
        page_size: int = 10,
        search: str = "",
        facility_id: str = None,
        sort_by: str = "facilitator_full_name",
        sort_order: str = "asc"
    ) -> dict:
        """Get paginated facilitators with optional facility filter and sorting, including all associated facilities"""
        try:
            # Calculate offset
            offset = (page - 1) * page_size
            
            # Build base query for count
            count_query = db.table("facilitators").select("*", count="exact").neq("deleted", True)
            
            # Add facility filter to count query if provided
            if facility_id:
                count_query = count_query.eq("facility_id", facility_id)
            
            # Get total count
            count_result = await count_query.execute()
            total_count = count_result.count if count_result.count is not None else 0
            
            # Build base query for data
            query = db.table("facilitators").select("*").range(offset, offset + page_size - 1).neq("deleted", True)
            
            # Add facility filter if provided
            if facility_id:
                query = query.eq("facility_id", facility_id)
            
            # Add search filter if provided
            if search:
                query = query.or_(f"facilitator_full_name.ilike.%{search}%,facilitator_first_name.ilike.%{search}%,facilitator_last_name.ilike.%{search}%,facilitator_email.ilike.%{search}%")
            
            # Add sorting
            if sort_by and sort_order:
                # Validate sort_by field to prevent SQL injection
                valid_sort_fields = [
                    "facilitator_full_name", "facilitator_first_name", "facilitator_last_name", 
                    "facilitator_email", "facilitator_phone_number", "created_at", "updated_at"
                ]
                if sort_by not in valid_sort_fields:
                    sort_by = "facilitator_full_name"  # Default to name if invalid field
                
                # Validate sort_order
                if sort_order.lower() not in ["asc", "desc"]:
                    sort_order = "asc"  # Default to ascending if invalid order
                
                # Apply sorting
                if sort_order.lower() == "desc":
                    query = query.order(sort_by, desc=True)
                else:
                    query = query.order(sort_by, desc=False)
            
            data_result = await query.execute()
            items = data_result.data
            
            # For each facilitator, get their associated facilities
            facilitators_with_facilities = []
            for item in items:
                print(f"Processing facilitator: {item['facilitator_id']} - {item['facilitator_full_name']}")
                
                # Get facilities for this facilitator from user_facility table
                # Note: user_facility.user_id stores the propelauth_user_id, not facilitator_id
                user_facility_result = await db.table("user_facility").select("*").eq("user_id", str(item["facilitator_id"])).execute()
                
             
                facilities = []
                if user_facility_result.data:
                    # Get facility details for each facility_id
                    for uf_item in user_facility_result.data:
                        facility_result = await db.table("facility_entity").select("*").eq("facility_id", uf_item["facility_id"]).execute()
                        print(f"Facility result: {facility_result.data}")
                        if facility_result.data:
                            facilities.append(facility_result.data[0])
                
                # Debug: Print facilities for current facilitator
                print(f"Facilitator {item['facilitator_id']}: Found {len(facilities)} facilities")
                if facilities:
                    print(f"Facility IDs: {[f['facility_id'] for f in facilities]}")
                
                # Create FacilitatorWithFacilities object
                facilitator_with_facilities = FacilitatorWithFacilities(
                    **item,
                    facilities=facilities
                )
                facilitators_with_facilities.append(facilitator_with_facilities)
            
            # Calculate total pages
            total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1
            
            return {
                "items": facilitators_with_facilities,
                "total": total_count,
                "page": page,
                "page_size": page_size,
                "total_pages": total_pages,
                "sort_by": sort_by,
                "sort_order": sort_order,
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching paginated facilitators. {str(e)}"
            )

    async def get_facilitators_by_facility(self, db: AsyncClient, facility_id: str) -> List[Facilitator]:
        """Get all facilitators for a specific facility"""
        try:
            result = await db.table("facilitators").select("*").eq("facility_id", facility_id).neq("deleted", True).execute()
            data = result.data
            return [Facilitator(**item) for item in data]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilitators for facility. {str(e)}"
            )

    async def get_facilitator_by_propelauth_user_id(self, db: AsyncClient, propelauth_user_id: str) -> Optional[Facilitator]:
        """Get a facilitator by PropelAuth user ID"""
        try:
            result = await db.table("facilitators").select("*").eq("propelauth_user_id", propelauth_user_id).neq("deleted", True).execute()
            data = result.data
            return Facilitator(**data[0]) if data else None
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching facilitator by PropelAuth user ID. {str(e)}"
            )

    async def get_user_facilities_by_facilitator_id(self, db: AsyncClient, facilitator_id: str) -> List[Dict[str, Any]]:
        """Get all user-facility associations for a specific facilitator"""
        try:
            # First get the facilitator to ensure it exists
            facilitator = await self.get_facilitator_by_id(db=db, facilitator_id=facilitator_id)
            if not facilitator:
                raise HTTPException(
                    status_code=404,
                    detail=f"Facilitator with ID {facilitator_id} not found"
                )
            
            # Get user-facility associations using facilitator_id as user_id
            # (consistent with create_facilitator_with_multiple_facilities method)
            result = await db.table("user_facility").select("*").eq("user_id", str(facilitator_id)).execute()
            return result.data if result.data else []
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching user facilities. {str(e)}"
            )

    async def update_facilitator(self, db: AsyncClient, facilitator_id: str, facilitator_data: FacilitatorUpdate) -> Facilitator:
        """Update facilitator information"""
        try:
            # First, get the existing facilitator to ensure it exists
            existing_facilitator = await self.get_facilitator_by_id(db=db, facilitator_id=facilitator_id)
            if not existing_facilitator:
                raise HTTPException(
                    status_code=404,
                    detail=f"Facilitator with ID {facilitator_id} not found"
                )
            
            # Create update data excluding None values
            update_data = facilitator_data.model_dump(exclude_unset=True)
            
            # Update full name if first or last name is being updated
            if (facilitator_data.facilitator_first_name is not None or 
                facilitator_data.facilitator_last_name is not None):
                
                # Get the current first and last names
                new_first_name = facilitator_data.facilitator_first_name or existing_facilitator.facilitator_first_name
                new_last_name = facilitator_data.facilitator_last_name or existing_facilitator.facilitator_last_name
                
                # Update the full name
                update_data["facilitator_full_name"] = f"{new_first_name} {new_last_name}".strip()
            
            # Update the facilitator using direct database query
            result = await db.table("facilitators").update(update_data).eq("facilitator_id", facilitator_id).execute()
            
            if result.data:
                updated_facilitator = Facilitator(**result.data[0])
                
                # Update PropelAuth user metadata if phone number or facility changed
                if (facilitator_data.facilitator_phone_number is not None or 
                    facilitator_data.facility_id is not None):
                    
                    metadata = {}
                    if facilitator_data.facilitator_phone_number is not None:
                        metadata["phone_number"] = facilitator_data.facilitator_phone_number
                    if facilitator_data.facility_id is not None:
                        metadata["facility_id"] = str(facilitator_data.facility_id)
                    metadata["user_type"] = "facilitator"
                    
                    # Update PropelAuth metadata
                    await self.update_propelauth_user_metadata(
                        str(existing_facilitator.propelauth_user_id), 
                        metadata
                    )
                
                return updated_facilitator
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to update facilitator - no data returned"
                )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update facilitator. {str(e)}"
            )

    async def update_facilitator_with_multiple_facilities(self, db: AsyncClient, facilitator_id: str, facilitator_data: FacilitatorUpdateWithMultipleFacilities) -> Dict[str, Any]:
        """Update facilitator information with multiple facility associations"""
        try:
            # First, get the existing facilitator to ensure it exists
            existing_facilitator = await self.get_facilitator_by_id(db=db, facilitator_id=facilitator_id)
            if not existing_facilitator:
                raise HTTPException(
                    status_code=404,
                    detail=f"Facilitator with ID {facilitator_id} not found"
                )
            
            # Create update data excluding None values and facility_ids
            update_data = facilitator_data.model_dump(exclude_unset=True, exclude={"facility_ids"})
            
            # Add updated_at timestamp
            update_data["updated_at"] = datetime.now().isoformat()
            
            # Update full name if first or last name is being updated
            if (facilitator_data.facilitator_first_name is not None or 
                facilitator_data.facilitator_last_name is not None):
                
                # Get the current first and last names
                new_first_name = facilitator_data.facilitator_first_name or existing_facilitator.facilitator_first_name
                new_last_name = facilitator_data.facilitator_last_name or existing_facilitator.facilitator_last_name
                
                # Update the full name
                update_data["facilitator_full_name"] = f"{new_first_name} {new_last_name}".strip()
            
            # Update the facilitator using direct database query
            result = await db.table("facilitators").update(update_data).eq("facilitator_id", facilitator_id).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to update facilitator - no data returned"
                )
            
            updated_facilitator = Facilitator(**result.data[0])
            
            # Handle facility associations if facility_ids is provided
            user_facilities = []
            if facilitator_data.facility_ids is not None:
                try:
                    # First, get existing user-facility associations to log what we're deleting
                    existing_user_facilities = await db.table("user_facility").select("*").eq("user_id", str(facilitator_id)).execute()
                    existing_count = len(existing_user_facilities.data) if existing_user_facilities.data else 0
                    print(f"Deleting {existing_count} existing user-facility associations for facilitator {facilitator_id}")
                    
                    # Delete ALL existing user-facility associations for this facilitator
                    delete_result = await db.table("user_facility").delete().eq("user_id", str(facilitator_id)).execute()
                    deleted_count = len(delete_result.data) if delete_result.data else 0
                    print(f"Successfully deleted {deleted_count} user-facility associations")
                    
                    # If facility_ids is not empty, create new associations
                    if facilitator_data.facility_ids:
                        # Create new user-facility associations for each facility_id
                        for facility_id in facilitator_data.facility_ids:
                            user_facility_dict = {
                                "user_facility_id": str(uuid.uuid4()),
                                "user_id": str(facilitator_id),  # Use facilitator_id as user_id (consistent with create method)
                                "facility_id": str(facility_id),
                            }
                            
                            user_facility_result = await db.table("user_facility").insert(user_facility_dict).execute()
                            if user_facility_result.data:
                                user_facilities.append(user_facility_result.data[0])
                                print(f"Created user-facility association: facilitator {facilitator_id} -> facility {facility_id}")
                            else:
                                print(f"Failed to create user-facility association: facilitator {facilitator_id} -> facility {facility_id}")
                        
                        print(f"Successfully created {len(user_facilities)} new user-facility associations")
                    else:
                        print(f"No new facility associations to create (facility_ids is empty)")
                    
                except Exception as e:
                    print(f"Error handling facility associations: {str(e)}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to update facility associations: {str(e)}"
                    )
            
            # Update PropelAuth user metadata if phone number changed
            if facilitator_data.facilitator_phone_number is not None:
                metadata = {
                    "phone_number": facilitator_data.facilitator_phone_number,
                    "user_type": "facilitator"
                }
                
                # Update PropelAuth metadata
                await self.update_propelauth_user_metadata(
                    str(existing_facilitator.propelauth_user_id), 
                    metadata
                )
            
            return {
                "facilitator": updated_facilitator,
                "user_facilities": user_facilities
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update facilitator with multiple facilities. {str(e)}"
            )

    async def delete_facilitator(self, db: AsyncClient, facilitator_id: str) -> Facilitator:
        """Delete a facilitator by ID (soft delete)"""
        try:
            # Use direct database query for soft delete
            result = await db.table("facilitators").update({"deleted": True}).eq("facilitator_id", facilitator_id).execute()
            data = result.data
            return Facilitator(**data[0]) if data else None
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete facilitator. {str(e)}"
            )

    async def search_facilitators(self, db: AsyncClient, field: str, search_value: str, max_results: int = 10) -> List[Facilitator]:
        """Search facilitators by field and value"""
        try:
            # Use direct database query for search
            result = await db.table("facilitators").select("*").ilike(field, f"%{search_value}%").limit(max_results).neq("deleted", True).execute()
            data = result.data
            return [Facilitator(**item) for item in data]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while searching facilitators. {str(e)}"
            )

    async def change_facilitator_password(self, facilitator_id: str, new_password: str) -> bool:
        """Change a facilitator's password via PropelAuth"""
        try:
            # Validate PropelAuth configuration
            if not self.propelauth_url or not self.propelauth_api_key:
                raise HTTPException(
                    status_code=500,
                    detail="PropelAuth configuration is missing. Please check PROPEL_AUTH_URL and PROPEL_API_KEY."
                )
            
            # First, get the facilitator to find their PropelAuth user ID
            db = await get_supabase_client()
            facilitator = await self.get_facilitator_by_id(db=db, facilitator_id=facilitator_id)
            
            if not facilitator:
                raise HTTPException(
                    status_code=404,
                    detail=f"Facilitator with ID {facilitator_id} not found"
                )
            
            # Update password in PropelAuth
            headers = {
                "Authorization": f"Bearer {self.propelauth_api_key}",
                "Content-Type": "application/json"
            }
            
            password_update_response = requests.put(
                f"{self.propelauth_url}/api/backend/v1/user/{facilitator.propelauth_user_id}/password",
                json={
                    "password": new_password,
                    "ask_user_to_update_password_on_login": False
                },
                headers=headers,
                timeout=30
            )
            
            if password_update_response.status_code == 200:
                return True
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to update password. PropelAuth response: {password_update_response.text}"
                )
                
        except HTTPException:
            raise
        except requests.exceptions.RequestException as e:
            raise HTTPException(
                status_code=500,
                detail=f"PropelAuth API request failed: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to change password. {str(e)}"
            )


# Create a singleton instance
facilitator_service = FacilitatorService()
