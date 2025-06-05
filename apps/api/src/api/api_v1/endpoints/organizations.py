from typing import List, Literal, Optional, Union

from fastapi import APIRouter
from src.schemas import Organization

from src.config.supabase_config import get_supabase_client

from src.crud.organizations import organizations_crud

router = APIRouter()

# Example endpoint
@router.get("/", status_code=200)
async def get_organizations() -> List[Organization]:
    db = await get_supabase_client()
    result =  await organizations_crud.get_all(db=db)
    return result


 