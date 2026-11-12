"""
Navigate AI — FastAPI Application Entry Point.
Multilingual Vision-and-Language Navigation Research Platform.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.base import init_db, AsyncSessionLocal
from app.database.seed import seed_initial_data
from app.auth.router import router as auth_router
from app.api.environments import router as environments_router
from app.api.navigation import router as navigation_router
from app.api.agent import router as agent_router
from app.api.experiments import router as experiments_router
from app.api.analytics import router as analytics_router
from app.api.history import router as history_router
from app.api.models import router as models_router
from app.websocket.router import router as ws_router

logging.basicConfig(level=settings.log_level)
logger = logging.getLogger("navigate-ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and seed demo data
    logger.info("Initializing Navigate AI database...")
    try:
        await init_db()
        async with AsyncSessionLocal() as session:
            await seed_initial_data(session)
        logger.info("Navigate AI database initialized successfully.")
    except Exception as e:
        logger.error("Error initializing database: %s", e)
    yield
    # Shutdown logic if any
    logger.info("Shutting down Navigate AI backend.")


app = FastAPI(
    title="Navigate AI",
    description="Research-grade Multilingual Vision-and-Language Navigation Decision Agent",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth_router)
app.include_router(environments_router)
app.include_router(navigation_router)
app.include_router(agent_router)
app.include_router(experiments_router)
app.include_router(analytics_router)
app.include_router(history_router)
app.include_router(models_router)
app.include_router(ws_router)


@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "ok",
        "service": "navigate-ai-backend",
        "version": "1.0.0",
        "research_benchmark": "Room-Across-Room (RxR)",
    }
