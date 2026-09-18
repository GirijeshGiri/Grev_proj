# Grievance Scribe — Backend AI Intelligence Engine & API

Production-ready Python FastAPI backend for **Grievance Scribe (AI-Powered Citizen Request Navigator)**.

Grievance Scribe transforms plain, everyday citizen problems into structured, validated **RTI Applications** and **Formal Grievance Petitions**, resolves verified official Indian government submission portals, and tracks filing lifecycles.

---

## 1. Core Architecture & Philosophy

The backend acts as an **intelligence and preparation layer** between citizens and official government portals.

```
Citizen Problem in Natural Language
               │
               ▼
┌────────────────────────────────────────┐
│  AI Intelligence & Validation Pipeline │
│  1. Intent Analysis                    │
│  2. Classification: RTI / GRV / MIXED   │
│  3. Fact Extraction (Zero-Fabrication) │
│  4. Missing Information Detection      │
│  5. Unsupported Speculation Audit      │
│  6. Draft Generation & Quality Scoring │
└────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ Official Channel Recommendation Engine │
│ CPGRAMS / RTI Online / Municipal Ward  │
└────────────────────────────────────────┘
               │
               ▼
 Citizen Reviews, Copies & Submits Themselves
               │
               ▼
┌────────────────────────────────────────┐
│ SQLite / SQLAlchemy Request Tracker    │
│ Docket No • Status • Next Steps        │
└────────────────────────────────────────┘
```

### Key Principles:
1. **Zero Fact Fabrication**: If a street name, date, amount, or previous complaint number is not provided, the system marks it as `"Not provided"`. It **never** invents details.
2. **Citizen in Control**: The platform never automatically submits to any government portal. The citizen reviews, edits, and submits to the official portal themselves.
3. **Provider Abstraction**: Supports Google Gemini API (`AI_API_KEY`) and seamlessly falls back to a deterministic rule-based intelligence engine for 100% demo reliability.

---

## 2. Directory Structure

```text
backend/
│
├── main.py                     # FastAPI application entry point, middleware & lifespan
├── config.py                   # Pydantic BaseSettings environment configuration
├── database.py                 # SQLAlchemy SQLite/PostgreSQL engine, sessions & init_db
├── models.py                   # SQLAlchemy RequestModel for persistence
├── schemas.py                  # Strongly-typed Pydantic validation & response schemas
├── requirements.txt            # Python dependencies
├── .env.example                # Sample environment variables
├── test_cases.py               # Automated verification suite for the 3 demo scenarios
│
├── routes/
│   ├── analyze.py              # POST /api/analyze, POST /api/validate, POST /api/regenerate
│   ├── requests.py             # CRUD: /api/requests (Save, list, fetch, update, delete)
│   ├── channels.py             # GET /api/channels (Verified official portal directory)
│   └── health.py               # GET /health
│
├── services/
│   ├── ai_service.py           # LLM Provider abstraction (Gemini + Deterministic fallback)
│   ├── validator.py            # Draft quality scoring, fact integrity & speculation checks
│   ├── request_service.py      # Database CRUD layer & next-action guidance logic
│   └── channel_service.py      # Government portal directory & jurisdiction resolution
│
├── prompts/
│   └── grievance_analysis.txt  # System prompt enforcing Section 6(1) RTI & non-fabrication
│
└── utils/
    └── json_parser.py          # Resilient markdown fence & JSON parser
```

---

## 3. Quickstart & Installation

### Step 1: Clone and navigate to backend
```bash
cd backend
```

### Step 2: Create a virtual environment
```bash
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
```

### Step 3: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure environment variables
```bash
cp .env.example .env
```
*(Optional: Add your `AI_API_KEY` for Gemini. If left empty, the built-in deterministic engine operates automatically with zero configuration).*

### Step 5: Run the development server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **Alternative ReDoc UI**: `http://localhost:8000/redoc`

---

## 4. Running the Demo Test Cases

Run the automated verification suite demonstrating all 3 core scenarios:

```bash
python test_cases.py
```

This runs:
1. **Section 33 Demo (MIXED)**: Broken road near ABC School + allocated funds/contractor inquiry. Splits into dual Grievance & Section 6(1) RTI application.
2. **Section 34 Demo (GRIEVANCE)**: Garbage uncollected for two weeks. Produces corrective-action petition without unwanted RTI queries.
3. **Section 35 Demo (RTI)**: Community hall construction funds & work order. Produces precise factual records inquiries.

---

## 5. API Endpoints & Curl Usage Examples

### 1. Health Check
```bash
curl -X GET http://localhost:8000/health
```

### 2. Analyze Citizen Problem (`POST /api/analyze`)
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "The road near ABC School has been damaged for six months. I complained earlier but it has still not been repaired. I also want to know how much money was allocated for this road repair and which contractor received the work.",
    "location": "Near ABC School",
    "date": "six months"
  }'
```

### 3. Validate Request Draft (`POST /api/validate`)
```bash
curl -X POST http://localhost:8000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "problem": "The road near ABC School has been damaged for six months.",
    "request_type": "GRIEVANCE",
    "location": "Near ABC School"
  }'
```

### 4. Regenerate a Specific Section (`POST /api/regenerate`)
```bash
curl -X POST http://localhost:8000/api/regenerate \
  -H "Content-Type: application/json" \
  -d '{
    "section": "rti_questions",
    "instruction": "Make the questions strictly focus on certified measurement book entries and tender sanction orders.",
    "problem": "The road near ABC School is damaged. I want to know about fund allocations."
  }'
```

### 5. List Official Government Portals (`GET /api/channels`)
```bash
curl -X GET http://localhost:8000/api/channels
```

### 6. Save Request to Tracker (`POST /api/requests`)
```bash
curl -X POST http://localhost:8000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Damaged Road near ABC School",
    "request_type": "MIXED",
    "problem": "The road near ABC School has been damaged for six months.",
    "location": "Near ABC School",
    "reference_number": "GRV-2026-09842",
    "status": "UNDER_PROCESS"
  }'
```

### 7. List Saved Requests (`GET /api/requests`)
```bash
# Filter by type or status
curl -X GET "http://localhost:8000/api/requests?type=MIXED&status=UNDER_PROCESS"
```

### 8. Update Saved Request (`PUT /api/requests/{id}`)
```bash
curl -X PUT http://localhost:8000/api/requests/{request_id} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACTION_TAKEN",
    "notes": "Ward engineer completed site inspection on 18th Sept. Asphalt patching scheduled."
  }'
```

---

## 6. Official Government Channel Directory

The backend maintains verified Indian government portals:
* **CPGRAMS (`CENTRAL_GOVERNMENT_GRIEVANCE`)**: https://pgportal.gov.in
* **RTI Online Central (`CENTRAL_RTI`)**: https://rtionline.gov.in
* **Urban Local Civic Body / Ward PWD (`LOCAL_AUTHORITY`)**: Municipal Corporation & Ward offices
* **State CM Helpline (`STATE_GOVERNMENT_GRIEVANCE`)**: Unified state grievance portals
* **State RTI (`STATE_RTI_INFORMATION`)**: State Public Information Officers
* **National Consumer Helpline (`OTHER_OFFICIAL_CHANNEL`)**: https://consumerhelpline.gov.in

---

## 7. Database Migration (SQLite to PostgreSQL)

To switch from the default SQLite file to PostgreSQL:
1. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/grievance_scribe
   ```
2. Install the postgres driver:
   ```bash
   pip install psycopg2-binary
   ```
3. Restart `uvicorn main:app`. SQLAlchemy will auto-create all tables on startup.
