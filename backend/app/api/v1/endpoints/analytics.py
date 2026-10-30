"""Analytics endpoints — population stats, outcomes, risk distribution."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_permission
from app.models.db_models import AIRecommendation, Patient, User
from app.schemas.schemas import OutcomeTrends, PopulationStats, RiskDistribution

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/population", response_model=PopulationStats)
async def population_stats(
    current_user: User = Depends(require_permission("analytics:read")),
    db: AsyncSession = Depends(get_db),
):
    """Get high-level population statistics for the dashboard."""
    total = await db.scalar(select(func.count(Patient.id)).where(Patient.is_deleted == False))
    high_risk = await db.scalar(
        select(func.count(Patient.id)).where(Patient.risk_score > 0.7, Patient.is_deleted == False)
    )
    avg_adherence_result = await db.scalar(select(func.avg(Patient.adherence_score)).where(Patient.is_deleted == False))
    avg_adherence = float(avg_adherence_result or 0.0)
    pending = await db.scalar(select(func.count(AIRecommendation.id)).where(AIRecommendation.status == "pending"))
    from datetime import datetime, timezone, timedelta

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    approved_today = await db.scalar(
        select(func.count(AIRecommendation.id)).where(
            AIRecommendation.status == "approved",
            AIRecommendation.reviewed_at >= today_start,
        )
    )

    return PopulationStats(
        total_patients=total or 0,
        high_risk_count=high_risk or 0,
        avg_adherence=round(avg_adherence * 100, 1),
        pending_reviews=pending or 0,
        approved_today=approved_today or 0,
        outcome_improvement_pct=73.4,  # Would come from outcomes model in production
    )


@router.get("/outcomes", response_model=OutcomeTrends)
async def outcome_trends(
    period: str = "6m",
    current_user: User = Depends(require_permission("analytics:read")),
    db: AsyncSession = Depends(get_db),
):
    """Get treatment outcome trends over time (mock data for demo)."""
    # In production: query approved recommendations + follow-up outcomes
    import random
    from datetime import datetime, timedelta

    data = []
    for i in range(24):
        d = datetime.now() - timedelta(weeks=24 - i)
        data.append(
            {
                "date": d.strftime("%Y-%m-%d"),
                "improved": random.randint(60, 85),
                "stable": random.randint(10, 25),
                "worsened": random.randint(3, 12),
            }
        )
    return OutcomeTrends(period=period, data=data)


@router.get("/risk-distribution", response_model=RiskDistribution)
async def risk_distribution(
    current_user: User = Depends(require_permission("analytics:read")),
    db: AsyncSession = Depends(get_db),
):
    """Get patient risk distribution breakdown."""
    low = await db.scalar(select(func.count(Patient.id)).where(Patient.risk_score < 0.3, Patient.is_deleted == False))
    med = await db.scalar(
        select(func.count(Patient.id)).where(Patient.risk_score.between(0.3, 0.5), Patient.is_deleted == False)
    )
    high = await db.scalar(
        select(func.count(Patient.id)).where(Patient.risk_score.between(0.5, 0.75), Patient.is_deleted == False)
    )
    critical = await db.scalar(
        select(func.count(Patient.id)).where(Patient.risk_score > 0.75, Patient.is_deleted == False)
    )

    return RiskDistribution(
        low_risk=low or 0,
        medium_risk=med or 0,
        high_risk=high or 0,
        critical_risk=critical or 0,
        distribution_data=[
            {"level": "Low", "count": low or 0, "color": "#10B981"},
            {"level": "Medium", "count": med or 0, "color": "#F59E0B"},
            {"level": "High", "count": high or 0, "color": "#F97316"},
            {"level": "Critical", "count": critical or 0, "color": "#F43F5E"},
        ],
    )
