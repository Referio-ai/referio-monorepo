from pydantic import BaseModel


class FileResult(BaseModel):
    bucket_name: str
    signed_url: str
    filename: str