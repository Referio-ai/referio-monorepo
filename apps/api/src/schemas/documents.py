from typing import ClassVar, Sequence, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


class Document(BaseModel):
    document_id: UUID
    created_at: datetime
    source: str
    patient_id: UUID
    referral_id: UUID
    table_name: ClassVar[str] = "documents"


class DocumentCreate(BaseModel):
    source: str
    patient_id: UUID
    referral_id: UUID


class DocumentUpdate(BaseModel):
    source: Optional[str] = None
    patient_id: Optional[UUID] = None
    referral_id: Optional[UUID] = None


class DocumentSearchResults(BaseModel):
    results: Sequence[Document] 