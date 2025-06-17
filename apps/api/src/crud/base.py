from typing import Generic, Optional, TypeVar, Tuple

from supabase import AsyncClient

from src.schemas.base import CreateBase, ResponseBase, UpdateBase

ModelType = TypeVar("ModelType", bound=ResponseBase)
CreateSchemaType = TypeVar("CreateSchemaType", bound=CreateBase)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=UpdateBase)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: type[ModelType]):
        """CRUD object with default methods to do CRUD ops

        Args:
            model (type[ModelType]): Model class type
        """
        self.model = model

    async def get(self, table_name: str, db: AsyncClient, *, id: str) -> Optional[ModelType]:
        """get by table_name by id"""
        data, count = (
            await db.table(table_name).select("*").eq("id", id).execute()
        )
        _, got = data
        return self.model(**got[0]) if got else None

    async def get_all(self, table_name: str, db: AsyncClient) -> list[ModelType]:
        """get all by table_name"""
        data, count = await db.table(table_name).select("*").execute()
        _, got = data
        return [self.model(**item) for item in got]

    async def search_all(
        self, table_name: str, db: AsyncClient, *, field: str, search_value: str, max_results: int
    ) -> list[ModelType]:
        """search all by table_name"""
        data, count = (
            await db.table(table_name)
            .select("*")
            .ilike(field, f"%{search_value}%")
            .limit(max_results)
            .execute()
        )
        _, got = data
        return [self.model(**item) for item in got]

    async def create(self, table_name: str, db: AsyncClient, *, obj_in: CreateSchemaType) -> ModelType:
        """create by CreateSchemaType"""
        data, count = (
            await db.table(table_name).insert(obj_in.model_dump()).execute()
        )
        _, created = data
        return self.model(**created[0])

    async def update(self, table_name: str, db: AsyncClient, *, obj_in: UpdateSchemaType) -> ModelType:
        """update by UpdateSchemaType"""
        data, count = (
            await db.table(table_name)
            .update(obj_in.model_dump())
            .eq("id", obj_in.id)
            .execute()
        )
        _, updated = data
        return self.model(**updated[0])
    
    async def update_status(self, table_name: str, db: AsyncClient, *, obj_in: UpdateSchemaType) -> ModelType:
        """update by UpdateSchemaType"""
        data, count = (
            await db.table(table_name)
            .update({"referral_status": obj_in.referral_status})
            .eq("id", obj_in.id)
            .execute()
        )
        _, updated = data
        return self.model(**updated[0])

    async def delete(self, table_name: str, db: AsyncClient, *, id: str) -> ModelType:
        """remove by UpdateSchemaType"""
        data, count = (
            await db.table(table_name).delete().eq("id", id).execute()
        )
        _, deleted = data
        return self.model(**deleted[0])

    async def get_all_paginated(
        self, 
        table_name: str, 
        db: AsyncClient, 
        *, 
        page: int = 1, 
        page_size: int = 10,
        search: str = ""
    ) -> Tuple[list[ModelType], dict]:
        """Get paginated results from table_name
        
        Args:
            table_name (str): Name of the table to query
            db (AsyncClient): Database client
            page (int, optional): Page number starting from 1. Defaults to 1.
            page_size (int, optional): Number of items per page. Defaults to 10.
            
        Returns:
            Tuple[list[ModelType], dict]: Tuple containing:
                - List of paginated items
                - Dictionary with pagination metadata (total_count, total_pages, current_page, page_size)
        """
        # Calculate offset
        offset = (page - 1) * page_size
        
        # Get total count
        count_data, _ = await db.table(table_name).select("*", count="exact").execute()
        total_count = len(count_data[1])  # First element contains the count
        
        # Get paginated data
        data, _ = (
            await db.table(table_name)
            .select("*")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        _, items = data
        
        # Calculate total pages
        total_pages = 5
        
        # Prepare pagination metadata
        pagination_metadata = {
            "total_count": total_count,
            "total_pages": total_pages,
            "current_page": page,
            "page_size": page_size,
            "has_next": page < total_pages,
            "has_previous": page > 1
        }
        
        return {
            "items": [self.model(**item) for item in items],
            "pagination": pagination_metadata
        }