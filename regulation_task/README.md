# Regulatory Compliance Document Processor

A FastAPI application for analyzing Standard Operating Procedure (SOP) documents against regulatory requirements.

## Features

- Upload and manage SOP and regulatory documents
- Analyze SOPs against regulatory requirements using Claude AI
- Generate detailed compliance reports with:
  - Compliance summary
  - Specific discrepancies or gaps
  - Recommended adjustments
  - Compliance score
- View and manage analysis reports
- Command-line interface for batch processing

## Architecture

The application follows a modular architecture with clear separation of concerns:

- `app/api`: API endpoints and routers
- `app/core`: Core application components (config, lifespan)
- `app/db`: Database components (vector store)
- `app/models`: Model components (embeddings)
- `app/schemas`: Pydantic schemas for request/response validation
- `app/services`: Business logic services
- `app/utils`: Utility functions
- `app/templates`: HTML templates for the web interface

## Requirements

- Python 3.9+
- Claude API key

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/regulation-task.git
   cd regulation-task
   ```

2. Create a virtual environment:

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -e .
   ```

4. Create a `.env` file with your Claude API key:
   ```
   CLAUDE_API_KEY=your_api_key_here
   ```

## Usage

### Running the API server

```bash
python -m app.main
```

The API will be available at http://localhost:8000

### Running the CLI

```bash
python -m app.main --cli
```

### API Endpoints

- `GET /`: Web interface
- `POST /api/analyze`: Start analysis of SOP against regulatory documents
- `GET /api/status/{job_id}`: Get status of an analysis job
- `POST /api/files/upload/sop`: Upload an SOP document
- `POST /api/files/upload/regulatory`: Upload a regulatory document
- `GET /api/files/sop`: List all SOP files
- `GET /api/files/regulatory`: List all regulatory files
- `GET /api/reports`: List all analysis reports
- `GET /api/reports/{job_id}`: Get a specific analysis report

## Development

Install development dependencies:

```bash
pip install -e ".[dev]"
```

### Code Formatting

```bash
black .
isort .
```

### Type Checking

```bash
mypy .
```

### Testing

```bash
pytest
```

## License

MIT
