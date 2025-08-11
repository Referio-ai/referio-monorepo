from typing import Optional, Dict, List, Any
from uuid import UUID, uuid4
from datetime import datetime
from supabase import AsyncClient
from fastapi import HTTPException, UploadFile

from src.crud.referrals_messages import referral_messages_crud
from src.schemas.referral_messages import ReferralMessages, ReferralMessagesCreate, ReferralMessagesUpdate
from src.crud.referrals import referrals_crud
from src.utils.supabase.supabase_utils import generate_signed_url


class ReferralMessageService:
    """Service for handling referral message operations"""

    @staticmethod
    async def add_message_to_referral(
        db: AsyncClient,
        referral_id: str,
        message: str,
        sender: str,
        sender_id: str,
        user_info: Optional[Dict[str, Any]] = None
    ) -> ReferralMessages:
        """
        Add a message to a specific referral with user info and timestamp
        
        Args:
            db: Database client
            referral_id: ID of the referral to add message to
            message: The message content
            sender: The sender of the message (user name or identifier)
            sender_id: The sender's user ID
            user_info: Optional dictionary containing user information
            
        Returns:
            ReferralMessages object with the created message
        """
        try:
            # Validate referral exists
            referral_result = await db.table("referrals").select("referral_id").eq("referral_id", referral_id).eq("deleted", False).execute()
            
            print(f"Referral result: {referral_result}")

            if not referral_result.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Referral with ID {referral_id} not found"
                )
            
            # Prepare message data for database insertion
            message_dict = {
                "referrals_messages_id": str(uuid4()),
                "message": message,
                "sender": sender,
                "sender_id": sender_id,
                "referral_id": referral_id,
                "created_at": datetime.now().isoformat(),
            }
            
            print(f"Message dict: {message_dict}")
            
            # Insert message into database
            result = await db.table("referrals_messages").insert(message_dict).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to create message"
                )
            
            # If user_info is provided, we can store additional context
            # This could be extended to store user details in a separate table or field
            if user_info:
                # Log user info for audit purposes (could be stored in a separate audit table)
                print(f"Message added by user: {user_info}")
            
            # Return the created message as ReferralMessages object
            created_message_data = result.data[0]
            return ReferralMessages(**created_message_data)
            
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            print(f"Error adding message to referral: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to add message to referral: {str(e)}"
            )

    @staticmethod
    async def upload_message_attachments(
        db: AsyncClient,
        message_id: str,
        files: List[UploadFile],
        document_category: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload attachments for a specific message and store them in the documents table
        
        Args:
            db: Database client
            message_id: ID of the message to attach files to
            files: List of files to upload
            document_category: Optional category for the documents
            
        Returns:
            Dictionary containing upload results and document records
        """
        try:
            # Validate message exists
            message_result = await db.table("referrals_messages").select("referrals_messages_id, referral_id").eq("referrals_messages_id", message_id).execute()
            
            if not message_result.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Message with ID {message_id} not found"
                )
            
            message_data = message_result.data[0]
            referral_id = message_data["referral_id"]
            
            # Step 1: Upload the files to Supabase storage
            print(f"Uploading attachments for message ID: {message_id}")
            upload_results = await referrals_crud.upload_files(
                db=db, 
                id=message_id, 
                files=files, 
                type="message_attachment",
                bucket_name="referral-documents",
                base_path="messages",
                document_category=document_category or "message_attachment"
            )
            
            if not upload_results:
                raise HTTPException(
                    status_code=400,
                    detail="No files were uploaded successfully"
                )
            
            # Step 2: Store document records in documents table with referrals_messages_id
            document_records = []
            
            for file_result in upload_results:
                print(f"Storing document record for file: {file_result.filename}")
                
                # Create document record using the documents table schema
                document_data = {
                    "source": file_result.signed_url,  # Store the signed URL as source
                    "referral_id": referral_id,
                    "patient_id": None,  # No patient extraction for message attachments
                    "document_category": getattr(file_result, 'document_category', document_category or "message_attachment"),
                    "referrals_messages_id": message_id,  # Link to the specific message
                }
                
                print(f"Document data to insert: {document_data}")
                
                # Insert into documents table
                result = await db.table("documents").insert(document_data).execute()
                print(f"Document insert result: {result}")
                
                if result.data:
                    document_record = {
                        "document_id": result.data[0]["document_id"],
                        "created_at": result.data[0]["created_at"],
                        "source": result.data[0]["source"],
                        "referral_id": result.data[0]["referral_id"],
                        "patient_id": result.data[0]["patient_id"],
                        "document_category": result.data[0].get("document_category"),
                        "referrals_messages_id": result.data[0].get("referrals_messages_id"),
                        "filename": file_result.filename,
                        "bucket_name": file_result.bucket_name,
                        "type": "message_attachment"
                    }
                    document_records.append(document_record)
                    print(f"Created document record for file: {file_result.filename} with ID: {result.data[0]['document_id']}")
                else:
                    print(f"Failed to create document record for file: {file_result.filename}")
            
            # Step 3: Return comprehensive results
            return {
                "upload_results": upload_results,
                "document_records": document_records,
                "message_id": message_id,
                "referral_id": referral_id,
                "document_category": document_category or "message_attachment",
                "processed_files": len(upload_results),
                "stored_documents": len(document_records),
                "summary": {
                    "total_files": len(upload_results),
                    "documents_stored": len(document_records),
                    "upload_success": len(upload_results) > 0,
                    "storage_success": len(document_records) == len(upload_results)
                }
            }
            
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            print(f"Error uploading message attachments: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload message attachments: {str(e)}"
            )

    @staticmethod
    async def get_message_attachments(
        db: AsyncClient,
        message_id: str
    ) -> List[Dict[str, Any]]:
        """
        Get attachments for a specific message
        
        Args:
            db: Database client
            message_id: ID of the message to get attachments for
            
        Returns:
            List of attachment records
        """
        try:
            # Validate message exists
            message_result = await db.table("referrals_messages").select("referrals_messages_id").eq("referrals_messages_id", message_id).execute()
            
            if not message_result.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Message with ID {message_id} not found"
                )
            
            # Get attachments from documents table
            attachments_result = await db.table("documents").select("*").eq("referrals_messages_id", message_id).execute()
            
            attachments = attachments_result.data if attachments_result.data else []
            
            # Generate fresh signed URLs for attachments
            for attachment in attachments:
                if attachment.get("source"):
                    try:
                        # Parse the file path from the signed URL and generate a fresh one
                        source_url = attachment.get("source", "")
                        if source_url and '/object/sign/' in source_url:
                            # Parse the path from Supabase signed URL format
                            url_parts = source_url.split("/object/sign/")
                            if len(url_parts) > 1:
                                path_part = url_parts[1].split("?")[0]  # Remove query parameters
                                bucket_name = "referral-documents"  # Default bucket
                                
                                # Remove bucket name from path if it's included
                                if path_part.startswith(f"{bucket_name}/"):
                                    file_path = path_part[len(f"{bucket_name}/"):]
                                else:
                                    file_path = path_part
                                
                                # Generate fresh signed URL
                                fresh_signed_url = await generate_signed_url(
                                    file_object=file_path,
                                    bucket_name=bucket_name
                                )
                                attachment["signed_url"] = fresh_signed_url
                            else:
                                # Fallback to original source if parsing fails
                                attachment["signed_url"] = source_url
                        else:
                            # If no source URL or invalid format, keep original
                            attachment["signed_url"] = source_url
                    except Exception as e:
                        print(f"Error generating signed URL for attachment: {str(e)}")
                        attachment["signed_url"] = attachment.get("source", "")
            
            return attachments
            
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            print(f"Error fetching message attachments: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch message attachments: {str(e)}"
            )

    @staticmethod
    async def get_messages_by_referral_id(
        db: AsyncClient,
        referral_id: str,
        limit: Optional[int] = 10,
        offset: Optional[int] = 0
    ) -> Dict[str, Any]:
        """
        Get messages for a specific referral with attachments, returning latest messages first
        
        Args:
            db: Database client
            referral_id: ID of the referral to get messages for
            limit: Number of messages to return (default: 10)
            offset: Number of messages to skip for pagination (default: 0)
            
        Returns:
            Dictionary containing messages, total count, and pagination info
        """
        try:
            # Validate referral exists
            referral_result = await db.table("referrals").select("referral_id").eq("referral_id", referral_id).eq("deleted", False).execute()
            
            if not referral_result.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Referral with ID {referral_id} not found"
                )
            
            # Get total count of messages for this referral
            count_result = await db.table("referrals_messages").select("referrals_messages_id", count="exact").eq("referral_id", referral_id).execute()
            total_count = count_result.count if hasattr(count_result, 'count') else 0
            
            # Get messages for the referral with pagination, ordered by latest first
            query = db.table("referrals_messages").select("*").eq("referral_id", referral_id).order("created_at", desc=True)
            
            if limit:
                query = query.limit(limit)
            if offset:
                query = query.range(offset, offset + limit - 1)
            
            messages_result = await query.execute()
            messages = messages_result.data
            
            if not messages:
                return {
                    "messages": [],
                    "total_count": total_count,
                    "limit": limit,
                    "offset": offset,
                    "has_more": False
                }
            
            # Get all message IDs to fetch attachments in batch
            message_ids = [msg["referrals_messages_id"] for msg in messages]
            
            # Fetch all attachments for all messages in a single query
            attachments_result = await db.table("documents").select("*").in_("referrals_messages_id", message_ids).execute()
            
            # Create a lookup map for attachments by message ID
            attachments_by_message = {}
            if attachments_result.data:
                for attachment in attachments_result.data:
                    message_id = attachment.get("referrals_messages_id")
                    if message_id:
                        if message_id not in attachments_by_message:
                            attachments_by_message[message_id] = []
                        attachments_by_message[message_id].append(attachment)
            
            # Generate fresh signed URLs for all attachments in batch
            signed_urls_to_generate = []
            for attachments in attachments_by_message.values():
                for attachment in attachments:
                    if attachment.get("source"):
                        signed_urls_to_generate.append(attachment)
            
            # Generate signed URLs in parallel if possible
            if signed_urls_to_generate:
                # Process signed URLs in batches to avoid overwhelming the system
                batch_size = 10
                for i in range(0, len(signed_urls_to_generate), batch_size):
                    batch = signed_urls_to_generate[i:i + batch_size]
                    for attachment in batch:
                        try:
                            source_url = attachment.get("source", "")
                            if source_url and '/object/sign/' in source_url:
                                url_parts = source_url.split("/object/sign/")
                                if len(url_parts) > 1:
                                    path_part = url_parts[1].split("?")[0]
                                    bucket_name = "referral-documents"
                                    
                                    if path_part.startswith(f"{bucket_name}/"):
                                        file_path = path_part[len(f"{bucket_name}/"):]
                                    else:
                                        file_path = path_part
                                    
                                    fresh_signed_url = await generate_signed_url(
                                        file_object=file_path,
                                        bucket_name=bucket_name
                                    )
                                    attachment["signed_url"] = fresh_signed_url
                                else:
                                    attachment["signed_url"] = source_url
                            else:
                                attachment["signed_url"] = source_url
                        except Exception as e:
                            print(f"Error generating signed URL for attachment: {str(e)}")
                            attachment["signed_url"] = attachment.get("source", "")
            
            # Convert to ReferralMessages objects with attachments
            message_objects = []
            for msg in messages:
                message_id = msg["referrals_messages_id"]
                # Add attachments to the message data
                msg["attachments"] = attachments_by_message.get(message_id, [])
                message_objects.append(ReferralMessages(**msg))
            
            # Calculate if there are more messages
            has_more = (offset + limit) < total_count
            
            return {
                "messages": message_objects,
                "total_count": total_count,
                "limit": limit,
                "offset": offset,
                "has_more": has_more
            }
                
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            print(f"Error fetching messages for referral: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch messages for referral: {str(e)}"
            )

    @staticmethod
    async def add_message_with_user_context(
        db: AsyncClient,
        referral_id: str,
        message: str,
        sender_id: str,
        user_name: Optional[str] = None,
        user_role: Optional[str] = None,
        additional_context: Optional[Dict[str, Any]] = None
    ) -> ReferralMessages:
        """
        Add a message to a referral with comprehensive user context
        
        Args:
            db: Database client
            referral_id: ID of the referral to add message to
            message: The message content
            sender_id: The sender's user ID
            user_name: Optional user name for display
            user_role: Optional user role (e.g., 'facilitator', 'admin', 'patient')
            additional_context: Optional additional context data
            
        Returns:
            ReferralMessages object with the created message
        """
        try:
            # Create sender identifier with user context
            sender_parts = [sender_id]
            if user_name:
                sender_parts.append(user_name)
            if user_role:
                sender_parts.append(f"({user_role})")
            
            sender = " - ".join(sender_parts)
            
            # Prepare user info for logging/audit
            user_info = {
                "sender_id": sender_id,
                "user_name": user_name,
                "user_role": user_role,
                "timestamp": datetime.now().isoformat(),
                "additional_context": additional_context
            }
            
            # Add the message
            return await ReferralMessageService.add_message_to_referral(
                db=db,
                referral_id=referral_id,
                message=message,
                sender=sender,
                sender_id=sender_id,
                user_info=user_info
            )
            
        except Exception as e:
            print(f"Error adding message with user context: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to add message with user context: {str(e)}"
            )

    @staticmethod
    async def add_system_message(
        db: AsyncClient,
        referral_id: str,
        message: str,
        system_action: Optional[str] = None
    ) -> ReferralMessages:
        """
        Add a system-generated message to a referral
        
        Args:
            db: Database client
            referral_id: ID of the referral to add message to
            message: The system message content
            system_action: Optional action that triggered the message
            
        Returns:
            ReferralMessages object with the created message
        """
        try:
            # Create system sender identifier
            sender = "System"
            if system_action:
                sender = f"System ({system_action})"
            
            # Add system context
            system_info = {
                "system_action": system_action,
                "timestamp": datetime.now().isoformat(),
                "type": "system_message"
            }
            
            # Add the message
            return await ReferralMessageService.add_message_to_referral(
                db=db,
                referral_id=referral_id,
                message=message,
                sender=sender,
                sender_id="system", # System user ID
                user_info=system_info
            )
            
        except Exception as e:
            print(f"Error adding system message: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to add system message: {str(e)}"
            )

    @staticmethod
    async def update_message(
        db: AsyncClient,
        message_id: str,
        updated_message: str,
        sender_id: str
    ) -> ReferralMessages:
        """
        Update an existing message
        
        Args:
            db: Database client
            message_id: ID of the message to update
            updated_message: The new message content
            sender_id: ID of the user updating the message
            
        Returns:
            ReferralMessages object with the updated message
        """
        try:
            # Get the existing message
            existing_message = await referral_messages_crud.get(db, id=message_id)
            
            if not existing_message:
                raise HTTPException(
                    status_code=404,
                    detail=f"Message with ID {message_id} not found"
                )
            
            # Create update data
            update_data = ReferralMessagesUpdate(
                message=updated_message,
                sender=f"{existing_message.sender} (edited by {sender_id})",
                referral_id=existing_message.referral_id
            )
            
            # Update the message
            return await referral_messages_crud.update(db, obj_in=update_data)
            
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            print(f"Error updating message: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update message: {str(e)}"
            )

    @staticmethod
    async def get_message_history(
        db: AsyncClient,
        referral_id: str,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get message history for a referral with pagination
        
        Args:
            db: Database client
            referral_id: ID of the referral to get message history for
            limit: Optional limit for number of messages to return
            offset: Optional offset for pagination
            
        Returns:
            Dictionary containing messages and metadata
        """
        try:
            # Validate referral exists
            referral_result = await db.table("referrals").select("referral_id").eq("referral_id", referral_id).eq("deleted", False).execute()
            
            if not referral_result.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Referral with ID {referral_id} not found"
                )
            
            # Build query for messages
            query = db.table("referral_messages").select("*").eq("referral_id", referral_id).order("created_at", desc=True)
            
            # Apply pagination if provided
            if limit:
                query = query.limit(limit)
            if offset:
                query = query.range(offset, offset + (limit or 100) - 1)
            
            # Execute query
            result = await query.execute()
            messages = result.data
            
            # Convert to ReferralMessages objects
            message_objects = [ReferralMessages(**msg) for msg in messages]
            
            # Get total count for pagination metadata
            count_result = await db.table("referral_messages").select("referral_messages_id", count="exact").eq("referral_id", referral_id).execute()
            total_count = count_result.count if hasattr(count_result, 'count') else len(messages)
            
            return {
                "messages": message_objects,
                "total_count": total_count,
                "limit": limit,
                "offset": offset,
                "referral_id": referral_id
            }
            
        except HTTPException:
            # Re-raise HTTPException from CRUD layer
            raise
        except Exception as e:
            print(f"Error fetching message history: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch message history: {str(e)}"
            )

    @staticmethod
    async def create_message(
        db: AsyncClient,
        message_data: ReferralMessagesCreate
    ) -> ReferralMessages:
        """
        Create a new message for a referral using direct database operations
        
        Args:
            db: Database client
            message_data: ReferralMessagesCreate object containing message data
            
        Returns:
            ReferralMessages object with the created message
        """
        try:
            # Validate referral exists
            referral_result = await db.table("referrals").select("referral_id").eq("referral_id", str(message_data.referral_id)).eq("deleted", False).execute()
            
            if not referral_result.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"Referral with ID {message_data.referral_id} not found"
                )
            
            # Prepare message data for database insertion
            message_dict = {
                "message": message_data.message,
                "sender": message_data.sender,
                "sender_id": str(message_data.sender_id),
                "referral_id": str(message_data.referral_id),
                "created_at": datetime.now().isoformat(),
            }
            
            print(f"Message dict: {message_dict}")
            # Insert message into database
            result = await db.table("referrals_messages").insert(message_dict).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to create message"
                )
            
            # Return the created message
            created_message_data = result.data[0]
            return ReferralMessages(**created_message_data)
            
        except HTTPException:
            # Re-raise HTTPException
            raise
        except Exception as e:
            print(f"Error creating message: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create message: {str(e)}"
            )
