import re
import json
from typing import List, Dict, Any

from anthropic import Anthropic
import anthropic

from app.core.config import settings


class LLMService:
    """Service for interacting with Claude LLM."""
    
    def __init__(self, api_key: str = None):
        """Initialize with API key."""
        self.api_key = api_key or settings.CLAUDE_API_KEY
        self.client = Anthropic(api_key=self.api_key)
        self.model = settings.CLAUDE_MODEL
    
    async def analyze_sop_with_llm(self, sop_text: str, relevant_clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Use Claude to analyze the SOP against relevant regulatory clauses.
        """
        # Prepare the clauses for the prompt
        clauses_text = ""
        for i, clause_info in enumerate(relevant_clauses[:20]):  # Limit to top 20 to avoid token limits
            clauses_text += f"Clause {i+1} (from {clause_info['source']}):\n{clause_info['clause']}\n\n"
        
        # Create the prompt for Claude
        prompt = f"""You are a regulatory compliance expert. I need you to analyze a Standard Operating Procedure (SOP) document against relevant regulatory clauses.

REGULATORY CLAUSES:
{clauses_text}

SOP DOCUMENT:
{sop_text[:10000]}  # Truncate if needed to fit token limits

Please analyze the SOP against these regulatory clauses and provide:
1. A summary of compliance status
2. Specific discrepancies or gaps between the SOP and regulatory requirements
3. Recommended adjustments to make the SOP fully compliant
4. A compliance score from 0-100

Format your response as JSON with the following structure:
{{
  "compliance_summary": "Overall assessment of compliance",
  "discrepancies": [
    {{
      "regulatory_reference": "Reference to the specific clause",
      "issue": "Description of the compliance gap",
      "severity": "High/Medium/Low"
    }}
  ],
  "recommended_adjustments": [
    {{
      "section": "Relevant SOP section",
      "current_text": "Current text if applicable",
      "suggested_text": "Suggested compliant text",
      "explanation": "Explanation of the change"
    }}
  ],
  "compliance_score": 85
}}
"""

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=settings.MAX_TOKENS,
                temperature=settings.TEMPERATURE,
                system="You are a regulatory compliance expert who provides detailed analysis in JSON format.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            # Extract the JSON from the response
            content = response.content[0].text
            
            # Find JSON in the response
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```|({[\s\S]*})', content)
            if json_match:
                json_str = json_match.group(1) or json_match.group(2)
                analysis_result = json.loads(json_str)
            else:
                # If no JSON formatting, try to parse the whole response
                analysis_result = json.loads(content)
                
            return analysis_result
        
        except Exception as e:
            print(f"Error analyzing with LLM: {e}")
            return {
                "compliance_summary": "Error in analysis",
                "discrepancies": [],
                "recommended_adjustments": [],
                "compliance_score": 0,
                "error": str(e)
            } 