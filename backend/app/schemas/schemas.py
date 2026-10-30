"""Pydantic schemas for request/response validation."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional, List

from pydantic import BaseModel, EmailStr, Field, field_validator


# ─── Common ───────────────────────────────────────────────────────────────────
class PaginatedResponse(BaseModel):
    items: list[Any]
    total: int
    page: int
    page_size: int
    pages: int


# ─── Auth Schemas ─────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2, max_length=255)
    role: str = Field(default="viewer", pattern="^(admin|doctor|nurse|viewer)$")
    npi_number: Optional[str] = None
    department: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    npi_number: Optional[str]
    department: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Patient Schemas ──────────────────────────────────────────────────────────
class PatientCreate(BaseModel):
    mrn: str = Field(min_length=1, max_length=50)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    date_of_birth: datetime
    sex: str = Field(pattern="^(M|F|Other)$")
    blood_type: Optional[str] = None
    ethnicity: Optional[str] = None
    weight_kg: Optional[float] = Field(None, gt=0, lt=500)
    height_cm: Optional[float] = Field(None, gt=0, lt=300)
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[dict] = None
    insurance: Optional[dict] = None
    emergency_contact: Optional[dict] = None
    primary_physician_id: Optional[str] = None


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[dict] = None
    insurance: Optional[dict] = None


class PatientOut(BaseModel):
    id: str
    mrn: str
    first_name: str
    last_name: str
    date_of_birth: datetime
    sex: str
    blood_type: Optional[str]
    ethnicity: Optional[str]
    weight_kg: Optional[float]
    height_cm: Optional[float]
    risk_score: Optional[float]
    adherence_score: Optional[float]
    primary_physician_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Genomics Schemas ─────────────────────────────────────────────────────────
class GenomicProfileOut(BaseModel):
    id: str
    patient_id: str
    raw_vcf_path: Optional[str]
    parsed_snps: Optional[dict]
    metabolizer_statuses: Optional[dict]
    hla_alleles: Optional[dict]
    pgx_risk_flags: Optional[dict]
    processed_at: Optional[datetime]
    pipeline_version: Optional[str]

    model_config = {"from_attributes": True}


class PharmacogenomicsOut(BaseModel):
    patient_id: str
    cyp2d6_status: Optional[str]
    cyp2c19_status: Optional[str]
    cyp3a4_status: Optional[str]
    cyp2c9_status: Optional[str]
    slco1b1_variant: Optional[str]
    drug_predictions: dict[str, Any]  # drug → predicted response
    risk_alleles: list[str]


# ─── Lab Schemas ──────────────────────────────────────────────────────────────
class LabResultCreate(BaseModel):
    loinc_code: str
    display_name: str
    value: float
    unit: str
    reference_range_low: Optional[float] = None
    reference_range_high: Optional[float] = None
    interpretation: Optional[str] = None
    collected_at: datetime
    lab_name: Optional[str] = None


class LabResultOut(BaseModel):
    id: str
    patient_id: str
    loinc_code: str
    display_name: str
    value: float
    unit: str
    reference_range_low: Optional[float]
    reference_range_high: Optional[float]
    interpretation: Optional[str]
    is_abnormal: bool
    collected_at: datetime

    model_config = {"from_attributes": True}


# ─── Medication Schemas ───────────────────────────────────────────────────────
class MedicationCreate(BaseModel):
    drug_name: str
    generic_name: Optional[str] = None
    rxnorm_code: Optional[str] = None
    dose_mg: float = Field(gt=0)
    dose_unit: str = "mg"
    frequency: str
    route: Optional[str] = None
    drug_class: Optional[str] = None
    indication: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None


class MedicationOut(BaseModel):
    id: str
    patient_id: str
    drug_name: str
    generic_name: Optional[str]
    rxnorm_code: Optional[str]
    dose_mg: float
    dose_unit: str
    frequency: str
    route: Optional[str]
    drug_class: Optional[str]
    is_active: bool
    start_date: datetime
    end_date: Optional[datetime]
    adherence_score: Optional[float]

    model_config = {"from_attributes": True}


class DrugInteractionCheck(BaseModel):
    drug_names: list[str] = Field(min_length=2, max_length=20)
    patient_id: Optional[str] = None  # if provided, also checks patient's current meds


class DrugInteractionOut(BaseModel):
    interactions: list[dict]  # [{drug_a, drug_b, severity, description, mechanism}]
    total_found: int
    has_critical: bool


# ─── AI / Recommendation Schemas ─────────────────────────────────────────────
class RecommendationTrigger(BaseModel):
    force_refresh: bool = False
    include_alternatives: bool = True
    target_condition: Optional[str] = None  # ICD-10 code for specific condition


class RecommendationOut(BaseModel):
    id: str
    patient_id: str
    model_version: str
    recommended_drug: str
    dose_mg: float
    dose_unit: str
    frequency: str
    confidence_score: float
    adr_probability: Optional[float]
    adr_severity: Optional[str]
    risk_flags: Optional[dict]
    natural_language_explanation: Optional[str]
    alternative_drugs: Optional[dict]
    status: str
    reviewed_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class SHAPExplanation(BaseModel):
    recommendation_id: str
    top_features: list[dict]  # [{feature, value, shap_value, direction}]
    waterfall_data: list[dict]
    base_value: float
    prediction_value: float
    natural_language: str


class DoctorAction(BaseModel):
    notes: Optional[str] = None
    modified_drug: Optional[str] = None  # if modifying recommendation
    modified_dose: Optional[float] = None


# ─── Analytics Schemas ────────────────────────────────────────────────────────
class PopulationStats(BaseModel):
    total_patients: int
    high_risk_count: int
    avg_adherence: float
    pending_reviews: int
    approved_today: int
    outcome_improvement_pct: float


class OutcomeTrends(BaseModel):
    period: str
    data: list[dict]  # [{date, improved, stable, worsened}]


class RiskDistribution(BaseModel):
    low_risk: int
    medium_risk: int
    high_risk: int
    critical_risk: int
    distribution_data: list[dict]


# ─── Wearable Schemas ─────────────────────────────────────────────────────────
class WearableReadingCreate(BaseModel):
    device_type: str
    metric_type: str
    value: float
    unit: Optional[str] = None
    recorded_at: datetime


class WearableReadingOut(BaseModel):
    id: str
    patient_id: str
    device_type: str
    metric_type: str
    value: float
    unit: Optional[str]
    is_anomaly: bool
    z_score: Optional[float]
    recorded_at: datetime

    model_config = {"from_attributes": True}
