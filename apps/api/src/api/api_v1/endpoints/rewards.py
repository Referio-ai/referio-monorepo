from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException
from src.schemas import (
    Reward, 
    RewardCreate,
    RewardUpdate,
    RewardSearchResults,
)
from src.config.supabase_config import get_supabase_client
from src.crud.rewards import rewards_crud

router = APIRouter()


@router.get("/", status_code=200)
async def get_rewards() -> List[Reward]:
    """Get all rewards"""
    db = await get_supabase_client()
    return await rewards_crud.get_all(db=db)


@router.get("/{reward_id}", status_code=200)
async def get_reward(reward_id: str) -> Reward:
    """Get a specific reward by ID"""
    db = await get_supabase_client()
    reward = await rewards_crud.get(db=db, id=reward_id)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    return reward


@router.post("/", status_code=201)
async def create_reward(reward: RewardCreate) -> Reward:
    """Create a new reward"""
    db = await get_supabase_client()
    return await rewards_crud.create(db=db, obj_in=reward)


@router.put("/{reward_id}", status_code=200)
async def update_reward(reward_id: str, reward: RewardUpdate) -> Reward:
    """Update a reward"""
    db = await get_supabase_client()
    reward.id = reward_id
    return await rewards_crud.update(db=db, obj_in=reward)


@router.delete("/{reward_id}", status_code=200)
async def delete_reward(reward_id: str) -> Reward:
    """Delete a reward"""
    db = await get_supabase_client()
    return await rewards_crud.delete(db=db, id=reward_id)


@router.get("/batch/{batch_id}", status_code=200)
async def get_rewards_by_batch(batch_id: UUID) -> List[Reward]:
    """Get all rewards for a specific batch"""
    db = await get_supabase_client()
    return await rewards_crud.get_by_batch_id(db=db, batch_id=batch_id) 