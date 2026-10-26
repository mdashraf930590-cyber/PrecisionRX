# 06. DevOps, Containers, Infrastructure & HIPAA Compliance

This document covers the infrastructure automation, container orchestration, reverse proxy configuration, distributed task processing, and regulatory compliance mechanisms implemented across **PrecisionRx AI**.

---

## 1. Infrastructure & DevOps Stack Overview

| Component | Technology & Version | Configuration File | Role / Responsibility |
|---|---|---|---|
| **Container Engine** | Docker & Docker Compose v3.9 | `docker-compose.yml`, `docker/` | Microservice containerization and isolated networks |
| **Edge Gateway** | Nginx (Alpine) | `docker/nginx/nginx.conf` | SSL/TLS termination, reverse proxying, and rate limiting |
| **Task Queue** | Celery 5.4 + Kombu 5.3 | `backend/app/core/celery_app.py` | Asynchronous distributed background workers |
| **Message Broker** | RabbitMQ 3 Management | `docker-compose.yml` (`rabbitmq`) | Durable AMQP message queuing |
| **Build Automation** | GNU Make | `Makefile` | CLI commands for training, migrations, testing, and deployment |
| **Regulatory Security** | HIPAA HITECH §164 | `backend/app/core/security.py` | AES-256 GCM encryption, RBAC, immutable audit logging |
| **Observability** | OpenTelemetry & Prometheus | `backend/requirements.txt` | Distributed request tracing, metrics scraping, latency monitoring |

---

## 2. Docker & Multi-Container Architecture

```
                                  INTERNET / CLINIC LAN
                                            │
                                            ▼
                                ┌───────────────────────┐
                                │   NGINX REVERSE PROXY │
                                │   Port 80 / 443 (TLS) │
                                └───────────┬───────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │                                             │
                     ▼                                             ▼
          ┌─────────────────────┐                       ┌─────────────────────┐
          │  FRONTEND (NEXT.JS) │                       │  BACKEND (FASTAPI)  │
          │      Port 3000      │                       │      Port 8000      │
          └─────────────────────┘                       └──────────┬──────────┘
                                                                   │
                     ┌─────────────────────────────────────────────┼──────────────────────────────┐
                     │                                             │                              │
                     ▼                                             ▼                              ▼
          ┌─────────────────────┐                       ┌─────────────────────┐        ┌─────────────────────┐
          │    POSTGRESQL 15    │                       │      RABBITMQ 3     │        │       REDIS 7       │
          │      Port 5432      │                       │      Port 5672      │        │      Port 6379      │
          └─────────────────────┘                       └──────────┬──────────┘        └─────────────────────┘
                                                                   │
                                                                   ▼
                                                        ┌─────────────────────┐
                                                        │    CELERY WORKER    │
                                                        │  ml_jobs / default  │
                                                        └─────────────────────┘
```

### 2.1 The 8 Containerized Services
1. `frontend`: Next.js 16 production server serving the responsive Sky Blue UI.
2. `api`: FastAPI ASGI server running Uvicorn with auto-reloading and OpenAPI docs.
3. `ml_worker`: Dedicated Celery worker process isolated from web threads for genomic sequencing and ML inference.
4. `postgres`: PostgreSQL 15 database storing relational EHR, users, and audit trails.
5. `mongo`: MongoDB 7 storing unstructured wearable sensor streams and raw VCF genomic payloads.
6. `redis`: Redis 7 in-memory key-value cache, token blacklist, and rate limiter.
7. `rabbitmq`: RabbitMQ 3 AMQP message broker with management UI at `:15672`.
8. `nginx`: Reverse proxy and TLS terminator routing traffic between client, API, and static assets.

---

## 3. Reverse Proxy & Edge Security (Nginx)

- **File**: `docker/nginx/nginx.conf`.
- **Core Security Controls Implemented**:
  1. **Strict Transport Security (HSTS)**: Forces all client connections over encrypted HTTPS.
  2. **Clickjacking Defense**: Injects `X-Frame-Options: DENY` and `Content-Security-Policy: frame-ancestors 'none'`.
  3. **MIME Sniffing Prevention**: Enforces `X-Content-Type-Options: nosniff`.
  4. **Rate Limiting**: Limits requests to 20 req/sec per IP address on authentication and clinical endpoints to prevent brute-force credential stuffing.

---

## 4. Background Task Processing (Celery & RabbitMQ)

- **Configuration**: `backend/app/core/celery_app.py`.
- **Concurrency**: 4 parallel worker processes per worker node.
- **Queue Segmentation**:
  - `ml_jobs`: High-memory queue allocated for PyVCF3 parsing, SHAP tree explainability generation, and model retraining.
  - `default`: Low-latency queue allocated for clinician email alerts and EHR webhook synchronizations.
- **Fault Tolerance**: Automatic task retries with exponential backoff (`autoretry_for=(Exception,)`, `max_retries=3`, `default_retry_delay=5`).

---

## 5. Regulatory Compliance & HIPAA Security Rule (45 CFR Part 164)

In healthcare technology, security is a legal prerequisite. PrecisionRx AI implements all mandatory technical safeguards:

### 5.1 Access Control (§ 164.312(a))
- **Role-Based Access Control (RBAC)**: Enforces strict separation of privileges:
  - `Physician / Doctor`: Can view assigned patients, review AI recommendations, approve/override prescriptions.
  - `Medical Geneticist`: Can upload VCF files, modify diplotype star-allele mappings, inspect variant frequency curves.
  - `Clinical Pharmacist`: Can review medication interactions, perform therapeutic drug monitoring (TDM).
  - `Admin`: Can inspect system audit logs, configure FHIR EHR integration endpoints.
- **Unique User Identification**: Every clinician account requires an authorized National Provider Identifier (NPI) or enterprise medical email.

### 5.2 Transmission Security (§ 164.312(e))
- All communication between browser, Nginx, and backend microservices is encrypted using **TLS 1.3** with AES-GCM cipher suites.

### 5.3 Encryption at Rest (§ 164.312(a)(2)(iv))
- Protected Health Information (PHI) stored in database columns is cryptographically enveloped using **AES-256 GCM**:
  ```python
  # backend/app/core/security.py
  from cryptography.hazmat.primitives.ciphers.aead import AESGCM
  
  aesgcm = AESGCM(settings.ENCRYPTION_KEY)
  ciphertext = aesgcm.encrypt(nonce, raw_phi_bytes, associated_data)
  ```

### 5.4 Audit Controls (§ 164.312(b))
- Every interaction with patient data writes an immutable record to the `audit_logs` table:
  - Timestamp (UTC ISO 8601)
  - Clinician ID & Full Name
  - Action Category (`AI_RECOMMEND_APPROVE`, `VCF_UPLOAD_PARSE`, `PATIENT_RECORD_READ`)
  - Resource Identifier
  - Source IP Address & User Agent

---

## 6. Developer CLI Automation (Makefile)

The repository provides automated workflows via the root [Makefile](file:///Users/mdashraf9431/PrecisionRX-AI/Makefile):

| Command | Action |
|---|---|
| `make train` | Executes `train_all.py` on real ClinPGx data; trains Models A, B, and C; exports `.joblib` artifacts. |
| `make test` | Executes the complete Pytest backend test suite (`pytest backend/tests -v`). |
| `make docker-up` | Launches the entire 8-service microservice stack via Docker Compose. |
| `make docker-down` | Gracefully shuts down all containers and persists data volumes. |
| `make lint` | Validates code formatting across backend and frontend codebases. |
