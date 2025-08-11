from typing import List

from fastapi import APIRouter, HTTPException
from src.schemas.notifications import (
    Notification, 
    NotificationCreate,
    NotificationUpdate,
    NotificationPagination,
    NotificationStats,
    NotificationMarkSeen,
)
from src.config.supabase_config import get_supabase_client
from src.services.notification_service import notification_service

router = APIRouter()


@router.get("/", status_code=200)
async def get_notifications(page: int = 1, page_size: int = 10, search: str = "") -> NotificationPagination:
    """Get all notifications with pagination"""
    try:
        db = await get_supabase_client()
        return await notification_service.get_notifications_paginated(db=db, page=page, page_size=page_size, search=search)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching notifications. {str(e)}",
        )


@router.get("/{notification_id}", status_code=200)
async def get_notification(notification_id: str) -> Notification:
    """Get a specific notification by ID"""
    try:
        db = await get_supabase_client()
        return await notification_service.get_notification_by_id(db=db, notification_id=notification_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching notification. {str(e)}",
        )


@router.get("/facility/{user_id}", status_code=200)
async def get_notifications_by_facility(user_id: str) -> List[Notification]:
    """Get all notifications for all facilities that a user has access to"""
    try:
        db = await get_supabase_client()
        return await notification_service.get_notifications_by_facility(db=db, user_id=user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching notifications for user facilities. {str(e)}",
        )


@router.get("/user/{user_id}", status_code=200)
async def get_notifications_by_user(user_id: str) -> List[Notification]:
    """Get all notifications for user's facilities"""
    try:
        db = await get_supabase_client()
        return await notification_service.get_notifications_by_user_facilities(db=db, user_id=user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching notifications for user. {str(e)}",
        )


@router.get("/user/{user_id}/unread", status_code=200)
async def get_unread_notifications_by_user(user_id: str) -> List[Notification]:
    """Get unread notifications for a user"""
    try:
        db = await get_supabase_client()
        return await notification_service.get_unread_notifications_by_user(db=db, user_id=user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching unread notifications. {str(e)}",
        )


@router.get("/user/{user_id}/unread/count", status_code=200)
async def get_unread_notifications_count(user_id: str) -> dict:
    """Get unread notifications count for a user"""
    try:
        db = await get_supabase_client()
        stats = await notification_service.get_notification_stats_by_user(db=db, user_id=user_id)
        return {"unread_count": stats.unread_notifications}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching unread notifications count. {str(e)}",
        )


@router.get("/user/{user_id}/stats", status_code=200)
async def get_notification_stats_by_user(user_id: str) -> NotificationStats:
    """Get notification statistics for a user"""
    try:
        db = await get_supabase_client()
        return await notification_service.get_notification_stats_by_user(db=db, user_id=user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching notification stats. {str(e)}",
        )


@router.post("/", status_code=201)
async def create_notification(notification: NotificationCreate) -> Notification:
    """Create a new notification"""
    try:
        db = await get_supabase_client()
        return await notification_service.create_notification(db=db, notification_data=notification)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create notification. {str(e)}",
        )


@router.put("/{notification_id}", status_code=200)
async def update_notification(notification_id: str, notification: NotificationUpdate) -> Notification:
    """Update a notification"""
    try:
        db = await get_supabase_client()
        notification.notification_id = notification_id
        return await notification_service.update_notification(db=db, notification_data=notification)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update notification. {str(e)}",
        )


@router.post("/{notification_id}/mark-seen", status_code=200)
async def mark_notification_as_seen(notification_id: str, mark_seen: NotificationMarkSeen) -> Notification:
    """Mark a notification as seen by a user"""
    try:
        db = await get_supabase_client()
        return await notification_service.mark_notification_as_seen(
            db=db, 
            notification_id=notification_id, 
            user_id=mark_seen.user_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to mark notification as seen. {str(e)}",
        )


@router.post("/user/{user_id}/mark-all-seen", status_code=200)
async def mark_all_notifications_as_seen(user_id: str, facility_id: str = None) -> dict:
    """Mark all notifications as seen for a user"""
    try:
        db = await get_supabase_client()
        return await notification_service.mark_all_notifications_as_seen(
            db=db, 
            user_id=user_id, 
            facility_id=facility_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to mark notifications as seen. {str(e)}",
        )


@router.delete("/{notification_id}", status_code=200)
async def delete_notification(notification_id: str) -> Notification:
    """Delete a notification"""
    try:
        db = await get_supabase_client()
        return await notification_service.delete_notification(db=db, notification_id=notification_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to delete notification. {str(e)}",
        )


# Convenience endpoints for creating specific types of notifications

@router.post("/referral", status_code=201)
async def create_referral_notification(
    referral_id: str,
    facility_id: str,
    notification_type: str,
    title: str,
    message: str,
    created_by_id: str = None,
    created_by_name: str = None,
    have_link: str = None
) -> Notification:
    """Create a notification for referral events"""
    try:
        db = await get_supabase_client()
        return await notification_service.create_referral_notification(
            db=db,
            referral_id=referral_id,
            facility_id=facility_id,
            notification_type=notification_type,
            title=title,
            message=message,
            created_by_id=created_by_id,
            created_by_name=created_by_name,
            have_link=have_link
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create referral notification. {str(e)}",
        )


@router.post("/batch", status_code=201)
async def create_batch_notification(
    batch_id: str,
    facility_id: str,
    notification_type: str,
    title: str,
    message: str,
    created_by_id: str = None,
    created_by_name: str = None,
    have_link: str = None
) -> Notification:
    """Create a notification for batch events"""
    try:
        db = await get_supabase_client()
        return await notification_service.create_batch_notification(
            db=db,
            batch_id=batch_id,
            facility_id=facility_id,
            notification_type=notification_type,
            title=title,
            message=message,
            created_by_id=created_by_id,
            created_by_name=created_by_name,
            have_link=have_link
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create batch notification. {str(e)}",
        )


@router.post("/facilitator", status_code=201)
async def create_facilitator_notification(
    facilitator_id: str,
    facility_id: str,
    notification_type: str,
    title: str,
    message: str,
    created_by_id: str = None,
    created_by_name: str = None,
    have_link: str = None
) -> Notification:
    """Create a notification for facilitator events"""
    try:
        db = await get_supabase_client()
        return await notification_service.create_facilitator_notification(
            db=db,
            facilitator_id=facilitator_id,
            facility_id=facility_id,
            notification_type=notification_type,
            title=title,
            message=message,
            created_by_id=created_by_id,
            created_by_name=created_by_name,
            have_link=have_link
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create facilitator notification. {str(e)}",
        )


@router.post("/system", status_code=201)
async def create_system_notification(
    notification_type: str,
    title: str,
    message: str,
    value: str,
    created_by_id: str = None,
    created_by_name: str = None,
    have_link: str = None
) -> Notification:
    """Create a system-wide notification"""
    try:
        db = await get_supabase_client()
        return await notification_service.create_system_notification(
            db=db,
            notification_type=notification_type,
            title=title,
            message=message,
            value=value,
            created_by_id=created_by_id,
            created_by_name=created_by_name,
            have_link=have_link
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create system notification. {str(e)}",
        ) 