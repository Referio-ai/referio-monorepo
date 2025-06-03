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
TEMP_PASS = "Temp Pass"
CLOUD_CRUISE_DETAILS = "cloud_cruise_details"
CSU_CLOUD_CRUISE_DETAILS = "csu_cloud_cruise_details"
CSU_DATA_INGRESS = "csu_data_ingress"
DATA_INGRESS = "data_ingress"
INSURANCE_COMPANY = "insurance_company"

## GLOBAL DATABASE
# GLOBAL DATABASE
ADA_CODES = "ada_codes"
ORGANIZATIONS = "organizations"
FACILITY_ENTITY = "facility_entity"
INSURANCE_COMPANY = "insurance_company"
INSURANCE_PLANS = "insurance_plans"
INSRUANCE_PLANS_BREAKDOWN = "insurance_plans_breakdown"
IV_KANBAN = "iv_kanban"
APPOINTMENTS = "appointments"
PATIENT = "patient"
PATIENT_INSURANCE_PLANS = "patient_insurance_plans"
PATIENT_INSURANCE_PLANS_BREAKDOWN = "patient_insurance_plans_breakdown"
PRESET_DEFINITIONS= "preset_definitions"
PRESET_PROCEDURE_CODES = "preset_procedure_codes"
PROVIDER_ENTITY = "provider_entity"
USER_NOTIFICATIONS = "user_notifications"
MASTER_INSURANCE_PLANS = "master_insurance_plans"
MASTER_INSURANCE_PLANS_BREAKDOWN = "master_insurance_plans_breakdown"
BUFFER_INSURANCE_PLANS = "buffer_insurance_plans"
BUFFER_INSURANCE_PLANS_BREAKDOWN = "buffer_insurance_plans_breakdown"
CHANGE_HISTORY_INSURANCE_PLANS = "change_history_insurance_plans"
CHANGE_COMMENTS = "change_comments"
EXTRACTION_QUEUE = "extraction_queue"
EVIDENCE = "evidence"
PROVIDER_ENTITY = "provider_entity"
FACILITY_PROVIDERS_ENTITY = "facility_providers_entity"
CLAIMS = "claims"
CLAIM_NOTES = "claim_notes"
CLAIM_TASKS= "claim_tasks"
CLAIM_PROCEDURE_CODES = "claim_procedure_codes"
CLAIM_PROCEDURE_CODE_NOTES = "claim_procedure_code_notes"

## RPC
GET_ALL_MASTER_INSURANCE_WITH_BREAKDOWN = "get_all_master_insurance_with_breakdown"
GET_MASTER_INSURANCE_WITH_BREAKDOWN = "get_master_insurance_with_breakdown"
