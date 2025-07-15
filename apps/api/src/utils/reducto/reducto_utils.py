import json
from typing import Dict
import aiohttp
from pathlib import Path
from src.config.infisical import REDUCTO_API_KEY
from src.prompts.reducto_prompts import REDUCTO_PROMPT


async def reducto_referral_extraction(document_url: str) -> Dict:
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
                return await response.json()

    except Exception as e:
        print(f"Reducto extraction error: {e}")
        raise Exception(f"Reducto extraction error: {e}")