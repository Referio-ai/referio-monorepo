from typing import Optional, List
from uuid import UUID
import json

from fastapi import HTTPException
from supabase import AsyncClient

from src.crud.base import CRUDBase
from src.schemas.notifications import Notification, NotificationCreate, NotificationUpdate


class CRUDNotifications(CRUDBase[Notification, NotificationCreate, NotificationUpdate]):

    async def get(self, db: AsyncClient, *, id: str) -> Optional[Notification]:
        """Get a notification by ID"""
        try:
            return await super().get("notifications", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Notification not found. {str(e)}",
            )

    async def get_all(self, db: AsyncClient) -> List[Notification]:
        """Get all notifications"""
        try:
            return await super().get_all("notifications", db)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching notifications. {str(e)}",
            )
        
    async def get_all_paginated(self, db: AsyncClient, *, page: int = 1, page_size: int = 10, search: str = "") -> List[Notification]:
        """Get all notifications paginated"""
        try:
            return await super().get_all_paginated("notifications", db, page=page, page_size=page_size, search=search)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching notifications. {str(e)}",
            )

    async def get_by_facility(self, db: AsyncClient, *, user_id: str) -> List[Notification]:
        """Get all notifications for all facilities that a user has access to"""
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
            # Get user's facilities
            user_facilities_result = await db.table("user_facility").select("facility_id").eq("user_id", facilitator_id).execute()
            facility_ids = [uf["facility_id"] for uf in user_facilities_result.data]
            
            if not facility_ids:
                return []
            
            # Get notifications for user's facilities and system-wide notifications
            result = await db.table("notifications").select("*").in_("facility_id", facility_ids).eq("is_active", True).execute()
            system_notifications_result = await db.table("notifications").select("*").is_("facility_id", None).eq("is_active", True).execute()
            
            data = result.data + system_notifications_result.data
            
            # Convert to Notification objects and sort by unseen status (unseen first)
            notifications = []
            for item in data:
                notification = Notification(**item)
                notifications.append(notification)
            
            # Sort notifications: unseen notifications first, then by created_at (newest first)
            def sort_key(notification):
                users_seen = notification.users_seen or []
                is_unseen = user_id not in users_seen
                # Return tuple: (is_unseen, -created_at.timestamp()) 
                # is_unseen is False (0) for seen, True (1) for unseen
                # Negative timestamp for descending order (newest first)
                return (not is_unseen, -notification.created_at.timestamp())
            
            notifications.sort(key=sort_key)
            
            return notifications
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching notifications for user facilities. {str(e)}",
            )

    async def get_by_user_facilities(self, db: AsyncClient, *, user_id: str) -> List[Notification]:
        """Get all notifications for user's facilities"""
        try:
            # Get user's facilities
            user_facilities_result = await db.table("user_facility").select("facility_id").eq("user_id", user_id).execute()
            facility_ids = [uf["facility_id"] for uf in user_facilities_result.data]
            
            if not facility_ids:
                return []
            
            # Get notifications for user's facilities and system-wide notifications
            result = await db.table("notifications").select("*").in_("facility_id", facility_ids).eq("is_active", True).execute()
            system_notifications_result = await db.table("notifications").select("*").is_("facility_id", None).eq("is_active", True).execute()
            
            data = result.data + system_notifications_result.data
            return [Notification(**item) for item in data]
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching notifications for user facilities. {str(e)}",
            )

    async def get_unread_by_user(self, db: AsyncClient, *, user_id: str) -> List[Notification]:
        """Get unread notifications for a user"""
        try:
            # Get user's facilities
            user_facilities_result = await db.table("user_facility").select("facility_id").eq("user_id", user_id).execute()
            facility_ids = [uf["facility_id"] for uf in user_facilities_result.data]
            
            if not facility_ids:
                return []
            
            # Get notifications where user is not in users_seen array
            result = await db.table("notifications").select("*").in_("facility_id", facility_ids).eq("is_active", True).execute()
            system_notifications_result = await db.table("notifications").select("*").is_("facility_id", None).eq("is_active", True).execute()
            
            all_notifications = result.data + system_notifications_result.data
            
            # Filter out notifications where user has already seen them
            unread_notifications = []
            for notification in all_notifications:
                users_seen = notification.get("users_seen", [])
                if user_id not in users_seen:
                    unread_notifications.append(Notification(**notification))
            
            return unread_notifications
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching unread notifications. {str(e)}",
            )

    async def create(self, db: AsyncClient, *, obj_in: NotificationCreate) -> Notification:
        """Create a new notification"""
        try:
            return await super().create("notifications", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to create notification. {str(e)}",
            )

    async def update(self, db: AsyncClient, *, obj_in: NotificationUpdate) -> Notification:
        """Update a notification"""
        try:
            return await super().update("notifications", db, obj_in=obj_in)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update notification. {str(e)}",
            )

    async def mark_as_seen(self, db: AsyncClient, *, notification_id: str, user_id: str) -> Notification:
        """Mark a notification as seen by a user"""
        try:
            # Get current notification
            notification = await db.table("notifications").select("*").eq("notification_id", notification_id).execute()
            if not notification.data:
                raise HTTPException(status_code=404, detail="Notification not found")
            
            # Add user to users_seen array if not already there
            users_seen = notification.data[0].get("users_seen", [])
            if user_id not in users_seen:
                users_seen.append(user_id)
                
                # Update the notification with dictionary data
                update_data = {"users_seen": users_seen}
                result = await db.table("notifications").update(update_data).eq("notification_id", notification_id).execute()
                
                if result.data:
                    return Notification(**result.data[0])
                else:
                    raise HTTPException(status_code=404, detail="Notification not found after update")
            
            return Notification(**notification.data[0])
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to mark notification as seen. {str(e)}",
            )

    async def mark_all_as_seen(self, db: AsyncClient, *, user_id: str, facility_id: Optional[str] = None) -> dict:
        """Mark all notifications as seen for a user in a facility"""
        try:
            # Get notifications for the user in the facility
            if facility_id:
                result = await db.table("notifications").select("*").eq("facility_id", facility_id).eq("is_active", True).execute()
            else:
                # Get all user's facilities
                user_facilities_result = await db.table("user_facility").select("facility_id").eq("user_id", user_id).execute()
                facility_ids = [uf["facility_id"] for uf in user_facilities_result.data]
                
                if not facility_ids:
                    return {"message": "No notifications to mark as seen"}
                
                result = await db.table("notifications").select("*").in_("facility_id", facility_ids).eq("is_active", True).execute()
                system_result = await db.table("notifications").select("*").is_("facility_id", None).eq("is_active", True).execute()
                result.data.extend(system_result.data)
            
            updated_count = 0
            for notification in result.data:
                users_seen = notification.get("users_seen", [])
                if user_id not in users_seen:
                    users_seen.append(user_id)
                    await db.table("notifications").update({"users_seen": users_seen}).eq("notification_id", notification["notification_id"]).execute()
                    updated_count += 1
            
            return {"message": f"Marked {updated_count} notifications as seen"}
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to mark notifications as seen. {str(e)}",
            )

    async def delete(self, db: AsyncClient, *, id: str) -> Notification:
        """Delete a notification"""
        try:
            return await super().delete("notifications", db, id=id)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to delete notification. {str(e)}",
            )

    async def get_stats_by_user(self, db: AsyncClient, *, user_id: str) -> dict:
        """Get notification statistics for a user"""
        try:
            # Get user's facilities

            # get the facilitator info from the facilitator table
            facilitator = await db.table("facilitators").select("*").eq("propelauth_user_id", user_id).execute()
            facilitator_data = facilitator.data
            
            if not facilitator_data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Facilitator not found for user_id: {user_id}",
                )
            
            facilitator_id = facilitator_data[0]["facilitator_id"]
   

            user_facilities_result = await db.table("user_facility").select("facility_id").eq("user_id", facilitator_id).execute()
            facility_ids = [uf["facility_id"] for uf in user_facilities_result.data]
            
            if not facility_ids:
                return {"total_notifications": 0, "unread_notifications": 0, "notifications_by_type": {}}

            # Get all notifications for user's facilities and system-wide
            result = await db.table("notifications").select("*").in_("value", facility_ids).eq("is_active", True).execute()
            system_result = await db.table("notifications").select("*").is_("value", None).eq("is_active", True).execute()
            
            all_notifications = result.data + system_result.data
            total_notifications = len(all_notifications)
            
            # Count unread notifications
            unread_count = 0
            notifications_by_type = {}
            
            for notification in all_notifications:
                notification_type = notification.get("type", "unknown")
                notifications_by_type[notification_type] = notifications_by_type.get(notification_type, 0) + 1
                
                users_seen = notification.get("users_seen", [])
                if user_id not in users_seen:
                    unread_count += 1
            
            return {
                "total_notifications": total_notifications,
                "unread_notifications": unread_count,
                "notifications_by_type": notifications_by_type
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"An error occurred while fetching notification stats. {str(e)}",
            )


notifications_crud = CRUDNotifications(Notification) 