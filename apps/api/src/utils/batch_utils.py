import random
import string
from supabase import AsyncClient
from src.crud.referrals_batch import referrals_batch_crud

def generate_random_prefix(length: int = 5) -> str:
    """
    Generate a random alphanumeric string of specified length using uppercase letters,
    lowercase letters, and numbers
    
    Args:
        length: Length of the random string to generate
        
    Returns:
        Random alphanumeric string of specified length
    """
    characters = string.ascii_uppercase + string.ascii_lowercase + string.digits
    return ''.join(random.choices(characters, k=length))

async def get_unique_batch_prefix(db: AsyncClient) -> str:
    """
    Generate a unique batch prefix that doesn't exist in the database
    
    Args:
        db: Database client
        
    Returns:
        Unique batch prefix
    """
    while True:
        prefix = generate_random_prefix()
        # Check if prefix exists in any batch
        # existing_batches = await referrals_batch_crud.get_all(db)
        # if not any(batch.id.startswith(prefix) for batch in existing_batches):
        return prefix