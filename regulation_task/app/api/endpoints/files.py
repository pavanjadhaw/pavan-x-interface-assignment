import os
import hashlib
import time
import shutil
from typing import List
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.schemas.files import FileInfo, FileUploadResponse, FileDeleteResponse
from app.utils.document_processing import get_file_hash, get_processed_file_path
from app.db.vector_store import setup_vector_db, remove_document_from_db, get_indexed_documents

router = APIRouter()


def calculate_file_hash(content: bytes) -> str:
    """Calculate SHA-256 hash of file content."""
    return hashlib.md5(content).hexdigest()


def check_file_exists_by_hash(directory, content: bytes) -> str:
    """Check if a file with the same hash already exists in the directory.
    
    Returns the filename if found, None otherwise.
    """
    content_hash = calculate_file_hash(content)
    
    for filename in os.listdir(directory):
        file_path = directory / filename
        if os.path.isfile(file_path):
            with open(file_path, "rb") as f:
                existing_content = f.read()
                if calculate_file_hash(existing_content) == content_hash:
                    return filename
    
    return None


def get_unique_filename(directory, original_filename):
    """Generate a unique filename if the original already exists with different content."""
    # Get file extension and base name
    file_path = Path(original_filename)
    stem = file_path.stem
    suffix = file_path.suffix
    
    # Check if file exists
    if not os.path.exists(directory / original_filename):
        return original_filename
    
    # Add timestamp to make it unique
    timestamp = int(time.time())
    new_filename = f"{stem}_{timestamp}{suffix}"
    
    return new_filename


def is_valid_file_extension(filename: str) -> bool:
    """Check if the file has a supported extension."""
    allowed_extensions = ['.pdf', '.docx', '.doc']
    file_extension = os.path.splitext(filename)[1].lower()
    return file_extension in allowed_extensions


def is_valid_file_size(content: bytes) -> bool:
    """Check if the file size is within the allowed limit (50MB)."""
    max_size = 50 * 1024 * 1024  # 50MB in bytes
    return len(content) <= max_size


@router.post("/upload/sop", response_model=List[FileUploadResponse])
async def upload_sop(files: List[UploadFile] = File(...)):
    """Upload one or more SOP documents."""
    results = []
    
    # Validate that files list is not empty
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    for file in files:
        try:
            # Validate file extension
            if not is_valid_file_extension(file.filename):
                results.append(FileUploadResponse(
                    filename=file.filename,
                    path="",
                    size=0,
                    message="Unsupported file type. Please upload PDF, DOCX, or DOC files."
                ))
                continue
                
            # Read file content
            content = await file.read()
            
            # Validate that file is not empty
            if len(content) == 0:
                results.append(FileUploadResponse(
                    filename=file.filename,
                    path="",
                    size=0,
                    message="Empty file detected. Please upload a valid document."
                ))
                continue
                
            # Validate file size
            if not is_valid_file_size(content):
                results.append(FileUploadResponse(
                    filename=file.filename,
                    path="",
                    size=len(content),
                    message="File is too large. Maximum allowed size is 50MB."
                ))
                continue
                
            content_hash = hashlib.md5(content).hexdigest()
            
            # Check if file with same hash already exists
            for existing_file in os.listdir(settings.SOP_DIR):
                existing_path = settings.SOP_DIR / existing_file
                if os.path.isfile(existing_path):
                    existing_hash = get_file_hash(str(existing_path))
                    if existing_hash == content_hash:
                        results.append(FileUploadResponse(
                            filename=existing_file,
                            path=str(existing_path),
                            size=os.path.getsize(existing_path),
                            message="This document is already in our system"
                        ))
                        break
            else:  # No duplicate found
                # Check if a file with the same name exists but with different content
                original_filename = file.filename
                if os.path.exists(settings.SOP_DIR / original_filename):
                    # File exists but has different content (since we didn't find a hash match)
                    # Generate a unique filename to avoid overwriting
                    new_filename = get_unique_filename(settings.SOP_DIR, original_filename)
                    file_path = settings.SOP_DIR / new_filename
                    
                    with open(file_path, "wb") as f:
                        f.write(content)
                    
                    results.append(FileUploadResponse(
                        filename=new_filename,
                        path=str(file_path),
                        size=len(content),
                        message=f"A different file with the same name already exists. Your file was saved as {new_filename}"
                    ))
                else:
                    # Save the file with original name
                    file_path = settings.SOP_DIR / original_filename
                    with open(file_path, "wb") as f:
                        f.write(content)
                    
                    results.append(FileUploadResponse(
                        filename=original_filename,
                        path=str(file_path),
                        size=len(content)
                    ))
        except Exception as e:
            results.append(FileUploadResponse(
                filename=file.filename,
                path="",
                size=0,
                message=f"Error uploading file: {str(e)}"
            ))
    
    return results


@router.post("/upload/regulatory", response_model=List[FileUploadResponse])
async def upload_regulatory(files: List[UploadFile] = File(...)):
    """Upload one or more regulatory documents."""
    results = []
    
    # Validate that files list is not empty
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    for file in files:
        try:
            # Validate file extension
            if not is_valid_file_extension(file.filename):
                results.append(FileUploadResponse(
                    filename=file.filename,
                    path="",
                    size=0,
                    message="Unsupported file type. Please upload PDF, DOCX, or DOC files."
                ))
                continue
                
            # Read file content
            content = await file.read()
            
            # Validate that file is not empty
            if len(content) == 0:
                results.append(FileUploadResponse(
                    filename=file.filename,
                    path="",
                    size=0,
                    message="Empty file detected. Please upload a valid document."
                ))
                continue
                
            # Validate file size
            if not is_valid_file_size(content):
                results.append(FileUploadResponse(
                    filename=file.filename,
                    path="",
                    size=len(content),
                    message="File is too large. Maximum allowed size is 50MB."
                ))
                continue
                
            content_hash = hashlib.md5(content).hexdigest()
            
            # Check if file with same hash already exists
            for existing_file in os.listdir(settings.REGULATORY_DOCS_DIR):
                existing_path = settings.REGULATORY_DOCS_DIR / existing_file
                if os.path.isfile(existing_path):
                    existing_hash = get_file_hash(str(existing_path))
                    if existing_hash == content_hash:
                        results.append(FileUploadResponse(
                            filename=existing_file,
                            path=str(existing_path),
                            size=os.path.getsize(existing_path),
                            message="This document is already in our system"
                        ))
                        break
            else:  # No duplicate found
                # Check if a file with the same name exists but with different content
                original_filename = file.filename
                if os.path.exists(settings.REGULATORY_DOCS_DIR / original_filename):
                    # File exists but has different content (since we didn't find a hash match)
                    # Generate a unique filename to avoid overwriting
                    new_filename = get_unique_filename(settings.REGULATORY_DOCS_DIR, original_filename)
                    file_path = settings.REGULATORY_DOCS_DIR / new_filename
                    
                    with open(file_path, "wb") as f:
                        f.write(content)
                    
                    results.append(FileUploadResponse(
                        filename=new_filename,
                        path=str(file_path),
                        size=len(content),
                        message=f"A different file with the same name already exists. Your file was saved as {new_filename}"
                    ))
                else:
                    # Save the file with original name
                    file_path = settings.REGULATORY_DOCS_DIR / original_filename
                    with open(file_path, "wb") as f:
                        f.write(content)
                    
                    results.append(FileUploadResponse(
                        filename=original_filename,
                        path=str(file_path),
                        size=len(content)
                    ))
        except Exception as e:
            results.append(FileUploadResponse(
                filename=file.filename,
                path="",
                size=0,
                message=f"Error uploading file: {str(e)}"
            ))
    
    return results


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


@router.delete("/sop/{filename}")
async def delete_sop(filename: str):
    """Delete an SOP document and all related data."""
    try:
        file_path = settings.SOP_DIR / filename
        
        if not os.path.exists(file_path):
            return JSONResponse(
                status_code=404,
                content={"detail": f"File not found: {filename}"}
            )
        
        # Delete the actual file
        try:
            os.remove(file_path)
        except PermissionError:
            return JSONResponse(
                status_code=409,
                content={"detail": f"Cannot delete file: it is currently in use by another process"}
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"detail": f"Error deleting file: {str(e)}"}
            )
        
        # Try to delete processed data if it exists
        try:
            processed_file_path = get_processed_file_path(str(file_path))
            if os.path.exists(processed_file_path):
                os.remove(processed_file_path)
        except Exception as e:
            print(f"Warning: Could not delete processed file: {e}")
        
        # Try to clean up reports
        deleted_reports = 0
        try:
            for report_file in os.listdir(settings.REPORTS_DIR):
                if report_file.endswith(".json") and not report_file.endswith("_status.json"):
                    report_path = settings.REPORTS_DIR / report_file
                    try:
                        with open(report_path, "r") as f:
                            import json
                            report_data = json.load(f)
                            if report_data.get("sop_file") == filename:
                                os.remove(report_path)
                                deleted_reports += 1
                                # Also remove status file if it exists
                                status_file = settings.REPORTS_DIR / f"{report_file.split('.')[0]}_status.json"
                                if os.path.exists(status_file):
                                    os.remove(status_file)
                    except Exception as e:
                        print(f"Warning: Error processing report file {report_file}: {e}")
        except Exception as e:
            print(f"Warning: Error cleaning up reports: {e}")
        
        message = f"SOP document '{filename}' has been deleted"
        if deleted_reports > 0:
            message += f", along with {deleted_reports} related report(s)"
        
        return JSONResponse(
            status_code=200,
            content={
                "filename": filename,
                "success": True,
                "message": message
            }
        )
    except Exception as e:
        print(f"Error in delete_sop: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "filename": filename,
                "success": False,
                "message": f"Error deleting file: {str(e)}"
            }
        )


def cleanup_vector_db_for_document(doc_id: str):
    """Background task to clean up vector database entries for a document.
    
    This function is designed to be run as a background task.
    """
    try:
        print(f"Starting background cleanup of vector DB for document {doc_id}")
        db = setup_vector_db()
        result = remove_document_from_db(doc_id, db)
        if result:
            print(f"Successfully removed document {doc_id} from vector database in background task")
        else:
            print(f"Document {doc_id} was not found in vector database or could not be removed")
    except Exception as e:
        print(f"Error in background cleanup of vector DB for document {doc_id}: {e}")


@router.delete("/regulatory/{filename}")
async def delete_regulatory(filename: str, background_tasks: BackgroundTasks):
    """Delete a regulatory document and all related data."""
    try:
        file_path = settings.REGULATORY_DOCS_DIR / filename
        
        if not os.path.exists(file_path):
            return JSONResponse(
                status_code=404,
                content={"detail": f"File not found: {filename}"}
            )
        
        # Calculate file hash before deletion to clean up vector DB
        doc_id = None
        try:
            doc_id = get_file_hash(str(file_path))
            print(f"Document ID for vector DB cleanup: {doc_id}")
        except Exception as e:
            print(f"Warning: Could not calculate file hash: {e}")
        
        # Delete the actual file
        try:
            os.remove(file_path)
        except PermissionError:
            return JSONResponse(
                status_code=409,
                content={"detail": f"Cannot delete file: it is currently in use by another process"}
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"detail": f"Error deleting file: {str(e)}"}
            )
        
        # Try to delete processed data if it exists
        try:
            processed_file_path = get_processed_file_path(str(file_path))
            if os.path.exists(processed_file_path):
                os.remove(processed_file_path)
        except Exception as e:
            print(f"Warning: Could not delete processed file: {e}")
        
        # Schedule vector DB cleanup as a background task if we have the document ID
        vector_db_cleanup_scheduled = False
        if doc_id:
            try:
                background_tasks.add_task(cleanup_vector_db_for_document, doc_id)
                vector_db_cleanup_scheduled = True
            except Exception as e:
                print(f"Warning: Could not schedule vector DB cleanup: {e}")
        
        message = f"Regulatory document '{filename}' has been deleted"
        if vector_db_cleanup_scheduled:
            message += " and vector database cleanup has been scheduled"
        
        return JSONResponse(
            status_code=200,
            content={
                "filename": filename,
                "success": True,
                "message": message
            }
        )
    except Exception as e:
        print(f"Error in delete_regulatory: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "filename": filename,
                "success": False,
                "message": f"Error deleting file: {str(e)}"
            }
        ) 