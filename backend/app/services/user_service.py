"""User management service — database operations and authentication helpers."""
from __future__ import annotations

from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.db_models import User
from app.schemas.schemas import UserRegister
from app.core.security import hash_password, verify_password


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, user_id: str) -> Optional[User]:
        """Fetch active user by primary key UUID."""
        result = await self.db.execute(
            select(User).where(User.id == user_id, User.is_active == True)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """Fetch user by unique email address."""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def create_user(self, payload: UserRegister) -> User:
        """Create a new registered user."""
        user = User(
            email=payload.email,
            hashed_password=hash_password(payload.password),
            full_name=payload.full_name,
            role=payload.role,
            npi_number=payload.npi_number,
            department=payload.department,
        )
        self.db.add(user)
        await self.db.flush()
        return user

    async def authenticate(self, email: str, plain_password: str) -> Optional[User]:
        """Verify user credentials and return user if valid and active."""
        user = await self.get_by_email(email)
        if not user or not verify_password(plain_password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user
