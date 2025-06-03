import os

import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

origins = []

dev_origins = [
    "http://localhost:8000",
    "https://my.kaylie.ai",
    "https://staging.kaylie.ai",
    "https://dev.staging.kaylie.ai",
    "http://localhost:3000",
]

prod_origins = [
    "https://my.kaylie.ai",
    "https://staging.kaylie.ai",
]

payload = {
    "clientSecret": "edb645e58dd07f8b587411a6671f8661f1195706346518f0072c60e47b602988",
    "clientId": "5f7cd5ef-d9e5-4080-8e57-fc06afdc0fc6",
}

headers = {
    "content-type": "application/x-www-form-urlencoded",
}
auth_success = requests.post(
    "https://app.infisical.com/api/v1/auth/universal-auth/login",
    payload,
    headers,
)
content = auth_success.json()
access_token = content["accessToken"]

ENV = "dev"

# get all environments
if os.getenv("ENVIRONMENT") == "DEV":
    ENV = "dev"
    origins = dev_origins

if os.getenv("ENVIRONMENT") == "STAGING":
    ENV = "staging"
    origins = dev_origins

if os.getenv("ENVIRONMENT") == "PRODUCTION":
    ENV = "prod"
    origins = prod_origins

env_success = requests.get(
    f"https://app.infisical.com/api/v3/secrets/raw?workspaceId=3a379869-25c8-46f0-8895-4b5625a166bb&environment={ENV}",
    headers={"Authorization": "Bearer " + access_token},
)
vault_environments = requests.get(
    "https://app.infisical.com/api/v3/secrets/raw?workspaceId=3a379869-25c8-46f0-8895-4b5625a166bb&environment=dev",
    headers={"Authorization": "Bearer " + access_token},
)
vault_jsondata = vault_environments.json()["secrets"]
VAULT_SUPABASE_URL_GLOBAL = next(
    x for x in vault_jsondata if x["secretKey"] == "SUPABASE_URL_GLOBAL"
)["secretValue"]

VAULT_SUPABASE_KEY_GLOBAL = next(
    x for x in vault_jsondata if x["secretKey"] == "SUPABASE_KEY_GLOBAL"
)["secretValue"]

VAULT_JWT_AUTH_TOKEN = next(
    x for x in vault_jsondata if x["secretKey"] == "SUPABASE_AUTH_JWT"
)["secretValue"]

jsondata = env_success.json()["secrets"]

SUPABASE_URL_PROCESS = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_URL_PROCESS"
)["secretValue"]
SUPABASE_KEY_PROCESS = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_KEY_PROCESS"
)["secretValue"]

SUPABASE_URL_GLOBAL = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_URL_GLOBAL"
)["secretValue"]
SUPABASE_KEY_GLOBAL = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_KEY_GLOBAL"
)["secretValue"]
SUPABASE_BUCKET_NAME_EOB = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_BUCKET_NAME_EOB"
)["secretValue"]

SUPABASE_BUCKET_NAME_SCREENSHOTS = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_BUCKET_NAME_SCREENSHOTS"
)["secretValue"]

SUPABASE_BUCKET_NAME_LLM_UPLOADS = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_BUCKET_NAME_LLM_UPLOADS"
)["secretValue"]


PROPEL_AUTH_URL = next(x for x in jsondata if x["secretKey"] == "PROPEL_AUTH_URL")[
    "secretValue"
]

PROPEL_API_KEY = next(x for x in jsondata if x["secretKey"] == "PROPEL_API_KEY")[
    "secretValue"
]
REDUCTO_API_KEY = next(x for x in jsondata if x["secretKey"] == "REDUCTO_API_KEY")[
    "secretValue"
]

OP_VAULT_ID = next(x for x in jsondata if x["secretKey"] == "OP_VAULT_ID")[
    "secretValue"
]
OP_TOKEN = next(x for x in jsondata if x["secretKey"] == "OP_TOKEN")["secretValue"]
OP_CONNECT_SERVER_URL = next(
    x for x in jsondata if x["secretKey"] == "OP_CONNECT_SERVER_URL"
)["secretValue"]

OP_ENCRYPTION_KEY = next(x for x in jsondata if x["secretKey"] == "OP_ENCRYPTION_KEY")[
    "secretValue"
]
OPEN_API_KEY = next(x for x in jsondata if x["secretKey"] == "OPEN_API_KEY")[
    "secretValue"
]
CLOUDCRUISE_API_KEY = next(
    x for x in jsondata if x["secretKey"] == "CLOUDCRUISE_API_KEY"
)["secretValue"]
CLOUDCRUISE_ENCRYPTION_KEY = next(
    x for x in jsondata if x["secretKey"] == "CLOUDCRUISE_ENCRYPTION_KEY"
)["secretValue"]

BETTER_STACK_TOKEN = next(
    x for x in jsondata if x["secretKey"] == "BETTER_STACK_TOKEN"
)["secretValue"]

BETTER_STACK_HOST = next(x for x in jsondata if x["secretKey"] == "BETTER_STACK_HOST")[
    "secretValue"
]

HATCHET_CLIENT_TOKEN = next(
    x for x in jsondata if x["secretKey"] == "HATCHET_CLIENT_TOKEN"
)["secretValue"]

KOLLA_API_URL = next(x for x in jsondata if x["secretKey"] == "KOLLA_API_URL")[
    "secretValue"
]

KOLLA_API_KEY = next(x for x in jsondata if x["secretKey"] == "KOLLA_API_KEY")[
    "secretValue"
]

SLACK_URL = next(x for x in jsondata if x["secretKey"] == "SLACK_URL")["secretValue"]

SLACK_BOT_TOKEN = next(x for x in jsondata if x["secretKey"] == "SLACK_BOT_TOKEN")[
    "secretValue"
]

MANAGEMENT_TOOLS_AUTH = next(
    x for x in jsondata if x["secretKey"] == "MANAGEMENT_TOOLS_AUTH"
)["secretValue"]

MANAGEMENT_TOOLS_AUTH_ID = next(
    x for x in jsondata if x["secretKey"] == "MANAGEMENT_TOOLS_AUTH_ID"
)["secretValue"]
DENTAL_XCHANGE_KEY = next(
    x for x in jsondata if x["secretKey"] == "DENTAL_XCHANGE_KEY"
)["secretValue"]

DENTAL_XCHANGE_USERNAME = next(
    x for x in jsondata if x["secretKey"] == "DENTAL_XCHANGE_USERNAME"
)["secretValue"]

DENTAL_XCHANGE_PASSWORD = next(
    x for x in jsondata if x["secretKey"] == "DENTAL_XCHANGE_PASSWORD"
)["secretValue"]

SUPABASE_GLOBAL_FACILITY_URL_DEV = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_GLOBAL_FACILITY_URL_DEV"
)["secretValue"]

SUPABASE_GLOBAL_FACILITY_URL_STAGING = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_GLOBAL_FACILITY_URL_STAGING"
)["secretValue"]

SUPABASE_GLOBAL_FACILITY_URL_PROD = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_GLOBAL_FACILITY_URL_PROD"
)["secretValue"]


SUPABASE_GLOBAL_FACILITY_KEY_DEV = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_GLOBAL_FACILITY_KEY_DEV"
)["secretValue"]

SUPABASE_GLOBAL_FACILITY_KEY_STAGING = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_GLOBAL_FACILITY_KEY_STAGING"
)["secretValue"]

SUPABASE_GLOBAL_FACILITY_KEY_PROD = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_GLOBAL_FACILITY_KEY_PROD"
)["secretValue"]

VYNE_CUSTOMER_CLIENT_ID = next(
    x for x in jsondata if x["secretKey"] == "VYNE_CUSTOMER_CLIENT_ID"
)["secretValue"]

VYNE_CUSTOMER_CLIENT_SECRET = next(
    x for x in jsondata if x["secretKey"] == "VYNE_CUSTOMER_CLIENT_SECRET"
)["secretValue"]

NEXT_PUBLIC_POSTHOG_HOST = next(
    x for x in jsondata if x["secretKey"] == "NEXT_PUBLIC_POSTHOG_HOST"
)["secretValue"]

NEXT_PUBLIC_POSTHOG_KEY = next(
    x for x in jsondata if x["secretKey"] == "NEXT_PUBLIC_POSTHOG_KEY"
)["secretValue"]
