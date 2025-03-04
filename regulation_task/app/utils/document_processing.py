import re
import time
import hashlib
import json
import os
from pathlib import Path
from typing import List, Dict, Any
from functools import lru_cache

import fitz  # PyMuPDF
from docx import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

from app.core.config import settings


def get_file_hash(file_path: str) -> str:
    """Generate a hash for a file to use as a unique identifier."""
    with open(file_path, "rb") as f:
        file_hash = hashlib.md5(f.read()).hexdigest()
    return file_hash


def get_file_metadata(file_path: str) -> Dict[str, Any]:
    """Get file metadata including modification time and size."""
    stat = os.stat(file_path)
    return {
        "mtime": stat.st_mtime,
        "size": stat.st_size,
        "hash": get_file_hash(file_path)
    }


def has_file_changed(file_path: str, stored_metadata: Dict[str, Any]) -> bool:
    """Check if a file has changed since it was last processed."""
    if not stored_metadata:
        return True
    
    current_metadata = get_file_metadata(file_path)
    
    # If size or hash changed, file has definitely changed
    if (current_metadata["size"] != stored_metadata.get("size") or
        current_metadata["hash"] != stored_metadata.get("hash")):
        return True
    
    return False


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    try:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        return text
    except Exception as e:
        print(f"Error extracting text from PDF {file_path}: {e}")
        return ""


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from a DOCX file."""
    try:
        doc = Document(file_path)
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from DOCX {file_path}: {e}")
        return ""


def extract_text_from_file(file_path: str) -> str:
    """Extract text from a file based on its extension."""
    file_extension = Path(file_path).suffix.lower()
    if file_extension == ".pdf":
        return extract_text_from_pdf(file_path)
    elif file_extension == ".docx":
        return extract_text_from_docx(file_path)
    else:
        # For text files or other formats
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            return ""


def split_text_into_chunks(text: str, chunk_size: int = None, chunk_overlap: int = None) -> List[str]:
    """Split text into chunks for processing."""
    chunk_size = chunk_size or settings.CHUNK_SIZE
    chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
    )
    return text_splitter.split_text(text)


def extract_regulatory_clauses(text: str) -> List[str]:
    """
    Extract regulatory clauses from text.
    This function identifies sections that appear to be regulatory requirements.
    """
    # Common patterns for regulatory clauses
    patterns = [
        r"(?:Section|§)\s+\d+(?:\.\d+)*\s*[:.-]\s*[A-Z].*?(?=(?:Section|§)\s+\d+|\Z)",
        r"\d+(?:\.\d+)*\s+[A-Z].*?(?=\d+(?:\.\d+)*\s+[A-Z]|\Z)",
        r"(?:Article|Regulation|Rule)\s+\d+(?:\.\d+)*\s*[:.-]\s*[A-Z].*?(?=(?:Article|Regulation|Rule)\s+\d+|\Z)",
        r"(?:must|shall|should|required|requirement|comply|compliance|mandatory).*?(?=\n\n|\Z)",
    ]
    
    clauses = []
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.DOTALL | re.MULTILINE)
        for match in matches:
            clause = match.group(0).strip()
            if len(clause) > 50:  # Filter out very short matches
                clauses.append(clause)
    
    # If no clauses found with regex, use a simpler paragraph-based approach
    if not clauses:
        paragraphs = text.split('\n\n')
        for para in paragraphs:
            para = para.strip()
            if len(para) > 100 and any(keyword in para.lower() for keyword in 
                                      ['must', 'shall', 'should', 'required', 'requirement', 
                                       'comply', 'compliance', 'mandatory', 'regulation']):
                clauses.append(para)
    
    return clauses


@lru_cache(maxsize=100)
def get_processed_file_path(file_path: str) -> str:
    """Get the path to the processed file."""
    file_hash = get_file_hash(file_path)
    file_name = Path(file_path).stem
    return str(settings.PROCESSED_DIR / f"{file_name}_{file_hash}.json")


def is_file_processed(file_path: str) -> bool:
    """Check if a file has already been processed and hasn't changed."""
    processed_path = get_processed_file_path(file_path)
    
    if not Path(processed_path).exists():
        return False
    
    # Check if the file has changed since it was processed
    try:
        with open(processed_path, "r", encoding="utf-8") as f:
            processed_data = json.load(f)
            
        # Get stored metadata
        stored_metadata = processed_data.get("metadata", {})
        
        # Check if file has changed
        if has_file_changed(file_path, stored_metadata):
            print(f"File {file_path} has changed since last processing")
            return False
            
        return True
    except Exception as e:
        print(f"Error checking if file is processed: {e}")
        return False


def save_processed_file(file_path: str, data: Dict[str, Any]) -> None:
    """Save processed file data to disk."""
    # Add file metadata to track changes
    data["metadata"] = get_file_metadata(file_path)
    
    processed_path = get_processed_file_path(file_path)
    with open(processed_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_processed_file(file_path: str) -> Dict[str, Any]:
    """Load processed file data from disk."""
    processed_path = get_processed_file_path(file_path)
    if Path(processed_path).exists():
        with open(processed_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {} 