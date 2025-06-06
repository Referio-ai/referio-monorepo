from fastapi import APIRouter
from src.api.api_v1.endpoints import organizations

api_router = APIRouter()
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"], responses={404: {"description": "Organization Endpoints"}})