import os
import json
from typing import List

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.schemas.reports import ReportSummary

router = APIRouter()

@router.get("", response_model=List[ReportSummary])
async def list_reports():
    """List all analysis reports."""
    reports = []
    for file in os.listdir(settings.REPORTS_DIR):
        if file.endswith(".json") and not file.endswith("_status.json"):
            file_path = settings.REPORTS_DIR / file
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    report_data = json.load(f)
                
                # Extract compliance score from analysis if available
                compliance_score = None
                if "analysis" in report_data and "compliance_score" in report_data["analysis"]:
                    compliance_score = report_data["analysis"]["compliance_score"]
                elif "compliance_score" in report_data:
                    compliance_score = report_data["compliance_score"]
                
                reports.append(ReportSummary(
                    job_id=report_data.get("job_id", file.replace(".json", "")),
                    sop_file=report_data.get("sop_file", "Unknown"),
                    timestamp=report_data.get("timestamp", os.path.getmtime(file_path)),
                    status="completed" if "analysis" in report_data else "failed",
                    compliance_score=compliance_score
                ))
            except Exception as e:
                print(f"Error reading report {file}: {e}")
    
    # Sort by timestamp, newest first
    reports.sort(key=lambda x: x.timestamp, reverse=True)
    return reports


@router.get("/{job_id}")
async def get_report(job_id: str):
    """Get a specific analysis report."""
    report_path = settings.REPORTS_DIR / f"{job_id}.json"
    
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail=f"Report not found: {job_id}")
    
    try:
        with open(report_path, "r", encoding="utf-8") as f:
            report_data = json.load(f)
        
        return report_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{job_id}")
async def delete_report(job_id: str):
    """Delete a specific analysis report and its status file."""
    report_path = settings.REPORTS_DIR / f"{job_id}.json"
    status_path = settings.REPORTS_DIR / f"{job_id}_status.json"
    
    if not os.path.exists(report_path) and not os.path.exists(status_path):
        raise HTTPException(status_code=404, detail=f"Report not found: {job_id}")
    
    try:
        # Delete report file if it exists
        if os.path.exists(report_path):
            os.remove(report_path)
        
        # Delete status file if it exists
        if os.path.exists(status_path):
            os.remove(status_path)
        
        return JSONResponse(
            status_code=200,
            content={
                "job_id": job_id,
                "success": True,
                "message": f"Report '{job_id}' has been deleted"
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "job_id": job_id,
                "success": False,
                "message": f"Error deleting report: {str(e)}"
            }
        ) 