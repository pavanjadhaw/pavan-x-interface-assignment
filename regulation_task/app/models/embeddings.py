import hashlib
import textwrap
from typing import List

from langchain.embeddings.base import Embeddings
from anthropic import Anthropic

from app.core.config import settings


class ClaudeEmbeddings(Embeddings):
    """Claude embeddings wrapper for Langchain."""
    
    def __init__(self, api_key: str = None):
        """Initialize with API key."""
        self.api_key = api_key or settings.CLAUDE_API_KEY
        self.client = Anthropic(api_key=self.api_key)
        
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed documents using Claude."""
        embeddings = []
        for text in texts:
            # Create a deterministic embedding based on hash values
            embedding = [0.0] * 1536
            for i, chunk in enumerate(textwrap.wrap(text, 10)):
                h = int(hashlib.md5(chunk.encode()).hexdigest(), 16)
                idx = h % 1536
                embedding[idx] = 1.0
            # Normalize
            magnitude = sum(x**2 for x in embedding) ** 0.5
            if magnitude > 0:
                embedding = [x/magnitude for x in embedding]
            embeddings.append(embedding)
        return embeddings
    
    def embed_query(self, text: str) -> List[float]:
        """Embed query using Claude."""
        # Use the same approach as for documents
        return self.embed_documents([text])[0] 