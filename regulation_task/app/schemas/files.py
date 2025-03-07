from typing import Optional
from pydantic import BaseModel, Field


class FileInfo(BaseModel):
    """Model for file information."""
    filename: str = Field(..., description="Name of the file")
    path: str = Field(..., description="Path to the file relative to the workspace")
    size: int = Field(..., description="Size of the file in bytes")
    last_modified: float = Field(..., description="Last modified timestamp")


class FileUploadResponse(BaseModel):
    """Response model for file uploads."""
    filename: str = Field(..., description="Name of the uploaded file")
    path: str = Field(..., description="Path where the file was saved")
    size: Optional[int] = Field(default=None, description="Size of the file in bytes")
    message: Optional[str] = Field(default=None, description="Optional message about the upload status")


class FileDeleteResponse(BaseModel):
    """Response model for file deletion."""
    filename: str = Field(..., description="Name of the deleted file")
    success: bool = Field(..., description="Whether the deletion was successful")
    message: str = Field(..., description="Message about the deletion status") 