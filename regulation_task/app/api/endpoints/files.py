import os
from typing import List

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.schemas.files import FileInfo, FileUploadResponse

router = APIRouter()


@router.post("/upload/sop", response_model=FileUploadResponse)
async def upload_sop(file: UploadFile = File(...)):
    """Upload an SOP document."""
    try:
        file_path = settings.SOP_DIR / file.filename
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        return FileUploadResponse(
            filename=file.filename,
            path=str(file_path),
            size=len(content)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/regulatory", response_model=FileUploadResponse)
async def upload_regulatory(file: UploadFile = File(...)):
    """Upload a regulatory document."""
    try:
        file_path = settings.REGULATORY_DOCS_DIR / file.filename
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        return FileUploadResponse(
            filename=file.filename,
            path=str(file_path),
            size=len(content)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sop", response_model=List[FileInfo])
async def list_sop_files():
    """List all SOP files."""
    files = []
    for file in os.listdir(settings.SOP_DIR):
        file_path = settings.SOP_DIR / file
        if os.path.isfile(file_path):
            files.append(FileInfo(
                filename=file,
                path=str(file_path),
                size=os.path.getsize(file_path),
                last_modified=os.path.getmtime(file_path)
            ))
    return files


@router.get("/regulatory", response_model=List[FileInfo])
async def list_regulatory_files():
    """List all regulatory files."""
    files = []
    for file in os.listdir(settings.REGULATORY_DOCS_DIR):
        file_path = settings.REGULATORY_DOCS_DIR / file
        if os.path.isfile(file_path):
            files.append(FileInfo(
                filename=file,
                path=str(file_path),
                size=os.path.getsize(file_path),
                last_modified=os.path.getmtime(file_path)
            ))
    return files 