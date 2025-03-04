from typing import Optional
from pydantic import BaseModel, Field


class ReportSummary(BaseModel):
    """Summary information about a report."""
    job_id: str = Field(..., description="Unique identifier for the analysis job")
    sop_file: str = Field(..., description="Name of the SOP file analyzed")
    timestamp: float = Field(..., description="Timestamp when the report was created")
    status: str = Field(..., description="Status of the report (completed/failed)")
    compliance_score: Optional[int] = Field(default=None, description="Compliance score if available") 