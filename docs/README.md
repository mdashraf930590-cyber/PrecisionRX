# PrecisionRx AI — Comprehensive Technology & Architecture Documentation

> **Clinical Decision Support System (CDSS) for Precision Medicine & Pharmacogenomics**  
> *Compliant with HIPAA Security Rule (45 CFR Part 164), CPIC Level 1A Guidelines, and HL7 FHIR R4 Standards.*

---

## 1. Documentation Index

This directory provides an exhaustive, component-by-component breakdown of every technology, library, framework, database, and machine learning algorithm implemented within the **PrecisionRx AI** platform. It details **WHAT** each technology is, **WHERE** it is situated in the repository, and **WHY** it was chosen over competing industry alternatives.

| Document | Focus Area | Key Technologies Covered |
|---|---|---|
| [**01. Architecture Overview**](./01_ARCHITECTURE_OVERVIEW.md) | End-to-End System Design | Multi-tier topology, request lifecycle, data flow, asynchronous pipelines |
| [**02. Frontend Technologies**](./02_FRONTEND_TECHNOLOGIES.md) | User Interface & Experience | Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Zustand, Recharts, Lucide |
| [**03. Backend & API Technologies**](./03_BACKEND_AND_API_TECHNOLOGIES.md) | High-Performance Services | FastAPI, Uvicorn, Python 3.11+, Pydantic v2, SQLAlchemy 2.0 (Async), HTTPX |
| [**04. Database & Storage Strategy**](./04_DATABASE_AND_STORAGE_TECHNOLOGIES.md) | Polyglot Persistence | PostgreSQL 15, MongoDB 7, Redis 7, RabbitMQ 3, Alembic |
| [**05. Machine Learning & Genomics**](./05_MACHINE_LEARNING_AND_GENOMICS.md) | Decision Intelligence Core | ClinPGx / PharmGKB, XGBoost, LightGBM, CatBoost, PyTorch Bi-LSTM, SHAP, Flower (FL) |
| [**06. DevOps, Security & Compliance**](./06_DEVOPS_CONTAINERS_AND_SECURITY.md) | Infrastructure & Safety | Docker Compose, Nginx, Celery Workers, HIPAA §164 AES-256 GCM, OpenTelemetry |

---

## 2. High-Level Technology Inventory

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PRECISIONRX AI ECOSYSTEM                                  │
└────────────────────────────────────────────────────────────────────────────────────────┘

 [CLIENT TIER]
  ├── Next.js 16 (App Router + Turbopack) ─────── SSR & Client-Side Navigation
  ├── React 19 & TypeScript 5 ────────────────── Strict Type Safety for Clinical Schemas
  ├── Tailwind CSS v4 ────────────────────────── High-Contrast Solid Sky/White Theme
  ├── Recharts 2.15 ──────────────────────────── Longitudinal Charts & SHAP Visualizations
  └── Zustand 5 ──────────────────────────────── Lightweight Authenticated Session Store

 [GATEWAY & REVERSE PROXY]
  └── Nginx (Alpine) ─────────────────────────── SSL Termination, Routing & Rate-Limiting

 [APPLICATION / API TIER]
  ├── FastAPI 0.111 (Python 3.11+) ──────────── Asynchronous Microframework & OpenAPI Docs
  ├── Pydantic v2 ────────────────────────────── Strict Runtime Schema & DTO Validation
  ├── SQLAlchemy 2.0 (AsyncPG) ───────────────── Async Relational ORM & Connection Pooling
  └── Python-JOSE + Passlib ──────────────────── JWT Stateless Tokens & Bcrypt Hashing

 [MESSAGE BROKER & ASYNC WORKERS]
  ├── RabbitMQ 3 (AMQP) ──────────────────────── Durable Distributed Job Queue
  ├── Celery 5.4 ─────────────────────────────── Background VCF Ingestion & Batch Risk Jobs
  └── Redis 7 ────────────────────────────────── Sub-millisecond Caching & Celery Result Store

 [POLYGLOT PERSISTENCE TIER]
  ├── PostgreSQL 15 ──────────────────────────── ACID Relational EHR, Prescriptions & Audits
  └── MongoDB 7 (Motor) ──────────────────────── High-Throughput Time-Series Wearables & VCFs

 [INTELLIGENCE & PHARMACOGENOMICS TIER]
  ├── ClinPGx / PharmGKB Curated Assets ──────── 5,193 Variants, 240 Drug Labels, 222 CPIC
  ├── Model A: XGBoost ───────────────────────── Multi-Label Drug Recommendation
  ├── Model B: LightGBM ──────────────────────── Adverse Drug Reaction (ADR) Toxicity Classifier
  ├── Model C: CatBoost ──────────────────────── Continuous Titration Dosage Optimizer
  ├── Model D: PyTorch Bi-LSTM ───────────────── 90-Day Patient Adherence & Wearable Forecaster
  ├── SHAP 0.45 ──────────────────────────────── TreeExplainer for FDA Explainable AI (XAI)
  └── Flower (flwr 1.8) ──────────────────────── Federated Learning across Hospital Nodes
```

---

## 3. Technology Matrix: Where & Why at a Glance

| Technology | Repository Location | Core Role | Why It Is Used in PrecisionRx AI |
|---|---|---|---|
| **Next.js 16** | `frontend/` | Application Shell & Pages | Hybrid SSR/CSR, zero-waterfall Turbopack compilation, file-system routing. |
| **FastAPI** | `backend/app/` | Core REST API Gateway | High concurrency with Python `asyncio`, automatic interactive Swagger docs, type safety. |
| **PostgreSQL 15** | `backend/alembic/`, `docker-compose.yml` | Primary EHR Relational Store | Strict ACID compliance for patient records, foreign keys, and immutable HIPAA audit logs. |
| **MongoDB 7** | `backend/app/services/wearable_service.py` | Time-Series & Unstructured Data | Schema-flexible JSON document storage for high-frequency wearable sensor readings (HR, SpO2). |
| **Redis 7** | `backend/app/core/celery_app.py` | Cache & Fast State Store | Sub-millisecond token blacklisting, rate-limit counting, and Celery task result caching. |
| **RabbitMQ 3** | `docker-compose.yml` | Distributed AMQP Broker | Guaranteed message delivery, backpressure protection, and asynchronous Celery worker isolation. |
| **Celery 5.4** | `backend/app/core/celery_app.py` | Background Task Engine | Offloads heavy VCF genomic parsing and ML retraining away from web HTTP request threads. |
| **ClinPGx Dataset** | `ml/data/` | Ground Truth PGx Knowledge | Real-world clinical annotations (5,193 variant pairs, 240 labels, 222 CPIC guidelines). |
| **XGBoost 2.0** | `ml/models/saved/recommender_xgboost.joblib` | Multi-Label Recommender | High performance on structured tabular genomic biomarkers; handles missing clinical values. |
| **LightGBM 4.3** | `ml/models/saved/adr_predictor.joblib` | ADR Toxicity Classifier | Histogram-based gradient boosting; ultra-fast inference for real-time prescription risk flagging. |
| **CatBoost 1.2** | `ml/models/saved/dosage_optimizer.joblib` | Continuous Titration Regressor | Native handling of categorical metabolizer diplotypes (`*4/*4`, `*1/*2`) without target leakage. |
| **PyTorch 2.3** | `ml/models/core_models.py` | Deep Sequence Modeling | Bi-Directional LSTM Attention network processing 90-day multi-channel physiological telemetry. |
| **SHAP 0.45** | `ml/explainability/shap_explainer.py` | Explainable AI (XAI) | Generates exact Shapley values to explain to physicians *why* an AI recommendation was made. |
| **Flower (flwr)** | `ml/federated/fl_server.py` | Federated Learning Node | Allows multiple hospital networks to collaboratively train models without transmitting patient PHI. |
| **Zustand 5** | `frontend/src/store/authStore.ts` | Frontend State Store | Minimalist, zero-boilerplate client state for clinical role management and session tokens. |
| **Recharts 2.15** | `frontend/src/app/` | Data Visualizations | React-native SVG rendering for longitudinal biometric trends, SHAP bars, and risk dials. |
| **Nginx** | `docker/nginx/nginx.conf` | Edge Gateway | Secure SSL/TLS termination, reverse proxying, client header sanitization, and asset caching. |
| **Docker Compose** | `docker-compose.yml` | Multi-Service Orchestrator | Single-command local and production deployment across 8 interconnected microservices. |

---

*For detailed technical explorations of any subsystem, proceed to the corresponding numbered guide in this directory.*
