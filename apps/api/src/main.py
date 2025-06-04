from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from src.api.api_v1.api import api_router
from src.config.supabase_config import auth
from fastapi import FastAPI, Depends

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


def get_application():
    _app = FastAPI(
        title='REFERIO API',
        generate_unique_id_function=custom_generate_unique_id,
        root_path_in_servers=True,
    )

    _app.include_router(api_router, prefix="/api/v1", tags=["API v1"], responses={404: {"description": "V1 Apis"}}, dependencies=[Depends(auth.require_user)])
    _app.include_router(info_router, tags=[""])

    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return _app


app = get_application()
