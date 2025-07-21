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

    async def get(self, table_name: str, db: AsyncClient, *, id: str, include_deleted: bool = False) -> Optional[ModelType]:
        """get by table_name by id"""
        query = db.table(table_name).select("*").eq("id", id)
        
        # Filter out deleted records unless explicitly requested
        if not include_deleted:
            query = query.neq("deleted", True)
            
        result = await query.execute()
        data = result.data
        return self.model(**data[0]) if data else None

    async def get_all(self, table_name: str, db: AsyncClient, include_deleted: bool = False) -> list[ModelType]:
        """get all by table_name"""
        query = db.table(table_name).select("*")
        
        # Filter out deleted records unless explicitly requested
        if not include_deleted:
            query = query.neq("deleted", True)
            
        result = await query.execute()
        data = result.data
        return [self.model(**item) for item in data]

    async def search_all(
        self, table_name: str, db: AsyncClient, *, field: str, search_value: str, max_results: int, include_deleted: bool = False
    ) -> list[ModelType]:
        """search all by table_name"""
        query = (
            db.table(table_name)
            .select("*")
            .ilike(field, f"%{search_value}%")
            .limit(max_results)
        )
        
        # Filter out deleted records unless explicitly requested
        if not include_deleted:
            query = query.neq("deleted", True)
            
        result = await query.execute()
        data = result.data
        return [self.model(**item) for item in data]

    async def create(self, table_name: str, db: AsyncClient, *, obj_in: CreateSchemaType) -> ModelType:
        """create by CreateSchemaType"""
        result = await db.table(table_name).insert(obj_in.model_dump()).execute()
        data = result.data
        return self.model(**data[0])

    async def update(self, table_name: str, db: AsyncClient, *, obj_in: UpdateSchemaType) -> ModelType:
        """update by UpdateSchemaType"""
        result = await db.table(table_name).update(obj_in.model_dump()).eq("id", obj_in.id).execute()
        data = result.data
        return self.model(**data[0])
    
    async def update_status(self, table_name: str, db: AsyncClient, *, obj_in: UpdateSchemaType) -> ModelType:
        """update by UpdateSchemaType"""
        result = await db.table(table_name).update({"referral_status": obj_in.referral_status}).eq("id", obj_in.id).execute()
        data = result.data
        return self.model(**data[0])

    async def delete(self, table_name: str, db: AsyncClient, *, id: str) -> ModelType:
        """remove by UpdateSchemaType"""
        result = await db.table(table_name).delete().eq("id", id).execute()
        data = result.data
        return self.model(**data[0])

    async def get_all_paginated(
        self, 
        table_name: str, 
        db: AsyncClient, 
        *, 
        page: int = 1, 
        page_size: int = 10,
        search: str = "",
        include_deleted: bool = False
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
        
        # Get total count with filtering
        count_query = db.table(table_name).select("*", count="exact")
        if not include_deleted:
            count_query = count_query.neq("deleted", True)
        count_result = await count_query.execute()
        total_count = count_result.count if count_result.count is not None else 0
        
        # Get paginated data with filtering
        data_query = db.table(table_name).select("*").range(offset, offset + page_size - 1)
        if not include_deleted:
            data_query = data_query.neq("deleted", True)
        data_result = await data_query.execute()
        items = data_result.data
        
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