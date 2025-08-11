import os

import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

origins = []

dev_origins = [
    "http://localhost:8000",
    "https://my.referio.ai",
    "https://staging.referio.ai",
    "https://dev.staging.referio.ai",
    "http://localhost:3000",
]

prod_origins = [
    "https://my.referio.ai",
    "https://staging.referio.ai",
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
    f"https://app.infisical.com/api/v3/secrets/raw?workspaceId=e184ee5b-a2d1-498e-954f-e52ca65e7bce&environment={ENV}",
    headers={"Authorization": "Bearer " + access_token},
)

jsondata = env_success.json()["secrets"]

SUPABASE_URL_GLOBAL = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_URL_GLOBAL"
)["secretValue"]

SUPABASE_KEY_GLOBAL = next(
    x for x in jsondata if x["secretKey"] == "SUPABASE_KEY_GLOBAL"
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

REDUCTO_WEBHOOK_URL = next(x for x in jsondata if x["secretKey"] == "REDUCTO_WEBHOOK_URL")[
    "secretValue"
]

REDUCTO_WEBHOOK_SECRET = next(x for x in jsondata if x["secretKey"] == "REDUCTO_WEBHOOK_SECRET")[
    "secretValue"
]

API_URL = next(x for x in jsondata if x["secretKey"] == "API_URL")[
    "secretValue"
]



