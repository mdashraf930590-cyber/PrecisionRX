"""Wearable data ingestion and anomaly detection service."""
from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.db_models import WearableReading
from app.schemas.schemas import WearableReadingCreate


# Clinical baseline standard boundaries (metric_type -> (normal_mean, normal_std, min_cutoff, max_cutoff))
CLINICAL_BOUNDS = {
    "heart_rate": (72.0, 10.0, 45.0, 130.0),
    "spo2": (97.5, 1.2, 90.0, 100.0),
    "steps": (6000.0, 2500.0, 0.0, 30000.0),
    "sleep": (7.0, 1.2, 3.0, 12.0),
    "hrv": (45.0, 15.0, 15.0, 120.0),
}


class WearableService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def ingest(self, patient_id: str, payload: WearableReadingCreate) -> WearableReading:
        """
        Ingest a raw wearable reading, compute rolling z-score against patient's 14-day history,
        evaluate anomaly status, and save to database.
        """
        metric = payload.metric_type.lower()
        val = payload.value

        # Calculate z-score from patient's 14-day history
        cutoff = datetime.now(timezone.utc) - timedelta(days=14)
        result = await self.db.execute(
            select(WearableReading.value).where(
                WearableReading.patient_id == patient_id,
                WearableReading.metric_type == payload.metric_type,
                WearableReading.recorded_at >= cutoff,
            )
        )
        recent_values = [r[0] for r in result.all()]

        z_score: Optional[float] = None
        is_anomaly = False

        if len(recent_values) >= 5:
            mean = sum(recent_values) / len(recent_values)
            variance = sum((x - mean) ** 2 for x in recent_values) / (len(recent_values) - 1)
            std = math.sqrt(variance) if variance > 0 else 0.001
            z_score = round((val - mean) / std, 2)
            if abs(z_score) >= 2.5:
                is_anomaly = True
        else:
            # Fall back to population clinical bounds
            if metric in CLINICAL_BOUNDS:
                norm_mean, norm_std, min_cut, max_cut = CLINICAL_BOUNDS[metric]
                z_score = round((val - norm_mean) / norm_std, 2)
                if val < min_cut or val > max_cut or abs(z_score) >= 2.5:
                    is_anomaly = True

        reading = WearableReading(
            patient_id=patient_id,
            device_type=payload.device_type,
            metric_type=payload.metric_type,
            value=val,
            unit=payload.unit,
            is_anomaly=is_anomaly,
            z_score=z_score,
            recorded_at=payload.recorded_at,
        )
        self.db.add(reading)
        await self.db.flush()
        return reading
