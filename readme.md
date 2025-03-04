# Colab Frontend Documentation

## Live Demo

A live demo version of this application is deployed at: [https://interface-take-home-assignment.vercel.app/](https://interface-take-home-assignment.vercel.app/)

## Getting Started

This guide will help you set up and run the Colab Frontend application locally.

## Tech Stack

- **Next.js** - React framework
- **Mantine** - UI component library
- **Supabase** - Backend as a Service (BaaS)
- **Prisma** - ORM for database access

## Prerequisites

- Node.js (v18+)
- Yarn (v4+)
- Docker (for local Supabase)

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/pavanjadhaw/pavan-x-interface-assignment.git
cd pavan-x-interface-assignment
```

### 2. Install dependencies

```bash
cd frontend_task/colab_frontend
yarn install
```

### 3. Set up Supabase locally

Install Supabase CLI if you haven't already:

```bash
npm install -g supabase
```

Start Supabase locally:

```bash
supabase start
```

This will spin up local Supabase services including PostgreSQL database.

After starting Supabase, you can get your local credentials by running:

```bash
supabase status
```

Look for the `API URL` and `anon key` in the output and update your `.env` file if needed.

### 4. Set up environment variables

The `.env` file should already contain the necessary configuration for local development. If you need to modify it, here's what each variable means:

```
# Local Development
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY_FROM_SUPABASE_STATUS>
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

- `NEXT_PUBLIC_SUPABASE_URL`: URL of your Supabase instance
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anonymous key for Supabase authentication
- `DATABASE_URL`: Connection string for Prisma to connect to PostgreSQL
- `DIRECT_URL`: Direct connection to PostgreSQL (bypassing connection pooling)

### 5. Set up the database with Prisma

Run Prisma migrations to set up your database schema:

```bash
yarn prisma:generate
yarn prisma migrate dev
```

This command will:

- Create the database if it doesn't exist
- Apply all pending migrations
- Generate the Prisma client

### 6. Enable Realtime for Database Tables

For the application's realtime features to work properly, you need to enable Supabase Realtime publications for specific tables:

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Database** → **Replication** → **Publications**
4. Create a new publication or edit the existing `supabase_realtime` publication
5. Enable the following tables for realtime updates:
   - `document`
   - `documentactivity`
   - `revision`
   - `revisionactivity`

Without enabling these publications, the realtime collaboration features of the application will not work. For more information, see the [Supabase Realtime documentation](https://supabase.com/docs/guides/realtime?queryGroups=language&language=js#realtime-api).

### 7. Generate Supabase types

```bash
yarn supabase:generate
```

### 8. Run the development server

```bash
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build the application for production
- `yarn start` - Start the production server
- `yarn lint` - Run ESLint
- `yarn prisma:generate` - Generate Prisma client
- `yarn supabase:generate` - Generate Supabase TypeScript types

## Database Management

### Prisma Commands

- `npx prisma migrate dev` - Apply pending migrations and update the database schema
- `npx prisma db push` - Push the Prisma schema state to the database
- `npx prisma studio` - Open Prisma Studio to view and edit your data
- `npx prisma generate` - Generate Prisma client

### Supabase Local Development

- `supabase start` - Start the local Supabase stack
- `supabase stop` - Stop the local Supabase stack
- `supabase status` - Check the status of local Supabase services and get credentials
- `supabase db reset` - Reset the local database

---

## Regulatory Compliance Document Processor

A FastAPI application for analyzing Standard Operating Procedure (SOP) documents against regulatory requirements using AI.

### Tech Stack

- **FastAPI** - Web framework for building APIs
- **Langchain** - Framework for LLM applications
- **ChromaDB** - Vector database for document storage
- **Claude AI** - LLM for document analysis
- **uv** - Python package installer and resolver

### Prerequisites

- Python 3.10+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (Python package manager)
- Claude API key

### Installing uv

uv is a fast Python package installer and resolver. You can install it using one of the following methods:

#### macOS and Linux

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### Windows

```bash
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

#### Using pipx

```bash
pipx install uv
```

For more installation options and detailed instructions, visit the [uv installation documentation](https://docs.astral.sh/uv/getting-started/installation/).

### Local Setup

1. Navigate to the regulation task directory:

```bash
cd regulation_task
```

2. Create a virtual environment and install dependencies using uv:

```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e .
```

3. Set up environment variables:

Create a `.env` file in the regulation_task directory with your Claude API key:

```
CLAUDE_API_KEY=your_api_key_here
```

4. Run the application:

For the API server:

```bash
python run.py
```

For the CLI mode:

```bash
python run.py --cli
```

The API server will be available at http://localhost:8000/docs and webui will be available at http://localhost:8000/

### Features

- Upload and analyze SOP documents against regulatory requirements
- Generate detailed compliance reports
- Command-line interface for batch processing
- Web interface for document management

### Available Commands

- `python run.py` - Start the API server
- `python run.py --cli` - Run in CLI mode for batch processing
- `uv pip install -e ".[dev]"` - Install development dependencies

### Development

Install development dependencies:

```bash
uv pip install -e ".[dev]"
```

Format code:

```bash
black .
isort .
```

Run type checking:

```bash
mypy .
```

Run tests:

```bash
pytest
```
