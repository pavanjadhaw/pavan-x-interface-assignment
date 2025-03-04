import os
import time
import json
import asyncio
from pathlib import Path
from typing import List, Dict, Any

from fastapi import Depends, BackgroundTasks

from app.core.config import settings
from app.db.vector_store import add_regulatory_clauses_to_db, find_relevant_clauses
from app.services.document_service import process_regulatory_document, process_sop_document
from app.services.llm_service import LLMService
from app.utils.document_processing import get_file_hash


# Background tasks storage (in-memory cache)
background_tasks = {}


def _save_job_status(job_id: str, status_data: Dict[str, Any]):
    """Save job status to disk."""
    status_file = settings.REPORTS_DIR / f"{job_id}_status.json"
    with open(status_file, "w", encoding="utf-8") as f:
        json.dump(status_data, f, ensure_ascii=False, indent=2)


def _load_job_status(job_id: str) -> Dict[str, Any]:
    """Load job status from disk."""
    status_file = settings.REPORTS_DIR / f"{job_id}_status.json"
    if not status_file.exists():
        return None
    
    try:
        with open(status_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


async def process_documents_and_analyze(
    sop_file: str, 
    regulatory_files: List[str],
    job_id: str,
    llm_service: LLMService = None
) -> Dict[str, Any]:
    """Process all documents and perform analysis."""
    try:
        # Initialize LLM service if not provided
        if llm_service is None:
            llm_service = LLMService()
        
        # Process SOP document
        sop_data = await process_sop_document(sop_file)
        
        # Process regulatory documents in parallel
        regulatory_data_tasks = [process_regulatory_document(file) for file in regulatory_files]
        regulatory_data_list = await asyncio.gather(*regulatory_data_tasks)
        
        # Set up vector database
        from app.main import app
        db = app.state.vector_db
        
        # Add regulatory clauses to vector database (only if not already indexed)
        for reg_data in regulatory_data_list:
            # Generate a unique document ID based on file hash
            doc_id = get_file_hash(reg_data["file_path"])
            
            add_regulatory_clauses_to_db(
                clauses=reg_data["clauses"],
                source=reg_data["file_name"],
                db=db,
                doc_id=doc_id
            )
        
        # Find relevant clauses for SOP
        relevant_clauses = find_relevant_clauses(
            sop_chunks=sop_data["chunks"], 
            db=db,
            top_k=settings.TOP_K_CLAUSES
        )
        
        # Analyze SOP with LLM
        analysis_result = await llm_service.analyze_sop_with_llm(sop_data["text"], relevant_clauses)
        
        # Prepare final report
        report = {
            "job_id": job_id,
            "sop_file": Path(sop_file).name,
            "regulatory_files": [Path(file).name for file in regulatory_files],
            "analysis": analysis_result,
            "relevant_clauses": relevant_clauses[:10],  # Include top 10 relevant clauses
            "timestamp": time.time()
        }
        
        # Save report
        report_path = settings.REPORTS_DIR / f"{job_id}.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        return report
    
    except Exception as e:
        error_report = {
            "job_id": job_id,
            "status": "failed",
            "error": str(e)
        }
        
        # Save error report
        report_path = settings.REPORTS_DIR / f"{job_id}.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(error_report, f, ensure_ascii=False, indent=2)
        
        return error_report


async def run_analysis_task(sop_file: str, regulatory_files: List[str], job_id: str):
    """Run analysis task in background and update status."""
    try:
        status_data = {"status": "processing", "start_time": time.time()}
        background_tasks[job_id] = status_data
        _save_job_status(job_id, status_data)
        
        result = await process_documents_and_analyze(sop_file, regulatory_files, job_id)
        
        status_data = {
            "status": "completed",
            "result": result,
            "end_time": time.time()
        }
        background_tasks[job_id] = status_data
        _save_job_status(job_id, status_data)
    except Exception as e:
        status_data = {
            "status": "failed",
            "error": str(e),
            "end_time": time.time()
        }
        background_tasks[job_id] = status_data
        _save_job_status(job_id, status_data)


def get_job_status(job_id: str) -> Dict[str, Any]:
    """Get the status of a job."""
    # First check in-memory cache
    if job_id in background_tasks:
        return background_tasks[job_id]
    
    # If not in memory, try to load from disk
    status_data = _load_job_status(job_id)
    if status_data:
        # Update in-memory cache
        background_tasks[job_id] = status_data
        return status_data
    
    # Check if the final report exists
    report_path = settings.REPORTS_DIR / f"{job_id}.json"
    if report_path.exists():
        try:
            with open(report_path, "r", encoding="utf-8") as f:
                report_data = json.load(f)
                
            # If report exists but no status file, create a completed status
            if "status" in report_data and report_data["status"] == "failed":
                status_data = {
                    "status": "failed",
                    "error": report_data.get("error", "Unknown error"),
                    "end_time": report_data.get("timestamp", time.time())
                }
            else:
                status_data = {
                    "status": "completed",
                    "result": report_data,
                    "end_time": report_data.get("timestamp", time.time())
                }
            
            background_tasks[job_id] = status_data
            _save_job_status(job_id, status_data)
            return status_data
        except Exception:
            pass
    
    return None 