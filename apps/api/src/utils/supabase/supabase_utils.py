
from typing import Optional
import aiohttp
from fastapi import HTTPException, UploadFile
from src.config.supabase_config import get_supabase_client
from src.schemas.fileresult import FileResult

    
async def upload_file(
    id: str,
    file: UploadFile,
    bucket_name: str,
    file_name: str,
    base_path: str,
    type: Optional[str] = None,
) :
    try:
        # Read file content directly from UploadFile
        content = await file.read()

        file_extension = (
            file.content_type.split("/")[-1] if file.content_type else "bin"
        )
        file_name_with_extension = f"{file_name}.{file_extension}"
        file_path = ""
        
        if(type is None):
            file_path = f"{base_path}/{id}/{file_name_with_extension}"
        else:
            file_path = f"{base_path}/{id}/{type}/{file_name_with_extension}"

        # Upload directly to Supabase storage
        supabase_client = await get_supabase_client()
        upload_response = await supabase_client.storage.from_(bucket_name).upload(
            path=file_path,
            file=content,
            file_options={
                "content-type": file.content_type or "application/octet-stream"
            },
        )

        if not upload_response:
            raise Exception("Upload failed - no response from Supabase")

        # Generate signed URL for the uploaded file
        signed_url = await generate_signed_url(
            file_object=file_path,
            bucket_name=bucket_name,
        )

        return FileResult(
            bucket_name=bucket_name,
            signed_url=signed_url,
            filename=file_name_with_extension,
        )

    except Exception as exc:
        raise Exception(f"Failed to upload file: {exc}")
    

async def get_files(
    id: str,
    bucket_name: str,
    base_path: str,
    type: Optional[str] = None,
) :
    try:
        # Read file content directly from UploadFil
        file_path = ""
        
        if(type is None):
            file_path = f"{base_path}/{id}/"
        else:
            file_path = f"{base_path}/{id}/{type}/"

        # Upload directly to Supabase storage
        supabase_client = await get_supabase_client()
        list_response = await supabase_client.storage.from_(bucket_name).list(file_path, {"limit": 1000})
         
        if not list_response:
            raise Exception("Upload failed - no response from Supabase")

        return list_response

    except Exception as exc:
        raise Exception(f"Failed to upload file: {exc}")
    

async def generate_signed_url(
     file_object: str, bucket_name: str
) -> str:
    """Generates a signed URL for accessing a file in Supabase storage.

    This function is NOT async because the Supabase client's create_signed_url
    method is synchronous and returns a dictionary directly.

    Args:
        supabase_project (Any): The Supabase project instance.
        file_object (str): The file path within the bucket.
        bucket_name (str): The name of the Supabase storage bucket.

    Returns:
        str: The signed URL for accessing the file.

    Raises:
        Exception: If the signed URL generation fails.
    """
    try:
        # Call the method directly without await
        supbase_client = get_supabase_client()
        response = await supbase_client.storage.from_(bucket_name).create_signed_url(
            f"{file_object}", expires_in=86400
        )
        if not response:
            raise HTTPException(
                status_code=500,
                detail="Failed to get signed URL from Supabase storage",
            )
        return response["signedURL"]
    except Exception as e:
        # Provide more detailed error information
        raise Exception(f"Failed to generate signed URL: {str(e)}")