# 04. Polyglot Persistence & Database Strategy

This document explains the multi-database storage architecture implemented in **PrecisionRx AI**. It details why a polyglot persistence design was chosen, where each database engine resides, and how data consistency and integrity are maintained across heterogeneous stores.

---

## 1. Storage Engines Overview

| Database / Store | Engine Version | Primary Role in PrecisionRx AI | Data Model |
|---|---|---|---|
| **PostgreSQL** | `15-alpine` | Relational EHR, Prescriptions, Users, HIPAA Audits | Strict Relational (ACID, Foreign Keys) |
| **MongoDB** | `7.0` | Wearable Telemetry, Continuous Sensors, Raw VCFs | JSON / BSON Document & Time-Series |
| **Redis** | `7-alpine` | Token Blacklist, Cache, Rate Limits, Task Results | In-Memory Key-Value & Data Structures |
| **RabbitMQ** | `3-management-alpine` | Asynchronous Task Broker & Job Queue | AMQP 0-9-1 Message Queuing |

---

## 2. Why a Polyglot Persistence Strategy?

A common anti-pattern in health-tech architectures is attempting to force all clinical data into a single database:
- **Relational systems (PostgreSQL)** struggle when ingesting thousands of high-frequency wearable sensor readings per second (e.g., continuous photoplethysmography [PPG] heart rate signals from Apple Watches) because schema migrations and table locks become bottlenecks.
- **Document systems (MongoDB)** lack the strict relational integrity and foreign-key constraints mandated by medical boards for prescription orders and patient identity deduplication.
- **In-memory stores (Redis)** provide sub-millisecond retrieval for session validation and rate limits, but RAM is too expensive for gigabytes of genomic variant data.

**PrecisionRx AI resolves this by separating concerns across four specialized storage tiers:**

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 INCOMING CLINICAL DATA                 │
                  └───────────────────────────┬────────────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         │                                    │                                    │
         ▼                                    ▼                                    ▼
┌──────────────────┐                ┌──────────────────┐                ┌──────────────────┐
│   POSTGRESQL 15  │                │    MONGODB 7     │                │     REDIS 7      │
│  Relational EHR  │                │   Time-Series    │                │  In-Memory Fast  │
├──────────────────┤                ├──────────────────┤                ├──────────────────┤
│ · Patients (MRN) │                │ · Heart Rate     │                │ · JWT Blacklist  │
│ · Prescriptions  │                │ · SpO2 Telemetry │                │ · Rate Limiting  │
│ · Core Variants  │                │ · Sleep Stages   │                │ · Active Roles   │
│ · HIPAA Audits   │                │ · Raw VCF Files  │                │ · Task Results   │
└──────────────────┘                └──────────────────┘                └──────────────────┘
```

---

## 3. Deep Dive into Individual Data Stores

### 3.1 PostgreSQL 15 (Relational Core)
- **Where It Is Defined**:
  - `docker-compose.yml`: Service `postgres`.
  - `docker/postgres/init.sql`: Initialization scripts and database seeding.
  - `backend/app/models/db_models.py`: SQLAlchemy declarative entities.
- **Key Tables & Schemas**:
  1. `users`: Clinician credentials, hashed passwords, NPI numbers, assigned roles (`doctor`, `geneticist`, `pharmacist`, `admin`).
  2. `patients`: Medical Record Number (MRN, unique constraint), age, biological sex, primary diagnoses, eGFR, baseline HbA1c.
  3. `prescriptions`: Drug name, dose in mg, frequency, prescribed by (FK to `users`), verification status, ADR risk score.
  4. `genomic_profiles`: Standardized diplotypes (`CYP2D6 *4/*4`, `CYP2C19 *2/*2`), activity scores, metabolizer phenotype.
  5. `audit_logs`: Immutable security records tracking action type, resource ID, clinician IP, and timestamp.
- **Why It Was Chosen**:
  - **ACID Compliance**: Prescriptions and medications require absolute consistency. An incomplete prescription write must never be committed.
  - **Foreign Key Constraints**: Guarantees that every prescription points to an existing patient and a verified clinician.

---

### 3.2 MongoDB 7 (Document & Time-Series Store)
- **Where It Is Defined**:
  - `docker-compose.yml`: Service `mongo`.
  - `backend/app/services/wearable_service.py`: Async document insertion and aggregation via `motor`.
- **Collections & Data Structures**:
  1. `wearable_telemetry`:
     ```json
     {
       "patient_id": "p1",
       "timestamp": "2026-10-26T14:32:00Z",
       "device": "AppleWatch_Series9",
       "metrics": {
         "heart_rate_bpm": 74.2,
         "hrv_sdnn_ms": 42.1,
         "spo2_percent": 98.0,
         "steps_delta": 142,
         "active_glucose_mgdl": 142.5
       }
     }
     ```
  2. `vcf_payloads`: Stores parsed variant dictionaries with variable attributes, annotations, and quality scores from Whole-Genome/Whole-Exome sequencing.
- **Why It Was Chosen**:
  - **Dynamic Schema**: Wearable manufacturers frequently alter sensor firmware and metrics. MongoDB accommodates new fields without costly database migrations.
  - **High Write Throughput**: Uses optimized WiredTiger storage engine for concurrent sensor writes.

---

### 3.3 Redis 7 (In-Memory Fast Store)
- **Where It Is Defined**:
  - `docker-compose.yml`: Service `redis`.
  - `backend/app/core/celery_app.py` and `backend/app/core/security.py`.
- **Usage Patterns**:
  1. **Token Blacklist**: When a clinician clicks "Sign Out", the token's unique identifier (`jti`) is written to Redis with a Time-To-Live (TTL) matching the token's expiration. Verification occurs in `<1ms`.
  2. **Rate Limiting**: Protects clinical endpoints against credential stuffing and DoS attacks using sliding-window counters.
  3. **Celery Backend**: Stores task execution status (`PENDING`, `SUCCESS`, `FAILURE`) and return values.
- **Why It Was Chosen**:
  - Microsecond latency; in-memory data structures (`SET`, `EXPIRE`, `INCR`) eliminate database query bottlenecks during authentication verification.

---

### 3.4 RabbitMQ 3 (AMQP Distributed Message Broker)
- **Where It Is Defined**:
  - `docker-compose.yml`: Service `rabbitmq`.
  - Ports: `5672` (AMQP protocol) and `15672` (Management Dashboard).
- **Queues Configured**:
  1. `ml_jobs`: Dedicated queue for heavy VCF variant parsing, SHAP tree explainability runs, and federated learning round aggregations.
  2. `default`: Queue for lightweight background tasks (sending physician email alerts, HL7 FHIR sync pushes).
- **Why It Was Chosen Over Redis Streams / Kafka**:
  - **Message Durability & Acknowledgement**: Healthcare workloads cannot tolerate message loss. RabbitMQ persists messages to disk and guarantees `ack`/`nack` handling so failed jobs are re-queued rather than dropped.
  - **Lightweight Resource Footprint**: Far simpler to operate and maintain locally and in hospital on-prem clusters compared to Apache Kafka.
