# 03. Backend & API Technologies Architecture

This document details the backend application stack, asynchronous runtime environment, REST API routing, data validation pipelines, and security mechanisms powering **PrecisionRx AI**.

---

## 1. Backend Technology Stack Overview

| Technology | Version | Location in Codebase | Role / Responsibility |
|---|---|---|---|
| **FastAPI** | `0.111.0` | `backend/app/main.py`, `backend/app/api/` | Asynchronous web framework & REST API gateway |
| **Uvicorn** | `0.29.0` | `backend/` command entrypoint | High-performance ASGI web server implementing `uvloop` |
| **Python** | `3.11+` | Entire backend runtime | Modern language features (type annotations, exception groups) |
| **Pydantic** | `2.7.1` | `backend/app/schemas/`, `backend/app/core/config.py` | Runtime data validation, DTOs, and environment settings |
| **SQLAlchemy** | `2.0.30` | `backend/app/models/db_models.py`, `database.py` | Asynchronous Object Relational Mapper (ORM) |
| **AsyncPG** | `0.29.0` | Database connection string driver | High-speed C-based asynchronous PostgreSQL driver |
| **Alembic** | `1.13.1` | `backend/alembic/` | Database schema migrations and version control |
| **Python-JOSE** | `3.3.0` | `backend/app/core/security.py` | JSON Web Token (JWT) encoding, decoding, and cryptographic signing |
| **Passlib (Bcrypt)** | `1.7.4` | `backend/app/core/security.py` | Irreversible salted password hashing |
| **Cryptography** | `42.0.7` | `backend/app/core/security.py` | AES-256 GCM encryption-at-rest for PHI (HIPAA §164) |
| **HTTPX** | `0.27.0` | `backend/app/services/` | Asynchronous HTTP client for outbound FHIR & data lake queries |

---

## 2. Deep Dive: Why & Where Each Technology is Used

### 2.1 FastAPI 0.111 & Uvicorn (ASGI)
- **Where It Is Used**:
  - `backend/app/main.py`: Entrypoint initializing CORS middleware, exception handlers, and API routers.
  - `backend/app/api/v1/endpoints/`:
    - `auth.py`: Authentication, NPI credential verification, JWT issuance.
    - `patients.py`: Patient demographic CRUD, EHR FHIR hydration.
    - `clinical.py`: Real-time prescription validation, drug-drug-gene triage.
    - `ai_recommendations.py`: Model inference triggering, SHAP computation, physician approval endpoints.
    - `analytics.py`: Population pharmacogenomics metrics, ADR reduction rates.
- **Why It Was Chosen Over Django / Flask / Express.js**:
  1. **Native Asynchronous Concurrency**: Built on Python's `asyncio` and `uvloop`, FastAPI handles thousands of concurrent requests per second on a single worker without thread contention.
  2. **Automatic Interactive OpenAPI (Swagger) Documentation**: Automatically generates standard documentation at `http://localhost:8000/api/docs`, allowing clinical developers to test API contracts interactively.
  3. **Direct Machine Learning Integration**: Unlike Node.js or Go, Python is the native environment for scientific ML models (XGBoost, CatBoost, PyTorch). Running the API in Python eliminates inter-process serialization overhead.

---

### 2.2 Pydantic v2 (Validation & Settings Management)
- **Where It Is Used**:
  - `backend/app/schemas/`: Data Transfer Objects (DTOs) for incoming requests and outgoing responses.
  - `backend/app/core/config.py`: Type-safe environment variable parsing (`Settings` class).
- **Why It Was Chosen**:
  1. **Rust Core Performance**: Pydantic v2 is rewritten in Rust, validating data structures up to **20x faster** than Pydantic v1.
  2. **Strict Medical Typing**: Ensures that invalid clinical data (e.g., negative dosages, malformed ICD-10 codes, or out-of-range eGFR numbers) are rejected at the edge before touching the database or ML models:
     ```python
     class PrescriptionCreate(BaseModel):
         patient_id: UUID
         medication_name: str
         dose_mg: float = Field(gt=0, le=5000, description="Dose in mg must be positive and within safe limits")
         frequency: str = Field(pattern="^(QD|BID|TID|QID|PRN)$")
         route: str = "oral"
     ```

---

### 2.3 SQLAlchemy 2.0 (Async) & AsyncPG
- **Where It Is Used**:
  - `backend/app/core/database.py`: Asynchronous session engine (`create_async_engine`) and session generator (`get_db`).
  - `backend/app/models/db_models.py`: Declarative ORM models mapped with modern `Mapped[...]` type hints.
- **Why It Was Chosen**:
  1. **Non-Blocking I/O**: Traditional synchronous ORMs block the entire Python process while waiting for PostgreSQL query execution. With `asyncpg`, other requests proceed concurrently during heavy queries.
  2. **ACID Transactional Guarantees**: Guarantees that updating a prescription, logging an ADR flag, and generating an audit trail happen within an atomic transaction. If any step fails, the entire transaction rolls back.

---

### 2.4 Alembic (Database Schema Migrations)
- **Where It Is Used**:
  - `backend/alembic/env.py` and `backend/alembic/versions/`.
- **Why It Was Chosen**:
  - Clinical databases cannot be dropped or recreated. Alembic provides deterministic, reversible database version control, tracking schema revisions across testing, staging, and production environments.

---

### 2.5 Security, JWT & HIPAA Encryption (Passlib, Python-JOSE, Cryptography)
- **Where It Is Used**:
  - `backend/app/core/security.py`:
    - `create_access_token()`: Signs HS256 JWT tokens containing `sub` (User ID), `role`, and expiration.
    - `verify_password()` & `get_password_hash()`: Uses Bcrypt with a work factor of 12.
    - `encrypt_phi()` & `decrypt_phi()`: Uses **AES-256 GCM** with a dynamic 96-bit initialization vector (IV) and authentication tag.
- **Why It Was Chosen**:
  - Meets the strict requirements of **HIPAA Security Rule 45 CFR § 164.312(a)(2)(iv)** for encryption of electronic protected health information (ePHI) both in transit and at rest.

---

## 3. API Directory & Module Architecture

```
backend/app/
├── api/
│   └── v1/
│       ├── api.py                    # Root router combining all endpoint groups
│       └── endpoints/
│           ├── auth.py               # Sign-in, NPI validation, session tokens
│           ├── clinical.py           # Prescription verification, drug-gene interactions
│           ├── patients.py           # Patient CRUD, EHR demographics, cohort filters
│           ├── ai_recommendations.py # ML inference triggers, approval workflows
│           └── analytics.py          # Population metrics, ADR rates, guideline compliance
├── core/
│   ├── config.py                     # Pydantic Settings reading .env variables
│   ├── database.py                   # Async engine, sessionmaker, base declarative class
│   ├── security.py                   # JWT tokens, Bcrypt hashing, AES-256 GCM encryption
│   └── celery_app.py                 # Celery app initialization and task definitions
├── models/
│   └── db_models.py                  # SQLAlchemy models (User, Patient, Prescription, GenomicProfile, AuditLog)
├── schemas/
│   └── ...                           # Pydantic request/response schemas
├── services/
│   ├── audit_service.py              # Immutable HIPAA audit logger
│   ├── clinical_service.py           # EHR logic, lab analysis
│   ├── genomics_service.py           # CPIC Level 1A rule evaluation, star-allele translation
│   ├── ml_service.py                 # ML model loading, inference routing, dosage tuning
│   └── wearable_service.py           # MongoDB time-series wearable ingestion
└── main.py                           # Application initialization, middleware, routes
```
