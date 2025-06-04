from supabase._async.client import AsyncClient as AsyncClient, create_client as create_client_async

from propelauth_fastapi import init_auth
from src.config.infisical import SUPABASE_URL_GLOBAL, SUPABASE_KEY_GLOBAL, PROPEL_AUTH_URL, PROPEL_API_KEY



supabase_client = None


client_cache = {}

async def initialize_clients():
    """Initialize all Supabase clients"""
    print("Initializing Supabase clients")
    global supabase_client
    supabase_client = await create_client_async(SUPABASE_URL_GLOBAL, SUPABASE_KEY_GLOBAL)



async def get_supabase_client():
    """Get the initialized global Supabase client"""
    if supabase_client is None:
        raise RuntimeError("Supabase global client is not initialized. Make sure the app has started properly.")
    return supabase_client


    


# propel auth
auth = init_auth(PROPEL_AUTH_URL, PROPEL_API_KEY)


# Database names
## PROCESS DATABASE
STAGING_REDUCTO_WORKER_STATUS = "reducto_worker_status"


## GLOBAL DATABASE
# GLOBAL DATABASE
ADA_CODES = "ada_codes"


## RPC

