from fastapi import APIRouter

from app.api.endpoints import analysis, files, reports

# Create main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(analysis.router, prefix="/analyze", tags=["analysis"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"]) 