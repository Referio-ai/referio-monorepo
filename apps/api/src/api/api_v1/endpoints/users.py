from typing import Literal, Optional, Union

from fastapi import APIRouter
from src.schemas import User

router = APIRouter()

# Example endpoint
@router.get("/", status_code=200, response_model=User)
async def get_user() -> User:
    return ''

