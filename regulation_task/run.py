#!/usr/bin/env python
"""
Entry point script for the Regulatory Compliance Document Processor.
"""
import sys
import uvicorn

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--cli":
        # Run in CLI mode
        from app.cli import run_cli_analysis
        import asyncio
        asyncio.run(run_cli_analysis())
    else:
        # Run in server mode
        from app.core.config import settings
        print(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
        print(f"Server running at http://localhost:{settings.PORT}")
        uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG) 