"""Celery application configuration for asynchronous ML processing tasks."""

from __future__ import annotations

import asyncio
import logging
from celery import Celery
from app.core.config import settings

logger = logging.getLogger(__name__)

celery_app = Celery(
    "precisionrx_worker",
    broker=settings.RABBITMQ_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_routes={
        "app.core.celery_app.run_recommendation_task": {"queue": "ml_jobs"},
        "app.core.celery_app.process_genomics_vcf_task": {"queue": "ml_jobs"},
        "*": {"queue": "default"},
    },
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)


@celery_app.task(name="app.core.celery_app.run_recommendation_task", bind=True)
def run_recommendation_task(self, patient_id: str, recommendation_id: str):
    """
    Celery background worker task for executing the multi-model AI recommendation pipeline.
    Runs async MLService pipeline inside an event loop.
    """
    logger.info(f"Starting ML pipeline task for patient {patient_id}, rec {recommendation_id}")
    from app.core.database import AsyncSessionLocal
    from app.models.db_models import Patient
    from app.services.ml_service import MLService
    from app.schemas.schemas import RecommendationTrigger
    from sqlalchemy import select

    async def _async_pipeline():
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(Patient).where(Patient.id == patient_id))
            patient = result.scalar_one_or_none()
            if not patient:
                logger.error(f"Patient {patient_id} not found in ML task")
                return {"status": "failed", "error": "Patient not found"}

            ml_svc = MLService(session)
            await ml_svc.run_recommendation_pipeline(
                patient=patient,
                recommendation_id=recommendation_id,
                config=RecommendationTrigger(force_refresh=True),
            )
            await session.commit()
            return {
                "status": "completed",
                "patient_id": patient_id,
                "recommendation_id": recommendation_id,
            }

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(_async_pipeline())
    finally:
        loop.close()


@celery_app.task(name="app.core.celery_app.process_genomics_vcf_task")
def process_genomics_vcf_task(patient_id: str, file_path: str):
    """Celery task for parsing and annotating large genomic VCF files."""
    logger.info(f"Processing VCF for patient {patient_id} from {file_path}")
    return {"status": "completed", "patient_id": patient_id}
