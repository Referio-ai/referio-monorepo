from pydantic import BaseModel
from typing import Optional


class FileResult(BaseModel):
    bucket_name: str
    signed_url: str
    filename: str
    document_category: Optional[str] = None