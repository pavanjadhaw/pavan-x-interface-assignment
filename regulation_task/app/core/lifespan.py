from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.core.config import settings
from app.db.vector_store import setup_vector_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application.
    Handles startup and shutdown events.
    """
    # Startup
    print(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    
    # Initialize vector database
    app.state.vector_db = setup_vector_db()
    
    # Yield control to the application
    yield
    
    # Shutdown
    print(f"Shutting down {settings.PROJECT_NAME}")
    
    # Cleanup resources if needed
    if hasattr(app.state, "vector_db"):
        # Persist vector database if needed
        pass 