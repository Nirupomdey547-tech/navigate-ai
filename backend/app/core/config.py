"""
Navigate AI — Application Settings
Uses pydantic-settings for environment variable loading.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "Navigate AI"
    app_env: str = "development"
    secret_key: str = "change-me-in-production-32-chars-min-key-navigate-ai"
    api_v1_str: str = "/api"

    # Database: default to async SQLite for instant local operation, overridable by DATABASE_URL
    database_url: str = "sqlite+aiosqlite:///./navigate_ai.db"

    # Redis (optional)
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    jwt_secret_key: str = "change-me-jwt-secret-key-for-navigate-ai-2026"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 120
    refresh_token_expire_days: int = 7

    # CORS
    allowed_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

    # Logging
    log_level: str = "INFO"

    # ML
    model_checkpoint_dir: str = "./model_checkpoints"

    # Datasets
    dataset_dir: str = "./datasets"
    rxr_dataset_path: str = "./datasets/rxr"
    demo_dataset_path: str = "./datasets/demo"

    # Compatibility properties for uppercase access
    @property
    def DATABASE_URL(self) -> str:
        return self.database_url

    @property
    def ENVIRONMENT(self) -> str:
        return self.app_env

    @property
    def REDIS_URL(self) -> str:
        return self.redis_url

    @property
    def JWT_SECRET(self) -> str:
        return self.jwt_secret_key

    @property
    def JWT_ALGORITHM(self) -> str:
        return self.jwt_algorithm

    @property
    def ACCESS_TOKEN_EXPIRE_MINUTES(self) -> int:
        return self.access_token_expire_minutes

    @property
    def REFRESH_TOKEN_EXPIRE_DAYS(self) -> int:
        return self.refresh_token_expire_days




@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
