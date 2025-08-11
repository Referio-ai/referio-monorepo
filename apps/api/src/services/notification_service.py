from typing import List, Optional
from uuid import UUID

from supabase import AsyncClient

from src.crud.notifications import notifications_crud
from src.schemas.notifications import (
    Notification,
    NotificationCreate,
    NotificationUpdate,
    NotificationPagination,
    NotificationStats
)


class NotificationService:
    
    @staticmethod
    async def get_notifications_paginated(
        db: AsyncClient, 
        *, 
        page: int = 1, 
        page_size: int = 10, 
        search: str = ""
    ) -> NotificationPagination:
        """Get notifications with pagination"""
        notifications, pagination_info = await notifications_crud.get_all_paginated(
            db, page=page, page_size=page_size, search=search
        )
        
        return NotificationPagination(
            items=notifications,
            total=pagination_info["total"],
            page=page,
            page_size=page_size,
            total_pages=pagination_info["total_pages"]
        )

    @staticmethod
    async def get_notification_by_id(db: AsyncClient, *, notification_id: str) -> Notification:
        """Get a specific notification by ID"""
        return await notifications_crud.get(db, id=notification_id)

    @staticmethod
    async def get_notifications_by_facility(db: AsyncClient, *, user_id: str) -> List[Notification]:
        """Get all notifications for all facilities that a user has access to"""
        return await notifications_crud.get_by_facility(db, user_id=user_id)

    @staticmethod
    async def get_notifications_by_user_facilities(db: AsyncClient, *, user_id: str) -> List[Notification]:
        """Get all notifications for user's facilities"""
        return await notifications_crud.get_by_user_facilities(db, user_id=user_id)

    @staticmethod
    async def get_unread_notifications_by_user(db: AsyncClient, *, user_id: str) -> List[Notification]:
        """Get unread notifications for a user"""
        return await notifications_crud.get_unread_by_user(db, user_id=user_id)

    @staticmethod
    async def create_notification(db: AsyncClient, *, notification_data: NotificationCreate) -> Notification:
        """Create a new notification"""
        return await notifications_crud.create(db, obj_in=notification_data)

    @staticmethod
    async def update_notification(db: AsyncClient, *, notification_data: NotificationUpdate) -> Notification:
        """Update a notification"""
        return await notifications_crud.update(db, obj_in=notification_data)

    @staticmethod
    async def mark_notification_as_seen(db: AsyncClient, *, notification_id: str, user_id: str) -> Notification:
        """Mark a notification as seen by a user"""
        return await notifications_crud.mark_as_seen(db, notification_id=notification_id, user_id=user_id)

    @staticmethod
    async def mark_all_notifications_as_seen(
        db: AsyncClient, 
        *, 
        user_id: str, 
        facility_id: Optional[str] = None
    ) -> dict:
        """Mark all notifications as seen for a user"""
        return await notifications_crud.mark_all_as_seen(db, user_id=user_id, facility_id=facility_id)

    @staticmethod
    async def delete_notification(db: AsyncClient, *, notification_id: str) -> Notification:
        """Delete a notification"""
        return await notifications_crud.delete(db, id=notification_id)

    @staticmethod
    async def get_notification_stats_by_user(db: AsyncClient, *, user_id: str) -> NotificationStats:
        """Get notification statistics for a user"""
        stats = await notifications_crud.get_stats_by_user(db, user_id=user_id)
        return NotificationStats(**stats)

    @staticmethod
    async def create_referral_notification(
        db: AsyncClient,
        *,
        referral_id: str,
        facility_id: str,
        notification_type: str,
        title: str,
        message: str,
        created_by_id: Optional[str] = None,
        created_by_name: Optional[str] = None,
        have_link: Optional[str] = None
    ) -> Notification:
        """Create a notification for referral events"""
        notification_data = NotificationCreate(
            type=notification_type,
            value=referral_id,
            message=message,
            title=title,
            have_link=have_link or f"/referral-management/referral-list/{referral_id}",
            facility_id=UUID(facility_id),
            created_by_id=UUID(created_by_id) if created_by_id else None,
            created_by_name=created_by_name
        )
        return await notifications_crud.create(db, obj_in=notification_data)

    @staticmethod
    async def create_batch_notification(
        db: AsyncClient,
        *,
        batch_id: str,
        facility_id: str,
        notification_type: str,
        title: str,
        message: str,
        created_by_id: Optional[str] = None,
        created_by_name: Optional[str] = None,
        have_link: Optional[str] = None
    ) -> Notification:
        """Create a notification for batch events"""
        notification_data = NotificationCreate(
            type=notification_type,
            value=batch_id,
            message=message,
            title=title,
            have_link=have_link or f"/referral-management/referral-management/{batch_id}",
            facility_id=UUID(facility_id),
            created_by_id=UUID(created_by_id) if created_by_id else None,
            created_by_name=created_by_name
        )
        return await notifications_crud.create(db, obj_in=notification_data)

    @staticmethod
    async def create_facilitator_notification(
        db: AsyncClient,
        *,
        facilitator_id: str,
        facility_id: str,
        notification_type: str,
        title: str,
        message: str,
        created_by_id: Optional[str] = None,
        created_by_name: Optional[str] = None,
        have_link: Optional[str] = None
    ) -> Notification:
        """Create a notification for facilitator events"""
        notification_data = NotificationCreate(
            type=notification_type,
            value=facilitator_id,
            message=message,
            title=title,
            have_link=have_link or f"/referral-management/facilitator/{facilitator_id}",
            facility_id=UUID(facility_id),
            created_by_id=UUID(created_by_id) if created_by_id else None,
            created_by_name=created_by_name
        )
        return await notifications_crud.create(db, obj_in=notification_data)

    @staticmethod
    async def create_system_notification(
        db: AsyncClient,
        *,
        notification_type: str,
        title: str,
        message: str,
        value: str,
        created_by_id: Optional[str] = None,
        created_by_name: Optional[str] = None,
        have_link: Optional[str] = None
    ) -> Notification:
        """Create a system-wide notification"""
        notification_data = NotificationCreate(
            type=notification_type,
            value=value,
            message=message,
            title=title,
            have_link=have_link,
            facility_id=None,  # System-wide notification
            created_by_id=UUID(created_by_id) if created_by_id else None,
            created_by_name=created_by_name
        )
        return await notifications_crud.create(db, obj_in=notification_data)


notification_service = NotificationService() 