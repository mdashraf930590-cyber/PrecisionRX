"""SQLAlchemy ORM models for PostgreSQL."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


# ─── Users ────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="viewer")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    npi_number: Mapped[str | None] = mapped_column(String(20))  # National Provider Identifier
    department: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    recommendations: Mapped[list["AIRecommendation"]] = relationship(back_populates="doctor")
    audit_logs: Mapped[list["AuditLog"]] = relationship(back_populates="user")


# ─── Patients ─────────────────────────────────────────────────────────────────
class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    mrn: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    date_of_birth: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    sex: Mapped[str] = mapped_column(String(10), nullable=False)  # M/F/Other
    blood_type: Mapped[str | None] = mapped_column(String(5))
    ethnicity: Mapped[str | None] = mapped_column(String(50))
    weight_kg: Mapped[float | None] = mapped_column(Float)
    height_cm: Mapped[float | None] = mapped_column(Float)
    phone: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(255))
    address: Mapped[dict | None] = mapped_column(JSONB)
    insurance: Mapped[dict | None] = mapped_column(JSONB)
    emergency_contact: Mapped[dict | None] = mapped_column(JSONB)
    primary_physician_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    risk_score: Mapped[float | None] = mapped_column(Float, default=0.0)
    adherence_score: Mapped[float | None] = mapped_column(Float, default=0.0)
    fhir_resource_id: Mapped[str | None] = mapped_column(String(100))
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    genomic_profile: Mapped["GenomicProfile | None"] = relationship(back_populates="patient", uselist=False)
    lab_results: Mapped[list["LabResult"]] = relationship(back_populates="patient")
    medications: Mapped[list["Medication"]] = relationship(back_populates="patient")
    recommendations: Mapped[list["AIRecommendation"]] = relationship(back_populates="patient")
    wearable_readings: Mapped[list["WearableReading"]] = relationship(back_populates="patient")


# ─── Genomics ─────────────────────────────────────────────────────────────────
class GenomicProfile(Base):
    __tablename__ = "genomic_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), unique=True, nullable=False)
    raw_vcf_path: Mapped[str | None] = mapped_column(String(500))
    parsed_snps: Mapped[dict | None] = mapped_column(JSONB)  # SNP variant data
    metabolizer_statuses: Mapped[dict | None] = mapped_column(JSONB)  # CYP enzyme statuses
    hla_alleles: Mapped[dict | None] = mapped_column(JSONB)
    pgx_risk_flags: Mapped[dict | None] = mapped_column(JSONB)  # pharmacogenomic risk
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    pipeline_version: Mapped[str | None] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient: Mapped["Patient"] = relationship(back_populates="genomic_profile")


# ─── Lab Results ──────────────────────────────────────────────────────────────
class LabResult(Base):
    __tablename__ = "lab_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    loinc_code: Mapped[str] = mapped_column(String(20), nullable=False)
    display_name: Mapped[str] = mapped_column(String(200), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(50))
    reference_range_low: Mapped[float | None] = mapped_column(Float)
    reference_range_high: Mapped[float | None] = mapped_column(Float)
    interpretation: Mapped[str | None] = mapped_column(String(20))  # L/N/H/LL/HH
    is_abnormal: Mapped[bool] = mapped_column(Boolean, default=False)
    ordering_provider_id: Mapped[str | None] = mapped_column(String(36))
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resulted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    lab_name: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient: Mapped["Patient"] = relationship(back_populates="lab_results")


# ─── Medications ──────────────────────────────────────────────────────────────
class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    drug_name: Mapped[str] = mapped_column(String(200), nullable=False)
    generic_name: Mapped[str | None] = mapped_column(String(200))
    rxnorm_code: Mapped[str | None] = mapped_column(String(20))
    ndc_code: Mapped[str | None] = mapped_column(String(20))
    dose_mg: Mapped[float] = mapped_column(Float, nullable=False)
    dose_unit: Mapped[str] = mapped_column(String(20), default="mg")
    frequency: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g., "BID", "QD"
    route: Mapped[str | None] = mapped_column(String(50))  # PO/IV/SQ
    drug_class: Mapped[str | None] = mapped_column(String(100))
    indication: Mapped[str | None] = mapped_column(String(200))
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    prescriber_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    adherence_score: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient: Mapped["Patient"] = relationship(back_populates="medications")


# ─── AI Recommendations ───────────────────────────────────────────────────────
class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    recommended_drug: Mapped[str] = mapped_column(String(200), nullable=False)
    generic_name: Mapped[str | None] = mapped_column(String(200))
    dose_mg: Mapped[float] = mapped_column(Float, nullable=False)
    dose_unit: Mapped[str] = mapped_column(String(20), default="mg")
    frequency: Mapped[str] = mapped_column(String(100))
    titration_schedule: Mapped[dict | None] = mapped_column(JSONB)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0.0–1.0
    adr_probability: Mapped[float | None] = mapped_column(Float)
    adr_severity: Mapped[str | None] = mapped_column(String(20))  # Mild/Moderate/Severe
    risk_flags: Mapped[dict | None] = mapped_column(JSONB)
    shap_values: Mapped[dict | None] = mapped_column(JSONB)
    feature_importance: Mapped[dict | None] = mapped_column(JSONB)
    natural_language_explanation: Mapped[str | None] = mapped_column(Text)
    alternative_drugs: Mapped[dict | None] = mapped_column(JSONB)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending/approved/rejected/modified
    doctor_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    doctor_notes: Mapped[str | None] = mapped_column(Text)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient: Mapped["Patient"] = relationship(back_populates="recommendations")
    doctor: Mapped["User | None"] = relationship(back_populates="recommendations")


# ─── Wearable Readings ────────────────────────────────────────────────────────
class WearableReading(Base):
    __tablename__ = "wearable_readings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    device_type: Mapped[str] = mapped_column(String(100))  # Apple Watch, Fitbit, etc.
    metric_type: Mapped[str] = mapped_column(String(50))  # heart_rate, spo2, steps, sleep
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str | None] = mapped_column(String(20))
    is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False)
    z_score: Mapped[float | None] = mapped_column(Float)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    patient: Mapped["Patient"] = relationship(back_populates="wearable_readings")


# ─── Audit Logs ───────────────────────────────────────────────────────────────
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(100), nullable=False)  # CREATE/READ/UPDATE/DELETE
    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(36))
    changes: Mapped[dict | None] = mapped_column(JSONB)
    ip_address: Mapped[str | None] = mapped_column(String(45))
    user_agent: Mapped[str | None] = mapped_column(String(500))
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    error_message: Mapped[str | None] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User | None"] = relationship(back_populates="audit_logs")
