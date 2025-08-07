import json
from typing import Dict, Optional
import aiohttp
import asyncio
from pathlib import Path
from src.config.infisical import REDUCTO_API_KEY, API_URL
from src.prompts.reducto_prompts import REDUCTO_PROMPT


async def reducto_referral_extraction(document_url: str, referral_id: str = None) -> Dict:
    """Extract information from a document using Reducto API."""
    url = "https://platform.reducto.ai/extract"
    try:
        # Load schema
        schema_path = Path(__file__).resolve().parent  / "schemas" / "orthodontic_referral_schema.json"
        with open(schema_path) as f:
            reducto_extract_schema_payload = json.load(f)

        payload = {
            "document_url": document_url,
            "schema": reducto_extract_schema_payload,
            "system_prompt": REDUCTO_PROMPT,
            "generate_citations": True,
            "array_extract": True,
            "array_extract_mode": "streaming",
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {REDUCTO_API_KEY}",
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers, verify_ssl=False) as response:
                if response.status == 404:
                    print(f"Response for request: {url} is HTTP_404")
                    return None
                response.raise_for_status()
                result = await response.json()
                
                # Log referral_id if provided (for tracking purposes)
                if referral_id:
                    print(f"Reducto extraction completed for referral {referral_id}")
                
                return result

    except Exception as e:
        print(f"Reducto extraction error: {e}")
        raise Exception(f"Reducto extraction error: {e}")


async def reducto_referral_extraction_async(document_url: str, referral_id: str = None, max_wait_time: int = 300) -> Dict:
    """
    Extract information from a document using Reducto API async endpoint.
    
    Args:
        document_url: URL of the document to extract from
        referral_id: ID of the referral to associate with the job (optional)
        max_wait_time: Maximum time to wait for job completion in seconds (default: 300)
    
    Returns:
        Dict containing the extracted information
    """
    url = "https://platform.reducto.ai/extract_async"
    try:
        # Load schema
        schema_path = Path(__file__).resolve().parent / "schemas" / "orthodontic_referral_schema.json"
        with open(schema_path) as f:
            reducto_extract_schema_payload = json.load(f)

        payload = {
            "document_url": document_url,
            "schema": reducto_extract_schema_payload,
            "system_prompt": REDUCTO_PROMPT,
            "generate_citations": True,
            "array_extract": {
                 "mode": "streaming",
            },
            "webhook":{
                "mode": "direct",
                "url": f"https://7baa796969df.ngrok-free.app/api/v1/referrals/webhook/reducto",
                "channels": ['referio_referal']
            }
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {REDUCTO_API_KEY}",
        }

        async with aiohttp.ClientSession() as session:
            # Submit the async extraction job
            async with session.post(url, json=payload, headers=headers, verify_ssl=False) as response:
                if response.status == 404:
                    print(f"Response for request: {url} is HTTP_404")
                    return None
                response.raise_for_status()
                job_response = await response.json()
                
                if "job_id" not in job_response:
                    raise Exception("No job_id returned from Reducto API")
                
                job_id = job_response["job_id"]
                job_status = 'processing'
                print(f"Reducto async job submitted with ID: {job_id}")
                
                # Save job_id to referral if referral_id is provided
                if referral_id:
                    try:
                        from src.config.supabase_config import get_supabase_client
                        db = await get_supabase_client()
                        
                        # Update the referral with the job_id
                        update_result = await db.table("referrals").update({
                            "job_id": job_id,
                            "job_status": job_status
                        }).eq("referral_id", referral_id).execute()
                        
                        if update_result.data:
                            print(f"Successfully saved job_id {job_id} to referral {referral_id}")
                        else:
                            print(f"Warning: No referral found with ID {referral_id} to update with job_id")
                            
                    except Exception as db_error:
                        print(f"Warning: Failed to save job_id to referral: {db_error}")
                        # Continue with the extraction even if saving job_id fails
                
                # Poll for job completion
                return job_id

    except Exception as e:
        print(f"Reducto async extraction error: {e}")
        raise Exception(f"Reducto async extraction error: {e}")


async def reducto_referral_extraction_async_with_webhook(
    document_url: str, 
    webhook_url: str,
    referral_id: str = None,
    webhook_secret: Optional[str] = None
) -> Dict:
    """
    Extract information from a document using Reducto API async endpoint with webhook.
    
    Args:
        document_url: URL of the document to extract from
        webhook_url: URL where Reducto will send the completion notification
        referral_id: ID of the referral to associate with the job (optional)
        webhook_secret: Optional secret for webhook authentication
    
    Returns:
        Dict containing the job information
    """
    url = "https://platform.reducto.ai/extract_async"
    try:
        # Load schema
        schema_path = Path(__file__).resolve().parent / "schemas" / "orthodontic_referral_schema.json"
        with open(schema_path) as f:
            reducto_extract_schema_payload = json.load(f)

        payload = {
            "document_url": document_url,
            "schema": reducto_extract_schema_payload,
            "system_prompt": REDUCTO_PROMPT,
            "generate_citations": True,
            "array_extract": True,
            "array_extract_mode": "streaming",
            "webhook_url": webhook_url,
        }
        
        # Add webhook secret if provided
        if webhook_secret:
            payload["webhook_secret"] = webhook_secret
            
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {REDUCTO_API_KEY}",
        }

        async with aiohttp.ClientSession() as session:
            # Submit the async extraction job with webhook
            async with session.post(url, json=payload, headers=headers, verify_ssl=False) as response:
                if response.status == 404:
                    print(f"Response for request: {url} is HTTP_404")
                    return None
                response.raise_for_status()
                job_response = await response.json()
                
                if "job_id" not in job_response:
                    raise Exception("No job_id returned from Reducto API")
                
                job_id = job_response["job_id"]
                print(f"Reducto async job with webhook submitted with ID: {job_id}")
                
                # Save job_id to referral if referral_id is provided
                if referral_id:
                    try:
                        from src.config.supabase_config import get_supabase_client
                        db = await get_supabase_client()
                        
                        # Update the referral with the job_id
                        update_result = await db.table("referrals").update({
                            "job_id": job_id
                        }).eq("referral_id", referral_id).execute()
                        
                        if update_result.data:
                            print(f"Successfully saved job_id {job_id} to referral {referral_id}")
                        else:
                            print(f"Warning: No referral found with ID {referral_id} to update with job_id")
                            
                    except Exception as db_error:
                        print(f"Warning: Failed to save job_id to referral: {db_error}")
                        # Continue with the extraction even if saving job_id fails
                
                return {
                    "job_id": job_id,
                    "status": "submitted",
                    "webhook_url": webhook_url,
                    "message": "Job submitted successfully. Results will be sent to webhook URL."
                }

    except Exception as e:
        print(f"Reducto async extraction with webhook error: {e}")
        raise Exception(f"Reducto async extraction with webhook error: {e}")


async def configure_reducto_webhook(webhook_url: str, webhook_secret: Optional[str] = None) -> Dict:
    """
    Configure webhook settings for Reducto API.
    
    Args:
        webhook_url: URL where Reducto will send notifications
        webhook_secret: Optional secret for webhook authentication
    
    Returns:
        Dict containing the webhook configuration result
    """
    url = "https://platform.reducto.ai/configure_webhook"
    try:
        payload = {
            "webhook_url": webhook_url,
        }
        
        if webhook_secret:
            payload["webhook_secret"] = webhook_secret
            
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {REDUCTO_API_KEY}",
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers, verify_ssl=False) as response:
                response.raise_for_status()
                result = await response.json()
                print(f"Webhook configured successfully: {webhook_url}")
                return result

    except Exception as e:
        print(f"Error configuring webhook: {e}")
        raise Exception(f"Webhook configuration error: {e}")


async def _poll_job_status(session: aiohttp.ClientSession, job_id: str, max_wait_time: int) -> Dict:
    """
    Poll the job status until completion or timeout.
    
    Args:
        session: aiohttp session
        job_id: The job ID to poll
        max_wait_time: Maximum time to wait in seconds
    
    Returns:
        Dict containing the job results
    """
    status_url = f"https://platform.reducto.ai/job/{job_id}"
    headers = {
        "Authorization": f"Bearer {REDUCTO_API_KEY}",
    }
    
    start_time = asyncio.get_event_loop().time()
    
    while True:
        try:
            async with session.get(status_url, headers=headers, verify_ssl=False) as response:
                response.raise_for_status()
                job_status = await response.json()
                
                status = job_status.get("status")
                print(f"Job {job_id} status: {status}")
                
                if status == "completed":
                    return job_status.get("result", {})
                elif status == "failed":
                    error_msg = job_status.get("error", "Unknown error")
                    raise Exception(f"Reducto job failed: {error_msg}")
                elif status == "cancelled":
                    raise Exception("Reducto job was cancelled")
                
                # Check if we've exceeded max wait time
                elapsed_time = asyncio.get_event_loop().time() - start_time
                if elapsed_time > max_wait_time:
                    raise Exception(f"Reducto job timed out after {max_wait_time} seconds")
                
                # Wait before polling again (exponential backoff)
                await asyncio.sleep(min(2, elapsed_time / 10))
                
        except Exception as e:
            print(f"Error polling job status: {e}")
            raise


async def cancel_reducto_job(job_id: str) -> bool:
    """
    Cancel a running Reducto job.
    
    Args:
        job_id: The job ID to cancel
    
    Returns:
        bool: True if job was cancelled successfully
    """
    url = f"https://platform.reducto.ai/cancel/{job_id}"
    headers = {
        "Authorization": f"Bearer {REDUCTO_API_KEY}",
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, verify_ssl=False) as response:
                response.raise_for_status()
                result = await response.json()
                print(f"Job {job_id} cancelled successfully")
                return True
    except Exception as e:
        print(f"Error cancelling job {job_id}: {e}")
        return False


def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
    """
    Verify webhook signature for security.
    
    Args:
        payload: The webhook payload as string
        signature: The signature header from Reducto
        secret: The webhook secret
    
    Returns:
        bool: True if signature is valid
    """
    import hmac
    import hashlib
    
    try:
        # Create expected signature
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(f"sha256={expected_signature}", signature)
    except Exception as e:
        print(f"Error verifying webhook signature: {e}")
        return False
    

async def get_reducto_job_status(job_id: str) -> Dict:

    try:
        url = f"https://platform.reducto.ai/job/{job_id}"
        headers = {
            "Authorization": f"Bearer ee8312e40b736d594c6072e76891a613ba1bdd083abb4875065bc6083b3e1149ee8ff345265b8c534aade5c0661c2ed5",
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, verify_ssl=False) as response:
                job_status = await response.json()
                return job_status
            
    except Exception as e:
        print(f"Error getting Reducto job status: {e}")
        raise Exception(f"Error getting Reducto job status: {e}")
    
        