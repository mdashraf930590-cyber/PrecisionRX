"""Genomics, Labs, Medications, and Wearables endpoints."""
from __future__ import annotations

from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_permission
from app.models.db_models import GenomicProfile, LabResult, Medication, Patient, User, WearableReading
from app.schemas.schemas import (
    DrugInteractionCheck, DrugInteractionOut,
    GenomicProfileOut, LabResultCreate, LabResultOut,
    MedicationCreate, MedicationOut, PharmacogenomicsOut,
    WearableReadingCreate, WearableReadingOut,
)
from app.services.genomics_service import GenomicsService
from app.services.audit_service import AuditService

# ─── Genomics Router ─────────────────────────────────────────────────────────
genomics_router = APIRouter(tags=["Genomics"])

@genomics_router.post("/patients/{patient_id}/genomics", status_code=status.HTTP_202_ACCEPTED)
async def upload_genomic_file(
    patient_id: str,
    vcf_file: UploadFile = File(..., description="VCF file with genomic variants"),
    current_user: User = Depends(require_permission("genomics:write")),
    db: AsyncSession = Depends(get_db),
):
    """Upload a VCF file and trigger genomic parsing pipeline."""
    patient = await _patient_or_404(db, patient_id)
    svc = GenomicsService(db)
    task_id = await svc.process_vcf(patient, vcf_file)
    return {"message": "VCF processing queued", "task_id": task_id, "patient_id": patient_id}


@genomics_router.get("/patients/{patient_id}/genomics", response_model=GenomicProfileOut)
async def get_genomic_profile(
    patient_id: str,
    current_user: User = Depends(require_permission("genomics:read")),
    db: AsyncSession = Depends(get_db),
):
    """Get parsed genomic profile for a patient."""
    result = await db.execute(
        select(GenomicProfile).where(GenomicProfile.patient_id == patient_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Genomic profile not found")
    return profile


@genomics_router.get("/patients/{patient_id}/pharmacogenomics", response_model=PharmacogenomicsOut)
async def get_pharmacogenomics(
    patient_id: str,
    current_user: User = Depends(require_permission("genomics:read")),
    db: AsyncSession = Depends(get_db),
):
    """Get drug metabolism predictions from genomic profile."""
    result = await db.execute(
        select(GenomicProfile).where(GenomicProfile.patient_id == patient_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Genomic profile not found")

    statuses = profile.metabolizer_statuses or {}
    drug_predictions = GenomicsService(db).get_drug_predictions(statuses)

    return PharmacogenomicsOut(
        patient_id=patient_id,
        cyp2d6_status=statuses.get("CYP2D6"),
        cyp2c19_status=statuses.get("CYP2C19"),
        cyp3a4_status=statuses.get("CYP3A4"),
        cyp2c9_status=statuses.get("CYP2C9"),
        slco1b1_variant=statuses.get("SLCO1B1"),
        drug_predictions=drug_predictions,
        risk_alleles=profile.pgx_risk_flags.get("risk_alleles", []) if profile.pgx_risk_flags else [],
    )


# ─── Labs Router ─────────────────────────────────────────────────────────────
labs_router = APIRouter(tags=["Lab Results"])

@labs_router.post("/patients/{patient_id}/labs", response_model=LabResultOut, status_code=201)
async def add_lab_result(
    patient_id: str,
    payload: LabResultCreate,
    request: Request,
    current_user: User = Depends(require_permission("labs:write")),
    db: AsyncSession = Depends(get_db),
):
    """Add a new lab result for a patient."""
    await _patient_or_404(db, patient_id)
    is_abnormal = False
    if payload.reference_range_low and payload.value < payload.reference_range_low:
        is_abnormal = True
    if payload.reference_range_high and payload.value > payload.reference_range_high:
        is_abnormal = True

    lab = LabResult(
        patient_id=patient_id,
        is_abnormal=is_abnormal,
        **payload.model_dump(),
    )
    db.add(lab)
    await db.flush()
    await AuditService(db).log(
        user_id=current_user.id, action="CREATE", resource_type="LabResult",
        resource_id=lab.id, ip_address=request.client.host if request.client else None,
    )
    return lab


@labs_router.get("/patients/{patient_id}/labs", response_model=List[LabResultOut])
async def get_lab_results(
    patient_id: str,
    loinc_code: Optional[str] = Query(None),
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
    current_user: User = Depends(require_permission("labs:read")),
    db: AsyncSession = Depends(get_db),
):
    """Get all lab results for a patient (time-series), optionally filtered."""
    query = select(LabResult).where(LabResult.patient_id == patient_id)
    if loinc_code:
        query = query.where(LabResult.loinc_code == loinc_code)
    if from_date:
        query = query.where(LabResult.collected_at >= from_date)
    if to_date:
        query = query.where(LabResult.collected_at <= to_date)
    query = query.order_by(LabResult.collected_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


# ─── Medications Router ───────────────────────────────────────────────────────
medications_router = APIRouter(tags=["Medications"])

@medications_router.get("/patients/{patient_id}/medications", response_model=List[MedicationOut])
async def get_medications(
    patient_id: str,
    active_only: bool = Query(True),
    current_user: User = Depends(require_permission("medications:read")),
    db: AsyncSession = Depends(get_db),
):
    """Get medication list for a patient."""
    query = select(Medication).where(Medication.patient_id == patient_id)
    if active_only:
        query = query.where(Medication.is_active == True)
    result = await db.execute(query.order_by(Medication.start_date.desc()))
    return result.scalars().all()


@medications_router.post("/patients/{patient_id}/medications", response_model=MedicationOut, status_code=201)
async def add_medication(
    patient_id: str,
    payload: MedicationCreate,
    request: Request,
    current_user: User = Depends(require_permission("medications:write")),
    db: AsyncSession = Depends(get_db),
):
    """Prescribe a new medication for a patient."""
    await _patient_or_404(db, patient_id)
    med = Medication(patient_id=patient_id, prescriber_id=current_user.id, **payload.model_dump())
    db.add(med)
    await db.flush()
    await AuditService(db).log(
        user_id=current_user.id, action="CREATE", resource_type="Medication",
        resource_id=med.id, ip_address=request.client.host if request.client else None,
    )
    return med


@medications_router.post("/medications/interactions", response_model=DrugInteractionOut)
async def check_interactions(
    payload: DrugInteractionCheck,
    current_user: User = Depends(require_permission("medications:read")),
    db: AsyncSession = Depends(get_db),
):
    """Check drug-drug interactions for a list of drugs."""
    from app.services.interaction_service import DrugInteractionService
    svc = DrugInteractionService()
    interactions = await svc.check(payload.drug_names, payload.patient_id, db)
    has_critical = any(i.get("severity") == "major" for i in interactions)
    return DrugInteractionOut(
        interactions=interactions,
        total_found=len(interactions),
        has_critical=has_critical,
    )


# ─── Wearables Router ─────────────────────────────────────────────────────────
wearables_router = APIRouter(tags=["Wearables"])

@wearables_router.post("/patients/{patient_id}/wearables", response_model=WearableReadingOut, status_code=201)
async def add_wearable_reading(
    patient_id: str,
    payload: WearableReadingCreate,
    current_user: User = Depends(require_permission("patient:write")),
    db: AsyncSession = Depends(get_db),
):
    """Ingest a wearable sensor reading."""
    from app.services.wearable_service import WearableService
    await _patient_or_404(db, patient_id)
    reading = await WearableService(db).ingest(patient_id, payload)
    return reading


@wearables_router.get("/patients/{patient_id}/wearables", response_model=List[WearableReadingOut])
async def get_wearable_readings(
    patient_id: str,
    metric_type: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_permission("patient:read")),
    db: AsyncSession = Depends(get_db),
):
    """Get wearable readings for the past N days."""
    from datetime import timezone
    cutoff = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0) 
    from datetime import timedelta
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    
    query = select(WearableReading).where(
        WearableReading.patient_id == patient_id,
        WearableReading.recorded_at >= cutoff,
    )
    if metric_type:
        query = query.where(WearableReading.metric_type == metric_type)
    result = await db.execute(query.order_by(WearableReading.recorded_at.asc()))
    return result.scalars().all()


# ─── Helper ───────────────────────────────────────────────────────────────────
async def _patient_or_404(db: AsyncSession, patient_id: str) -> Patient:
    result = await db.execute(
        select(Patient).where(Patient.id == patient_id, Patient.is_deleted == False)
    )
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return p
