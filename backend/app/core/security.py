"""Security utilities — JWT creation/verification, password hashing, RBAC."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Union

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ─── Roles ───────────────────────────────────────────────────────────────────
class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    NURSE = "nurse"
    VIEWER = "viewer"


ROLE_PERMISSIONS: dict[UserRole, list[str]] = {
    UserRole.ADMIN: ["*"],  # all permissions
    UserRole.DOCTOR: [
        "patient:read", "patient:write",
        "ai:recommend", "ai:approve", "ai:reject",
        "labs:read", "labs:write",
        "medications:read", "medications:write",
        "genomics:read", "genomics:write",
        "analytics:read",
    ],
    UserRole.NURSE: [
        "patient:read", "labs:read", "labs:write",
        "medications:read", "wearables:read",
    ],
    UserRole.VIEWER: ["patient:read", "labs:read", "analytics:read"],
}


# ─── Password ─────────────────────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ─── JWT ──────────────────────────────────────────────────────────────────────
def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


# ─── Dependency helpers ───────────────────────────────────────────────────────
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    from app.services.user_service import UserService  # avoid circular imports
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing subject")
    user = await UserService(db).get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def require_role(*roles: UserRole):
    """Dependency factory — raise 403 if user's role not in allowed roles."""
    async def _check(current_user=Depends(get_current_user)):
        if current_user.role not in [r.value for r in roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role: {', '.join(r.value for r in roles)}",
            )
        return current_user
    return _check


def require_permission(permission: str):
    """Dependency factory — check fine-grained permission."""
    async def _check(current_user=Depends(get_current_user)):
        role = UserRole(current_user.role)
        allowed = ROLE_PERMISSIONS.get(role, [])
        if "*" not in allowed and permission not in allowed:
            raise HTTPException(status_code=403, detail=f"Missing permission: {permission}")
        return current_user
    return _check
