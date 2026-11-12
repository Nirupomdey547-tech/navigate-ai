from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

# Engine
db_url = settings.database_url
if db_url.startswith("sqlite"):
    engine = create_async_engine(
        db_url,
        echo=(settings.ENVIRONMENT == "development"),
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_async_engine(
        db_url,
        echo=(settings.ENVIRONMENT == "development"),
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )


# Session factory
AsyncSessionLocal = sessionmaker(  # type: ignore[call-overload]
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# Declarative base shared by all models
Base = declarative_base()


async def init_db() -> None:
    """Create all tables (dev/test convenience; use Alembic in production)."""
    # Import models so their metadata is registered before create_all
    import app.models.user  # noqa: F401
    import app.models.navigation  # noqa: F401
    import app.models.environment  # noqa: F401
    import app.models.experiment  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    """Async generator that yields a database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
