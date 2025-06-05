from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from src.api.api_v1.api import api_router
from src.config.supabase_config import auth
from fastapi import FastAPI, Depends
from src.config.supabase_config import initialize_clients
from contextlib import asynccontextmanager
import asyncio

info_router = APIRouter()


@info_router.get("/", status_code=200, include_in_schema=False)
async def info():
    return [{"Status": "Referio API is running"}]


def custom_generate_unique_id(route: APIRoute):
    """Generates a custom ID when using the TypeScript Generator Client

    Args:
        route (APIRoute): The route to be customised

    Returns:
        str: tag-route_name, e.g. items-CreateItem
    """
    return f"{route.tags[0]}-{route.name}"


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await initialize_clients()
        yield
    finally:
        # Ensure that the clients are closed properly
        try:
            # Give a moment for any remaining background tasks to complete
            await asyncio.sleep(0.5)
            print("Initiating application....")
        except Exception as e:
            print(f"Error during appliaction: {e}")
        finally:
            print("Application shutdown complete.")

app = FastAPI(
        lifespan=lifespan,
        title='REFERIO API',
        generate_unique_id_function=custom_generate_unique_id,
    )

app.include_router(api_router, prefix="/api/v1", tags=["API v1"], responses={404: {"description": "V1 Apis"}})
app.include_router(info_router, tags=[""])

app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


