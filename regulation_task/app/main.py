import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

from app.core.config import settings
from app.api.api import api_router
from app.core.lifespan import lifespan

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api")

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Initialize templates
templates = Jinja2Templates(directory="app/templates")

# Add route for the HTML frontend
@app.get("/", response_class=HTMLResponse)
async def get_html(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--cli":
        # Run in CLI mode
        from app.cli import run_cli_analysis
        import asyncio
        asyncio.run(run_cli_analysis())
    else:
        # Run in server mode
        print(f"Starting server on http://localhost:{settings.PORT}")
        uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG) 