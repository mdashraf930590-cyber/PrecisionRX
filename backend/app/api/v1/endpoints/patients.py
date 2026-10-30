"""Patient CRUD API endpoints."""

from __future__ import annotations

import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_permission
from app.models.db_models import Patient, User
from app.schemas.schemas import (
    PaginatedResponse,
    PatientCreate,
    PatientOut,
    PatientUpdate,
)
from app.services.audit_service import AuditService

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("", response_model=PaginatedResponse)
async def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by name or MRN"),
    risk_level: Optional[str] = Query(None, pattern="^(low|medium|high)$"),
    current_user: User = Depends(require_permission("patient:read")),
    db: AsyncSession = Depends(get_db),
):
    """List all patients with pagination and optional search/filter."""
    query = select(Patient).where(Patient.is_deleted == False)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Patient.first_name.ilike(search_term))
            | (Patient.last_name.ilike(search_term))
            | (Patient.mrn.ilike(search_term))
        )

    if risk_level == "low":
        query = query.where(Patient.risk_score < 0.3)
    elif risk_level == "medium":
        query = query.where(Patient.risk_score.between(0.3, 0.7))
    elif risk_level == "high":
        query = query.where(Patient.risk_score > 0.7)

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar_one()

    query = query.offset((page - 1) * page_size).limit(page_size).order_by(Patient.created_at.desc())
    result = await db.execute(query)
    patients = result.scalars().all()

    return PaginatedResponse(
        items=[PatientOut.model_validate(p) for p in patients],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size),
    )


@router.post("", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
async def create_patient(
    payload: PatientCreate,
    request: Request,
    current_user: User = Depends(require_permission("patient:write")),
    db: AsyncSession = Depends(get_db),
):
    """Create a new patient record."""
    result = await db.execute(select(Patient).where(Patient.mrn == payload.mrn))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Patient with MRN {payload.mrn} already exists")

    patient = Patient(**payload.model_dump())
    db.add(patient)
    await db.flush()

    await AuditService(db).log(
        user_id=current_user.id,
        action="CREATE",
        resource_type="Patient",
        resource_id=patient.id,
        ip_address=request.client.host if request.client else None,
    )
    return patient


@router.get("/{patient_id}", response_model=PatientOut)
async def get_patient(
    patient_id: str,
    request: Request,
    current_user: User = Depends(require_permission("patient:read")),
    db: AsyncSession = Depends(get_db),
):
    """Get full patient profile by ID."""
    patient = await _get_or_404(db, patient_id)
    await AuditService(db).log(
        user_id=current_user.id,
        action="READ",
        resource_type="Patient",
        resource_id=patient_id,
        ip_address=request.client.host if request.client else None,
    )
    return patient


@router.put("/{patient_id}", response_model=PatientOut)
async def update_patient(
    patient_id: str,
    payload: PatientUpdate,
    request: Request,
    current_user: User = Depends(require_permission("patient:write")),
    db: AsyncSession = Depends(get_db),
):
    """Update patient demographics."""
    patient = await _get_or_404(db, patient_id)
    update_data = payload.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    await AuditService(db).log(
        user_id=current_user.id,
        action="UPDATE",
        resource_type="Patient",
        resource_id=patient_id,
        changes=update_data,
        ip_address=request.client.host if request.client else None,
    )
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: str,
    request: Request,
    current_user: User = Depends(require_permission("patient:write")),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a patient record (HIPAA-compliant, preserves audit trail)."""
    patient = await _get_or_404(db, patient_id)
    patient.is_deleted = True

    await AuditService(db).log(
        user_id=current_user.id,
        action="DELETE",
        resource_type="Patient",
        resource_id=patient_id,
        ip_address=request.client.host if request.client else None,
    )
    return None


# ─── Helper ───────────────────────────────────────────────────────────────────
async def _get_or_404(db: AsyncSession, patient_id: str) -> Patient:
    result = await db.execute(select(Patient).where(Patient.id == patient_id, Patient.is_deleted == False))
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
