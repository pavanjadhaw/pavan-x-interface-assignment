import os
import time
import hashlib
from pathlib import Path

from app.core.config import settings
from app.services.analysis_service import process_documents_and_analyze


async def run_cli_analysis():
    """Run analysis from command line."""
    print(f"{settings.PROJECT_NAME}")
    print("=" * len(settings.PROJECT_NAME))
    
    # Check for SOP file
    sop_file = settings.DEFAULT_SOP_PATH
    if not os.path.exists(sop_file):
        print(f"SOP file not found at {sop_file}")
        return
    
    # Check for regulatory documents
    regulatory_dir = settings.REGULATORY_DOCS_DIR
    regulatory_files = []
    
    if os.path.exists(regulatory_dir):
        for file in os.listdir(regulatory_dir):
            file_path = os.path.join(regulatory_dir, file)
            if os.path.isfile(file_path):
                regulatory_files.append(file_path)
    
    if not regulatory_files:
        print(f"No regulatory documents found in {regulatory_dir}")
        return
    
    print(f"Found SOP file: {sop_file}")
    print(f"Found {len(regulatory_files)} regulatory documents")
    
    # Generate job ID
    job_id = f"cli_job_{int(time.time())}"
    
    print("\nStarting analysis...")
    result = await process_documents_and_analyze(sop_file, regulatory_files, job_id)
    
    print("\nAnalysis complete!")
    print(f"Report saved to: {settings.REPORTS_DIR / f'{job_id}.json'}")
    
    # Print summary
    if "analysis" in result:
        analysis = result["analysis"]
        print("\nCompliance Summary:")
        print(analysis.get("compliance_summary", "No summary available"))
        
        print(f"\nCompliance Score: {analysis.get('compliance_score', 'N/A')}/100")
        
        print("\nTop Discrepancies:")
        for i, discrepancy in enumerate(analysis.get("discrepancies", [])[:3]):
            print(f"{i+1}. {discrepancy.get('issue', 'Unknown issue')} (Severity: {discrepancy.get('severity', 'Unknown')})")
        
        print("\nTop Recommendations:")
        for i, adjustment in enumerate(analysis.get("recommended_adjustments", [])[:3]):
            print(f"{i+1}. {adjustment.get('explanation', 'Unknown recommendation')}") 