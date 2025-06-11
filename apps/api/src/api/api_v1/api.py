from fastapi import APIRouter
from src.api.api_v1.endpoints import organizations, referrals, batches, patients, rewards, facilities

api_router = APIRouter()
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"], responses={404: {"description": "Organization Endpoints"}})
api_router.include_router(referrals.router, prefix="/referrals", tags=["referrals"], responses={404: {"description": "Referral Endpoints"}})
api_router.include_router(batches.router, prefix="/batches", tags=["batches"], responses={404: {"description": "Batch Endpoints"}})
api_router.include_router(patients.router, prefix="/patients", tags=["patients"], responses={404: {"description": "Patient Endpoints"}})
api_router.include_router(rewards.router, prefix="/rewards", tags=["rewards"], responses={404: {"description": "Rewards Endpoints"}})
api_router.include_router(facilities.router, prefix="/facilities", tags=["facilities"], responses={404: {"description": "Facilities Endpoints"}})