"""AI recommendation and SHAP explanation endpoints."""
from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_permission
from app.models.db_models import AIRecommendation, Patient, User
from app.schemas.schemas import (
    DoctorAction, RecommendationOut, RecommendationTrigger, SHAPExplanation,
)
from app.services.audit_service import AuditService
from app.services.ml_service import MLService

router = APIRouter(prefix="/ai", tags=["AI / ML Engine"])


@router.post("/recommend/{patient_id}", response_model=RecommendationOut, status_code=status.HTTP_202_ACCEPTED)
async def trigger_recommendation(
    patient_id: str,
    payload: RecommendationTrigger,
    background_tasks: BackgroundTasks,
    request: Request,
    current_user: User = Depends(require_permission("ai:recommend")),
    db: AsyncSession = Depends(get_db),
):
    """
    Trigger the AI recommendation pipeline for a patient.
    The pipeline runs asynchronously via Celery; returns the queued recommendation stub.
    """
    patient = await _get_patient_or_404(db, patient_id)
    ml_svc = MLService(db)

    # Create a pending recommendation record immediately
    recommendation = await ml_svc.create_pending_recommendation(patient)

    # Kick off the full ML pipeline asynchronously
    background_tasks.add_task(ml_svc.run_recommendation_pipeline, patient, recommendation.id, payload)

    await AuditService(db).log(
        user_id=current_user.id,
        action="AI_RECOMMEND_TRIGGER",
        resource_type="AIRecommendation",
        resource_id=recommendation.id,
        ip_address=request.client.host if request.client else None,
    )
    return recommendation


@router.get("/recommend/{patient_id}", response_model=RecommendationOut)
async def get_recommendation(
    patient_id: str,
    current_user: User = Depends(require_permission("patient:read")),
    db: AsyncSession = Depends(get_db),
):
    """Get the latest AI recommendation for a patient."""
    result = await db.execute(
        select(AIRecommendation)
        .where(AIRecommendation.patient_id == patient_id)
        .order_by(AIRecommendation.created_at.desc())
        .limit(1)
    )
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="No recommendations found for this patient")
    return rec


@router.post("/recommend/{patient_id}/approve", response_model=RecommendationOut)
async def approve_recommendation(
    patient_id: str,
    payload: DoctorAction,
    request: Request,
    current_user: User = Depends(require_permission("ai:approve")),
    db: AsyncSession = Depends(get_db),
):
    """Doctor approves the latest AI recommendation."""
    rec = await _get_latest_pending(db, patient_id)
    return await _update_status(db, rec, "approved", current_user, payload, request)


@router.post("/recommend/{patient_id}/reject", response_model=RecommendationOut)
async def reject_recommendation(
    patient_id: str,
    payload: DoctorAction,
    request: Request,
    current_user: User = Depends(require_permission("ai:reject")),
    db: AsyncSession = Depends(get_db),
):
    """Doctor rejects the latest AI recommendation."""
    rec = await _get_latest_pending(db, patient_id)
    return await _update_status(db, rec, "rejected", current_user, payload, request)


@router.get("/explain/{recommendation_id}", response_model=SHAPExplanation)
async def get_explanation(
    recommendation_id: str,
    current_user: User = Depends(require_permission("patient:read")),
    db: AsyncSession = Depends(get_db),
):
    """Get SHAP-based explainability for a specific recommendation."""
    result = await db.execute(
        select(AIRecommendation).where(AIRecommendation.id == recommendation_id)
    )
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    if not rec.shap_values or not rec.feature_importance:
        raise HTTPException(status_code=404, detail="Explainability data not yet computed")

    return SHAPExplanation(
        recommendation_id=rec.id,
        top_features=rec.feature_importance.get("top_features", []),
        waterfall_data=rec.shap_values.get("waterfall", []),
        base_value=rec.shap_values.get("base_value", 0.0),
        prediction_value=rec.confidence_score,
        natural_language=rec.natural_language_explanation or "Explanation not available.",
    )


# ─── Helpers ──────────────────────────────────────────────────────────────────
async def _get_patient_or_404(db: AsyncSession, patient_id: str) -> Patient:
    result = await db.execute(
        select(Patient).where(Patient.id == patient_id, Patient.is_deleted == False)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


async def _get_latest_pending(db: AsyncSession, patient_id: str) -> AIRecommendation:
    result = await db.execute(
        select(AIRecommendation)
        .where(
            AIRecommendation.patient_id == patient_id,
            AIRecommendation.status == "pending",
        )
        .order_by(AIRecommendation.created_at.desc())
        .limit(1)
    )
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="No pending recommendation found")
    return rec


async def _update_status(
    db: AsyncSession,
    rec: AIRecommendation,
    new_status: str,
    user: User,
    payload: DoctorAction,
    request: Request,
) -> AIRecommendation:
    from datetime import datetime, timezone
    rec.status = new_status
    rec.doctor_id = user.id
    rec.doctor_notes = payload.notes
    rec.reviewed_at = datetime.now(timezone.utc)
    if payload.modified_drug:
        rec.recommended_drug = payload.modified_drug
        rec.status = "modified"
    if payload.modified_dose:
        rec.dose_mg = payload.modified_dose

    await AuditService(db).log(
        user_id=user.id,
        action=f"AI_RECOMMEND_{new_status.upper()}",
        resource_type="AIRecommendation",
        resource_id=rec.id,
        ip_address=request.client.host if request.client else None,
    )
    return rec
