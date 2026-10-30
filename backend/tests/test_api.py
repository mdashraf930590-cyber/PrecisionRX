"""
API Integration Tests — FastAPI endpoints
==========================================
Uses httpx AsyncClient + pytest-asyncio for async endpoint testing.
Tests all major routes: auth, patients, AI recommendations, analytics.
"""

from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.models.db_models  # noqa: F401 - ensure all ORM models are registered
from app.core.config import settings
from app.core.database import Base, get_db
from app.main import app

from sqlalchemy.pool import NullPool

# ─── Test Database Setup ──────────────────────────────────────────────────────
TEST_DB_URL = settings.DATABASE_URL

test_engine = create_async_engine(TEST_DB_URL, echo=False, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    import asyncio

    for attempt in range(15):
        try:
            async with test_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            break
        except Exception:
            if attempt == 14:
                raise
            await asyncio.sleep(1)
    yield
    try:
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    except Exception:
        pass
    await test_engine.dispose()


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient):
    """Register and login a test doctor, return auth headers."""
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "doctor@test.com",
            "password": "Test1234!",
            "full_name": "Dr. Test",
            "role": "doctor",
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "doctor@test.com",
            "password": "Test1234!",
        },
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ─── Auth Tests ───────────────────────────────────────────────────────────────
@pytest.mark.asyncio
class TestAuth:
    async def test_register_success(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "new_user@example.com",
                "password": "SecurePass123!",
                "full_name": "Jane Doe",
                "role": "viewer",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "new_user@example.com"
        assert data["role"] == "viewer"
        assert "id" in data

    async def test_register_duplicate_email(self, client: AsyncClient):
        payload = {
            "email": "dup@test.com",
            "password": "Test1234!",
            "full_name": "Test",
            "role": "viewer",
        }
        await client.post("/api/v1/auth/register", json=payload)
        response = await client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 400

    async def test_login_success(self, client: AsyncClient):
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "login_test@test.com",
                "password": "Test1234!",
                "full_name": "Test User",
                "role": "viewer",
            },
        )
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "login_test@test.com", "password": "Test1234!"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "login_test@test.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    async def test_me_authenticated(self, client: AsyncClient, auth_headers: dict):
        response = await client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["role"] == "doctor"

    async def test_me_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401


# ─── Patient Tests ────────────────────────────────────────────────────────────
@pytest.mark.asyncio
class TestPatients:
    PATIENT_PAYLOAD = {
        "mrn": "MRN-TEST-001",
        "first_name": "John",
        "last_name": "Patient",
        "date_of_birth": "1965-03-15T00:00:00Z",
        "sex": "M",
        "blood_type": "A+",
        "weight_kg": 85.0,
        "height_cm": 178.0,
    }

    async def test_create_patient(self, client: AsyncClient, auth_headers: dict):
        response = await client.post("/api/v1/patients", json=self.PATIENT_PAYLOAD, headers=auth_headers)
        assert response.status_code == 201
        data = response.json()
        assert data["mrn"] == "MRN-TEST-001"
        assert data["first_name"] == "John"
        return data["id"]

    async def test_list_patients(self, client: AsyncClient, auth_headers: dict):
        response = await client.get("/api/v1/patients", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data

    async def test_get_patient_not_found(self, client: AsyncClient, auth_headers: dict):
        response = await client.get("/api/v1/patients/nonexistent-id", headers=auth_headers)
        assert response.status_code == 404

    async def test_unauthenticated_access(self, client: AsyncClient):
        response = await client.get("/api/v1/patients")
        assert response.status_code == 401


# ─── Analytics Tests ──────────────────────────────────────────────────────────
@pytest.mark.asyncio
class TestAnalytics:
    async def test_population_stats(self, client: AsyncClient, auth_headers: dict):
        response = await client.get("/api/v1/analytics/population", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_patients" in data
        assert "high_risk_count" in data
        assert "avg_adherence" in data
        assert "pending_reviews" in data

    async def test_risk_distribution(self, client: AsyncClient, auth_headers: dict):
        response = await client.get("/api/v1/analytics/risk-distribution", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "low_risk" in data
        assert "distribution_data" in data
        assert len(data["distribution_data"]) == 4

    async def test_outcome_trends(self, client: AsyncClient, auth_headers: dict):
        response = await client.get("/api/v1/analytics/outcomes", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert len(data["data"]) > 0


# ─── Health Check ─────────────────────────────────────────────────────────────
@pytest.mark.asyncio
class TestHealth:
    async def test_health_endpoint(self, client: AsyncClient):
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
