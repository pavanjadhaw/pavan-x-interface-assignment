import time
from pathlib import Path
from typing import List, Dict, Any

from app.utils.document_processing import (
    extract_text_from_file,
    split_text_into_chunks,
    extract_regulatory_clauses,
    is_file_processed,
    load_processed_file,
    save_processed_file
)


async def process_regulatory_document(file_path: str) -> Dict[str, Any]:
    """Process a regulatory document and extract clauses."""
    if is_file_processed(file_path):
        return load_processed_file(file_path)
    
    text = extract_text_from_file(file_path)
    clauses = extract_regulatory_clauses(text)
    
    result = {
        "file_path": file_path,
        "file_name": Path(file_path).name,
        "text_length": len(text),
        "clauses": clauses,
        "num_clauses": len(clauses),
        "processed_at": time.time()
    }
    
    save_processed_file(file_path, result)
    return result


async def process_sop_document(file_path: str) -> Dict[str, Any]:
    """Process an SOP document."""
    if is_file_processed(file_path):
        return load_processed_file(file_path)
    
    text = extract_text_from_file(file_path)
    chunks = split_text_into_chunks(text)
    
    result = {
        "file_path": file_path,
        "file_name": Path(file_path).name,
        "text": text,
        "chunks": chunks,
        "text_length": len(text),
        "num_chunks": len(chunks),
        "processed_at": time.time()
    }
    
    save_processed_file(file_path, result)
    return result 