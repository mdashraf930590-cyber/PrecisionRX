"""FastAPI application factory — mounts all routers and middleware."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.patients import router as patients_router
from app.api.v1.endpoints.ai_recommendations import router as ai_router
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.clinical import (
    genomics_router, labs_router, medications_router, wearables_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all DB tables on startup (Alembic handles migrations in prod)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "PrecisionRx AI — Personalized Medicine Intelligence Platform. "
            "HIPAA-compliant clinical decision support powered by genomics + ML."
        ),
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        lifespan=lifespan,
    )

    # ── Middleware ──────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # ── Global exception handler ───────────────────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "type": type(exc).__name__},
        )

    # ── Routers ────────────────────────────────────────────────────────────
    prefix = "/api/v1"
    app.include_router(auth_router, prefix=prefix)
    app.include_router(patients_router, prefix=prefix)
    app.include_router(ai_router, prefix=prefix)
    app.include_router(analytics_router, prefix=prefix)
    app.include_router(genomics_router, prefix=prefix)
    app.include_router(labs_router, prefix=prefix)
    app.include_router(medications_router, prefix=prefix)
    app.include_router(wearables_router, prefix=prefix)

    @app.get("/health", tags=["Health"])
    async def health_check():
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        }

    return app


app = create_app()
