import os
import shutil
import json
from pathlib import Path
from langchain_chroma import Chroma
from langchain.schema import Document as LangchainDocument
from typing import List, Dict, Any, Set

from app.core.config import settings
from app.models.embeddings import ClaudeEmbeddings


# Track which documents have been added to the vector database
def get_indexed_documents_path() -> Path:
    """Get the path to the file tracking indexed documents."""
    return settings.CHROMA_PERSIST_DIR / "indexed_documents.json"


def get_indexed_documents() -> Set[str]:
    """Get the set of document IDs that have been indexed."""
    index_path = get_indexed_documents_path()
    if index_path.exists():
        try:
            with open(index_path, "r", encoding="utf-8") as f:
                return set(json.load(f))
        except Exception as e:
            print(f"Error loading indexed documents: {e}")
    return set()


def add_indexed_document(doc_id: str) -> None:
    """Add a document ID to the indexed documents set."""
    indexed_docs = get_indexed_documents()
    indexed_docs.add(doc_id)
    
    index_path = get_indexed_documents_path()
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(list(indexed_docs), f)


def setup_vector_db() -> Chroma:
    """Set up and return a Chroma vector database."""
    # Initialize embeddings
    embeddings = ClaudeEmbeddings()
    
    # Optionally clear existing vector DB to ensure consistent results
    # if os.path.exists(settings.CHROMA_PERSIST_DIR):
    #     shutil.rmtree(settings.CHROMA_PERSIST_DIR)
    #     os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)

    # Ensure the directory exists
    os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
    
    return Chroma(
        collection_name="regulatory_clauses",
        persist_directory=str(settings.CHROMA_PERSIST_DIR),
        embedding_function=embeddings
    )


def is_document_indexed(doc_id: str) -> bool:
    """Check if a document has already been indexed in the vector database."""
    indexed_docs = get_indexed_documents()
    return doc_id in indexed_docs


def add_regulatory_clauses_to_db(clauses: List[str], source: str, db: Chroma, doc_id: str = None) -> None:
    """Add regulatory clauses to the vector database."""
    # If doc_id is provided, check if already indexed
    if doc_id and is_document_indexed(doc_id):
        print(f"Document {doc_id} already indexed, skipping")
        return
    
    documents = []
    for i, clause in enumerate(clauses):
        doc = LangchainDocument(
            page_content=clause,
            metadata={
                "source": source,
                "clause_id": i,
                "type": "regulatory_clause",
                "doc_id": doc_id
            }
        )
        documents.append(doc)
    
    if documents:
        db.add_documents(documents)
        
        # Mark document as indexed if doc_id is provided
        if doc_id:
            add_indexed_document(doc_id)


def find_relevant_clauses(sop_chunks: List[str], db: Chroma, top_k: int = 5) -> List[Dict[str, Any]]:
    """Find regulatory clauses relevant to each SOP chunk."""
    all_relevant_clauses = []
    
    for chunk in sop_chunks:
        results = db.similarity_search_with_score(chunk, k=top_k)
        
        for doc, score in results:
            if score < 0.75:  # Lower score means higher similarity
                relevant_clause = {
                    "clause": doc.page_content,
                    "source": doc.metadata.get("source", "Unknown"),
                    "relevance_score": score,
                    "sop_chunk": chunk
                }
                all_relevant_clauses.append(relevant_clause)
    
    # Sort by relevance score and remove duplicates
    all_relevant_clauses.sort(key=lambda x: x["relevance_score"])
    
    # Remove duplicates based on clause content
    unique_clauses = []
    seen_clauses = set()
    
    for clause_info in all_relevant_clauses:
        clause_text = clause_info["clause"]
        if clause_text not in seen_clauses:
            seen_clauses.add(clause_text)
            unique_clauses.append(clause_info)
    
    return unique_clauses


def remove_document_from_db(doc_id: str, db: Chroma) -> bool:
    """Remove a document and all its clauses from the vector database.
    
    Args:
        doc_id: The document ID to remove
        db: The Chroma database instance
        
    Returns:
        bool: True if the document was found and removed, False otherwise
    """
    try:
        # Check if document is indexed
        if not is_document_indexed(doc_id):
            print(f"Document {doc_id} not found in index, nothing to remove")
            return False
            
        # Remove from Chroma DB
        db.delete(where={"doc_id": doc_id})
        
        # Remove from indexed documents
        indexed_docs = get_indexed_documents()
        if doc_id in indexed_docs:
            indexed_docs.remove(doc_id)
            
            # Save updated indexed documents
            index_path = get_indexed_documents_path()
            with open(index_path, "w", encoding="utf-8") as f:
                json.dump(list(indexed_docs), f)
                
        print(f"Successfully removed document {doc_id} from vector database")
        return True
    except Exception as e:
        print(f"Error removing document {doc_id} from vector database: {e}")
        return False 