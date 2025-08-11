from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, Form, HTTPException, UploadFile, Query
from src.crud.referrals import referrals_crud
from src.schemas.referral_messages import (
    ReferralMessages, 
    ReferralMessagesCreate,
    ReferralMessagesUpdate,
    AddMessageRequest,
    AddMessageWithContextRequest,
    AddSystemMessageRequest,
    UpdateMessageRequest,
    MessageHistoryResponse
)
from src.config.supabase_config import get_supabase_client
from src.crud.referrals_messages import referral_messages_crud
from src.services.referral_message_service import ReferralMessageService

router = APIRouter()


@router.get("/{referral_id}", status_code=200, response_model=Dict[str, Any])
async def get_messages_by_referral_id(
    referral_id: str,
    limit: Optional[int] = Query(10, description="Number of messages to return (default: 10)"),
    offset: Optional[int] = Query(0, description="Offset for pagination (default: 0)")
):
    """Get messages by referral ID with pagination, returning latest messages first"""
    db = await get_supabase_client()
    return await ReferralMessageService.get_messages_by_referral_id(
        db=db, 
        referral_id=referral_id,
        limit=limit,
        offset=offset
    )


@router.get("/{referral_id}/history", status_code=200, response_model=MessageHistoryResponse)
async def get_message_history(
    referral_id: str,
    limit: Optional[int] = Query(None, description="Number of messages to return"),
    offset: Optional[int] = Query(None, description="Offset for pagination")
):
    """Get paginated message history for a referral"""
    db = await get_supabase_client()
    return await ReferralMessageService.get_message_history(
        db=db, 
        referral_id=referral_id,
        limit=limit,
        offset=offset
    )


@router.post("/", status_code=201, response_model=ReferralMessages)
async def create_message(message: ReferralMessagesCreate):
    """Create a new message for a referral using service layer"""
    db = await get_supabase_client()
    return await ReferralMessageService.create_message(db=db, message_data=message)


@router.post("/{referral_id}/add", status_code=201, response_model=ReferralMessages)
async def add_message_to_referral(
    referral_id: str,
    request: AddMessageRequest
):
    """Add a message to a specific referral with validation"""
    db = await get_supabase_client()
    return await ReferralMessageService.add_message_to_referral(
        db=db,
        referral_id=referral_id,
        message=request.message,
        sender=request.sender,
        sender_id=request.sender_id,
        user_info=request.user_info
    )


@router.post("/{referral_id}/add-with-context", status_code=201, response_model=ReferralMessages)
async def add_message_with_user_context(
    referral_id: str,
    request: AddMessageWithContextRequest
):
    """Add a message to a referral with comprehensive user context"""
    db = await get_supabase_client()
    return await ReferralMessageService.add_message_with_user_context(
        db=db,
        referral_id=referral_id,
        message=request.message,
        sender_id=request.sender_id,
        user_name=request.user_name,
        user_role=request.user_role,
        additional_context=request.additional_context
    )


@router.post("/{referral_id}/system-message", status_code=201, response_model=ReferralMessages)
async def add_system_message(
    referral_id: str,
    request: AddSystemMessageRequest
):
    """Add a system-generated message to a referral"""
    db = await get_supabase_client()
    return await ReferralMessageService.add_system_message(
        db=db,
        referral_id=referral_id,
        message=request.message,
        system_action=request.system_action
    )


@router.put("/{message_id}/update", status_code=200, response_model=ReferralMessages)
async def update_message(
    message_id: str,
    request: UpdateMessageRequest
):
    """Update an existing message"""
    db = await get_supabase_client()
    return await ReferralMessageService.update_message(
        db=db,
        message_id=message_id,
        updated_message=request.updated_message,
        sender_id=request.sender_id
    )


@router.post("/upload/{message_id}/{type}", status_code=200)
async def upload_referral_document(
    message_id: str,
    type: str,
    files: List[UploadFile] = Form(None),
    document_category: Optional[str] = Form(None),
):
    """Upload a document for a referral messages"""
    db = await get_supabase_client()
    return await referrals_crud.upload_files(db=db, id=message_id, files=files, type=type, bucket_name="referral-documents", base_path="messages", document_category=document_category)


@router.post("/attachments/{message_id}", status_code=200)
async def upload_message_attachments(
    message_id: str,
    files: List[UploadFile] = Form(...),
    document_category: Optional[str] = Form(None),
):
    """Upload attachments for a specific message"""
    db = await get_supabase_client()
    return await ReferralMessageService.upload_message_attachments(
        db=db,
        message_id=message_id,
        files=files,
        document_category=document_category
    )


@router.get("/attachments/{message_id}", status_code=200)
async def get_message_attachments(
    message_id: str,
):
    """Get attachments for a specific message"""
    db = await get_supabase_client()
    return await ReferralMessageService.get_message_attachments(
        db=db,
        message_id=message_id
    )


@router.get("/file/{message_id}/{type}", status_code=200)
async def get_referral_files(
    message_id: str,
    type: str,
) :
    """Get a file for a referral messages"""
    db = await get_supabase_client()
    return await referrals_crud.get_files(db=db, id=message_id, type=type, bucket_name="referral-documents", base_path="messages")