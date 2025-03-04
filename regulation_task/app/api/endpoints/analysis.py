import os
import time
import hashlib
from typing import List

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File, Form, Depends

from app.core.config import settings
from app.schemas.analysis import AnalysisRequest, AnalysisResponse, AnalysisResult
from app.services.analysis_service import run_analysis_task, get_job_status

router = APIRouter()


@router.post("", response_model=AnalysisResponse)
async def analyze_documents(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks
):
    """Start analysis of SOP against regulatory documents."""
    # Validate files exist
    if not os.path.exists(request.sop_file):
        raise HTTPException(status_code=404, detail=f"SOP file not found: {request.sop_file}")
    
    for reg_file in request.regulatory_files:
        if not os.path.exists(reg_file):
            raise HTTPException(status_code=404, detail=f"Regulatory file not found: {reg_file}")
    
    # Generate job ID
    job_id = f"job_{int(time.time())}_{hashlib.md5(request.sop_file.encode()).hexdigest()[:8]}"
    
    # Start background task
    background_tasks.add_task(
        run_analysis_task,
        request.sop_file,
        request.regulatory_files,
        job_id
    )
    
    return AnalysisResponse(
        job_id=job_id,
        status="processing",
        message="Analysis started in background"
    )


@router.get("/status/{job_id}", response_model=AnalysisResult)
async def get_analysis_status(job_id: str):
    """Get status of an analysis job."""
    job_info = get_job_status(job_id)
    
    if job_info is None:
        raise HTTPException(status_code=404, detail=f"Job not found: {job_id}")
    
    if job_info["status"] == "completed":
        return AnalysisResult(
            job_id=job_id,
            status="completed",
            report=job_info["result"]
        )
    elif job_info["status"] == "failed":
        return AnalysisResult(
            job_id=job_id,
            status="failed",
            error=job_info.get("error", "Unknown error")
        )
    
    return AnalysisResult(
        job_id=job_id,
        status="processing"
    ) 