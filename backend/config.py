"""
FairZero Backend Configuration
Loads and validates all environment variables for the application.
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
from typing import Optional
import logging


class Settings(BaseSettings):
    # ── REQUIRED ──────────────────────────────────────────────────────────────
    gemini_api_key: str

    # ── OPTIONAL: Search Grounding APIs ─────────────────────────────────────
    tavily_api_key: Optional[str] = None          # tavily.com — best for RAG
    serper_api_key: Optional[str] = None          # serper.dev — Google Search

    # ── OPTIONAL: Google Maps ─────────────────────────────────────────────────
    google_maps_api_key: Optional[str] = None     # Google Cloud Places API

    # ── Model Configuration ──────────────────────────────────────────────────
    generator_model: str = "gemini-2.0-flash"
    auditor_model: str = "gemini-2.0-flash"
    embedding_model: str = "models/text-embedding-004"

    # ── Server ───────────────────────────────────────────────────────────────
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    log_level: str = "INFO"

    # ── Safety / Pipeline ────────────────────────────────────────────────────
    max_retries: int = 2
    request_timeout: int = 45
    search_max_results: int = 5

    # ── Feature Flags ────────────────────────────────────────────────────────
    enable_search_grounding: bool = True
    enable_maps_integration: bool = True
    enable_multi_auditor: bool = True

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def has_search(self) -> bool:
        return bool(self.tavily_api_key or self.serper_api_key)

    @property
    def has_maps(self) -> bool:
        return bool(self.google_maps_api_key)

    @property
    def active_search_provider(self) -> Optional[str]:
        if self.tavily_api_key:
            return "tavily"
        if self.serper_api_key:
            return "serper"
        return None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    s = Settings()

    # Log configuration status at startup
    logger = logging.getLogger(__name__)
    logger.info("═══════════════════════════════════════")
    logger.info(" FairZero Configuration Loaded")
    logger.info("═══════════════════════════════════════")
    logger.info(f" Generator model : {s.generator_model}")
    logger.info(f" Auditor model   : {s.auditor_model}")
    logger.info(f" Search grounding: {'✓ ' + s.active_search_provider if s.has_search else '✗ disabled (no API key)'}")
    logger.info(f" Maps integration: {'✓ enabled' if s.has_maps else '✗ disabled (no API key)'}")
    logger.info(f" Multi-auditor   : {'✓ enabled' if s.enable_multi_auditor else '✗ disabled'}")
    logger.info("═══════════════════════════════════════")

    return s
