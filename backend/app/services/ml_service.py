"""ML inference service — orchestrates the full recommendation pipeline."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.db_models import (
    AIRecommendation,
    GenomicProfile,
    LabResult,
    Medication,
    Patient,
    WearableReading,
)
from app.schemas.schemas import RecommendationTrigger


class MLService:
    """
    Orchestrates the multi-model AI recommendation pipeline.
    In production this fires Celery tasks; here we show the service contract.
    """

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create_pending_recommendation(self, patient: Patient) -> AIRecommendation:
        rec = AIRecommendation(
            patient_id=patient.id,
            model_version="v1.0.0",
            recommended_drug="Processing...",
            dose_mg=0.0,
            frequency="TBD",
            confidence_score=0.0,
            status="pending",
        )
        self.db.add(rec)
        await self.db.flush()
        return rec

    async def run_recommendation_pipeline(
        self,
        patient: Patient,
        recommendation_id: str,
        config: RecommendationTrigger,
    ) -> None:
        """
        Full ML pipeline — called as a background task or Celery job.
        Steps: feature extraction → model inference → SHAP → persist.
        """
        try:
            features = await self._extract_features(patient)
            result = self._run_inference(features)
            shap_data = self._compute_shap(features, result)
            explanation = self._generate_explanation(shap_data, result)
            await self._persist_result(recommendation_id, result, shap_data, explanation)
        except Exception as exc:
            await self._mark_failed(recommendation_id, str(exc))

    async def _extract_features(self, patient: Patient) -> dict[str, Any]:
        """Collect all feature groups for a patient."""
        # Genomics
        genomic_result = await self.db.execute(select(GenomicProfile).where(GenomicProfile.patient_id == patient.id))
        profile = genomic_result.scalar_one_or_none()

        # Labs (latest per LOINC)
        labs_result = await self.db.execute(
            select(LabResult).where(LabResult.patient_id == patient.id).order_by(LabResult.collected_at.desc())
        )
        labs = labs_result.scalars().all()

        # Medications
        meds_result = await self.db.execute(
            select(Medication).where(Medication.patient_id == patient.id, Medication.is_active == True)
        )
        meds = meds_result.scalars().all()

        # Wearables (last 7 days)
        from datetime import timedelta

        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        wears_result = await self.db.execute(
            select(WearableReading).where(
                WearableReading.patient_id == patient.id,
                WearableReading.recorded_at >= cutoff,
            )
        )
        wearables = wears_result.scalars().all()

        return {
            "patient": patient,
            "genomics": profile,
            "labs": labs,
            "medications": meds,
            "wearables": wearables,
        }

    def _run_inference(self, features: dict) -> dict[str, Any]:
        """
        Run all 3 core ML models (Drug Recommendation, ADR, Dosage).
        In production: loads XGBoost/LightGBM/CatBoost from MLflow registry.
        Returns structured recommendation.
        """
        # Placeholder — real models loaded from MLflow registry
        return {
            "recommended_drug": "Metformin",
            "generic_name": "Metformin HCl",
            "dose_mg": 500.0,
            "frequency": "BID",
            "confidence_score": 0.87,
            "adr_probability": 0.12,
            "adr_severity": "Mild",
            "risk_flags": {
                "renal_caution": True,
                "cyp2d6_poor_metabolizer": False,
                "drug_interaction": False,
            },
            "alternative_drugs": [
                {
                    "drug": "Glipizide",
                    "confidence": 0.71,
                    "reason": "CYP2C9 normal metabolizer",
                },
                {
                    "drug": "Sitagliptin",
                    "confidence": 0.65,
                    "reason": "Renal-safe alternative",
                },
            ],
        }

    def _compute_shap(self, features: dict, result: dict) -> dict[str, Any]:
        """Compute SHAP values for explainability."""
        # Placeholder — real SHAP TreeExplainer applied here
        return {
            "base_value": 0.42,
            "waterfall": [
                {
                    "feature": "CYP2D6_status=Poor",
                    "value": "Poor",
                    "shap": 0.18,
                    "direction": "positive",
                },
                {
                    "feature": "eGFR",
                    "value": 42.0,
                    "shap": 0.14,
                    "direction": "positive",
                },
                {
                    "feature": "HbA1c",
                    "value": 8.3,
                    "shap": 0.11,
                    "direction": "positive",
                },
                {
                    "feature": "concurrent_metformin",
                    "value": 1,
                    "shap": 0.09,
                    "direction": "positive",
                },
                {"feature": "age", "value": 58, "shap": -0.04, "direction": "negative"},
                {
                    "feature": "BMI",
                    "value": 32.1,
                    "shap": 0.07,
                    "direction": "positive",
                },
                {
                    "feature": "LDL",
                    "value": 145.0,
                    "shap": 0.03,
                    "direction": "positive",
                },
            ],
            "top_features": [
                {"rank": 1, "feature": "CYP2D6 Poor Metabolizer", "importance": 0.35},
                {"rank": 2, "feature": "eGFR (Renal Function)", "importance": 0.28},
                {"rank": 3, "feature": "HbA1c Level", "importance": 0.18},
                {"rank": 4, "feature": "Concurrent Metformin", "importance": 0.09},
                {"rank": 5, "feature": "BMI", "importance": 0.06},
            ],
        }

    def _generate_explanation(self, shap: dict, result: dict) -> str:
        top = shap["top_features"][:3]
        parts = [f"{f['feature']} (↑{int(f['importance']*100)}% weight)" for f in top]
        return (
            f"Recommendation of {result['recommended_drug']} {result['dose_mg']}mg {result['frequency']} "
            f"driven by: {', '.join(parts)}. "
            f"Confidence: {int(result['confidence_score']*100)}%. "
            f"ADR risk: {result['adr_severity']} ({int(result['adr_probability']*100)}%)."
        )

    async def _persist_result(
        self,
        recommendation_id: str,
        result: dict,
        shap: dict,
        explanation: str,
    ) -> None:
        res = await self.db.execute(select(AIRecommendation).where(AIRecommendation.id == recommendation_id))
        rec = res.scalar_one_or_none()
        if not rec:
            return
        rec.recommended_drug = result["recommended_drug"]
        rec.generic_name = result.get("generic_name")
        rec.dose_mg = result["dose_mg"]
        rec.frequency = result["frequency"]
        rec.confidence_score = result["confidence_score"]
        rec.adr_probability = result.get("adr_probability")
        rec.adr_severity = result.get("adr_severity")
        rec.risk_flags = result.get("risk_flags")
        rec.shap_values = shap
        rec.feature_importance = {"top_features": shap["top_features"]}
        rec.natural_language_explanation = explanation
        rec.alternative_drugs = {"alternatives": result.get("alternative_drugs", [])}
        rec.model_version = "v1.0.0"
        await self.db.flush()

    async def _mark_failed(self, recommendation_id: str, error: str) -> None:
        res = await self.db.execute(select(AIRecommendation).where(AIRecommendation.id == recommendation_id))
        rec = res.scalar_one_or_none()
        if rec:
            rec.status = "failed"
            rec.doctor_notes = f"Pipeline error: {error}"
            await self.db.flush()
