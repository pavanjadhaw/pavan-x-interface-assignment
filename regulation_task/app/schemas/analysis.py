from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    """Request model for document analysis."""
    sop_file: str = Field(..., description="Path to the SOP file to analyze")
    regulatory_files: List[str] = Field(default=[], description="Paths to regulatory files to compare against")


class AnalysisResponse(BaseModel):
    """Response model for analysis job creation."""
    job_id: str = Field(..., description="Unique identifier for the analysis job")
    status: str = Field(..., description="Current status of the job")
    message: str = Field(..., description="Human-readable status message")


class AnalysisResult(BaseModel):
    """Response model for analysis job status and results."""
    job_id: str = Field(..., description="Unique identifier for the analysis job")
    status: str = Field(..., description="Current status of the job")
    report: Optional[Dict[str, Any]] = Field(default=None, description="Analysis report if completed")
    error: Optional[str] = Field(default=None, description="Error message if failed")


class ComplianceIssue(BaseModel):
    """Model for a compliance discrepancy."""
    regulatory_reference: str = Field(..., description="Reference to the specific regulatory clause")
    issue: str = Field(..., description="Description of the compliance gap")
    severity: str = Field(..., description="Severity level (High/Medium/Low)")


class RecommendedAdjustment(BaseModel):
    """Model for a recommended adjustment to achieve compliance."""
    section: str = Field(..., description="Relevant SOP section")
    current_text: Optional[str] = Field(default=None, description="Current text if applicable")
    suggested_text: str = Field(..., description="Suggested compliant text")
    explanation: str = Field(..., description="Explanation of the change")


class AnalysisReport(BaseModel):
    """Model for a complete analysis report."""
    compliance_summary: str = Field(..., description="Overall assessment of compliance")
    discrepancies: List[ComplianceIssue] = Field(default=[], description="List of compliance issues")
    recommended_adjustments: List[RecommendedAdjustment] = Field(default=[], description="List of recommended adjustments")
    compliance_score: int = Field(..., description="Compliance score from 0-100")
    relevant_clauses: Optional[List[Dict[str, Any]]] = Field(default=None, description="Relevant regulatory clauses") 