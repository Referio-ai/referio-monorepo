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
    type: str
    document_category: Optional[str] = None
    table_name: ClassVar[str] = "documents"


class DocumentCreate(BaseModel):
    source: str
    patient_id: UUID
    referral_id: UUID
    type: str
    document_category: Optional[str] = None


class DocumentUpdate(BaseModel):
    source: Optional[str] = None
    patient_id: Optional[UUID] = None
    referral_id: Optional[UUID] = None
    type: Optional[str] = None
    document_category: Optional[str] = None #referral_form, insurance_card, xray, other_docs


class DocumentSearchResults(BaseModel):
    results: Sequence[Document] 