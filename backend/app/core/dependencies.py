from typing import AsyncGenerator, Optional

from fastapi import Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import oauth2_scheme, verify_token
from app.database.base import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async SQLAlchemy session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Decode the JWT token and return the User ORM object."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = verify_token(token)
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_type: str = payload.get("type", "")
        if token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from app.models.user import User
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user=Depends(get_current_user),
):
    """Ensure the authenticated user is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user


# ---------------------------------------------------------------------------
# Service singletons (lazy, one per process)
# ---------------------------------------------------------------------------
_navigation_service = None
_model_service = None


def get_navigation_service():
    """Return the process-level NavigationService singleton."""
    global _navigation_service
    if _navigation_service is None:
        from app.services.navigation_service import NavigationService

        _navigation_service = NavigationService()
    return _navigation_service


def get_model_service():
    """Return the process-level ModelService singleton."""
    global _model_service
    if _model_service is None:
        from app.services.model_service import ModelService

        _model_service = ModelService()
    return _model_service
