from typing import List
from uuid import UUID

from fastapi import APIRouter, Form, HTTPException, UploadFile
from src.crud.referrals import referrals_crud
from src.schemas.referral_messages import (
    ReferralMessages, 
    ReferralMessagesCreate,
    ReferralMessagesUpdate,
)
from src.config.supabase_config import get_supabase_client
from src.crud.referrals_messages import referral_messages_crud

router = APIRouter()


@router.get("/{referral_id}", status_code=200)
async def get_messages_by_referral_id(referral_id: str):
    """Get all messages by referral ID"""
    db = await get_supabase_client()
    return await referral_messages_crud.get_messages_by_referral_id(db=db, referral_id=referral_id)


@router.post("/", status_code=201)
async def create_message(message: ReferralMessagesCreate):
    """Create a new message for a referral"""
    db = await get_supabase_client()
    return await referral_messages_crud.create(db=db, obj_in=message)


@router.post("/upload/{message_id}/{type}", status_code=200)
async def upload_referral_document(
    message_id: str,
    type: str,
    files: List[UploadFile] = Form(None),
):
    """Upload a document for a referral messages"""
    db = await get_supabase_client()
    return await referrals_crud.upload_files(db=db, id=message_id, files=files, type=type, bucket_name="referral-documents", base_path="messages")


@router.get("/file/{message_id}/{type}", status_code=200)
async def get_referral_files(
    message_id: str,
    type: str,
) :
    """Get a file for a referral messages"""
    db = await get_supabase_client()
    return await referrals_crud.get_files(db=db, id=message_id, type=type, bucket_name="referral-documents", base_path="messages")