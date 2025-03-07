import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application settings."""
    
    # Project info
    PROJECT_NAME: str = "Regulatory Compliance Document Processor"
    PROJECT_DESCRIPTION: str = "API for analyzing SOP documents against regulatory requirements"
    VERSION: str = "0.1.0"
    
    # API settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # API Keys
    CLAUDE_API_KEY: str = os.getenv("CLAUDE_API_KEY", "")
    
    # Directories
    DATA_DIR: Path = BASE_DIR / "data"
    SOP_DIR: Path = DATA_DIR / "sop"
    REGULATORY_DOCS_DIR: Path = DATA_DIR / "regulations"
    PROCESSED_DIR: Path = DATA_DIR / "processed"
    REPORTS_DIR: Path = DATA_DIR / "reports"
    CHROMA_PERSIST_DIR: Path = DATA_DIR / "chroma_db"
    STATIC_DIR: Path = BASE_DIR / "app" / "static"
    
    # Default paths
    DEFAULT_SOP_PATH: Path = SOP_DIR / "original.docx"
    
    # Processing settings
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    TOP_K_CLAUSES: int = 5
    
    # Model settings
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20240620"
    MAX_TOKENS: int = 4000
    TEMPERATURE: float = 0.0
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()

# Create necessary directories
os.makedirs(settings.SOP_DIR, exist_ok=True)
os.makedirs(settings.REGULATORY_DOCS_DIR, exist_ok=True)
os.makedirs(settings.PROCESSED_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
os.makedirs(BASE_DIR / "app" / "templates", exist_ok=True)
os.makedirs(settings.STATIC_DIR, exist_ok=True) 