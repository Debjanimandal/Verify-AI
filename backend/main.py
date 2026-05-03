"""
FairZero Backend — FastAPI Application
Dual-agent civic AI safety system.

Pipeline: User Input → Search Grounding → Generator Agent → Auditor Agent → Decision Engine → Frontend
"""
import logging
import sys
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import get_settings
from schemas.audit import (
    QueryRequest, QueryResponse, Decision, RiskLevel,
    ErrorResponse, DebugInfo, SearchGrounding
)
from agents.generator import GeneratorAgent
from agents.auditor import AuditorAgent
from services.gemini_client import get_gemini_client
from services.search_service import SearchService

# ─── Logging Setup ─────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# ─── App Lifecycle ─────────────────────────────────────────────────────────────

settings = get_settings()

# Initialize agents once at startup
_gemini_client = get_gemini_client(settings.gemini_api_key)
_generator = GeneratorAgent(client=_gemini_client, model_name=settings.generator_model)
_auditor = AuditorAgent(client=_gemini_client, model_name=settings.auditor_model)
_search = SearchService(
    tavily_api_key=settings.tavily_api_key,
    serper_api_key=settings.serper_api_key,
    google_maps_api_key=settings.google_maps_api_key,
    max_results=settings.search_max_results,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("FairZero backend starting...")
    logger.info(f"Generator model: {settings.generator_model}")
    logger.info(f"Auditor model:   {settings.auditor_model}")
    logger.info(f"Search provider: {_search.active_provider or 'none (no API keys)'}")
    logger.info(f"Maps enabled:    {bool(settings.google_maps_api_key)}")
    yield
    logger.info("FairZero backend shutting down.")


# ─── FastAPI App ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="FairZero API",
    description="Dual-agent civic AI safety system — Generator + Auditor pipeline",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# ─── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "FairZero API",
        "generator_model": settings.generator_model,
        "auditor_model": settings.auditor_model,
        "search_provider": _search.active_provider,
        "maps_enabled": bool(settings.google_maps_api_key),
    }


@app.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """
    Main FairZero pipeline endpoint.

    Flow:
      0. (Optional) Search Grounding — fetch real-time web context
      1. Generator Agent → produces a grounded response
      2. Auditor Agent  → verifies response (PASS or BLOCK)
      3. Decision Engine → enforce result
      4. Return structured response to frontend

    Safety rule: Any failure defaults to BLOCK.
    """
    request_id = str(uuid.uuid4())[:8]
    start_time = time.monotonic()
    logger.info(f"[{request_id}] === New Query: '{request.prompt[:80]}...' ===")

    # Resolve API key: use session key if provided (demo mode), else use server key
    active_key = request.api_key if request.api_key else None

    # ── Step 0: Search Grounding (optional) ───────────────────────────────────
    grounding: SearchGrounding = SearchGrounding(query=request.prompt)
    grounding_context = ""

    if settings.enable_search_grounding and _search.has_search:
        try:
            grounding = await _search.ground(request.prompt, location=request.location)
            grounding_context = _search.format_context_for_generator(grounding)
            logger.info(
                f"[{request_id}] Grounding: {len(grounding.results)} web results, "
                f"{len(grounding.maps_results)} map results"
            )
        except Exception as e:
            logger.warning(f"[{request_id}] Search grounding failed (non-fatal): {e}")

    # ── Step 1: Generator Agent ────────────────────────────────────────────────
    try:
        generated_text = await _generator.generate(
            user_prompt=request.prompt,
            api_key=active_key,
            grounding_context=grounding_context,
        )
        logger.info(f"[{request_id}] Generator produced response ({len(generated_text)} chars)")
    except Exception as e:
        logger.error(f"[{request_id}] Generator failed: {e}")
        duration_ms = (time.monotonic() - start_time) * 1000
        return QueryResponse(
            decision=Decision.BLOCK,
            generated_text=None,
            reason="The generation service encountered an error. Please try again.",
            risk_level=RiskLevel.HIGH,
            flags=["generator_error"],
            debug=DebugInfo(
                stage="generator",
                error=str(e),
                raw_generated_text="",
                audit_decision="BLOCK",
                audit_risk_level="high",
                audit_reason="Generator failed",
                generator_model=settings.generator_model,
                auditor_model=settings.auditor_model,
                request_id=request_id,
                duration_ms=duration_ms,
                search_provider=grounding.provider,
                search_query=grounding.query,
                search_results_count=len(grounding.results),
                is_location_query=grounding.is_location_query,
            ),
        )

    # ── Step 2: Auditor Agent ──────────────────────────────────────────────────
    audit_result = await _auditor.audit(
        user_prompt=request.prompt,
        generated_response=generated_text,
        api_key=active_key,
    )
    logger.info(
        f"[{request_id}] Audit decision: {audit_result.decision.value} | "
        f"risk: {audit_result.risk_level.value} | flags: {audit_result.flags}"
    )

    # ── Step 3: Decision Engine ────────────────────────────────────────────────
    is_safe = audit_result.decision == Decision.PASS
    duration_ms = (time.monotonic() - start_time) * 1000

    debug = DebugInfo(
        stage="complete",
        raw_generated_text=generated_text,
        audit_decision=audit_result.decision.value,
        audit_risk_level=audit_result.risk_level.value,
        audit_reason=audit_result.reason,
        audit_flags=audit_result.flags,
        audit_confidence=audit_result.confidence,
        generator_model=settings.generator_model,
        auditor_model=settings.auditor_model,
        request_id=request_id,
        duration_ms=duration_ms,
        search_provider=grounding.provider,
        search_query=grounding.query,
        search_results_count=len(grounding.results),
        is_location_query=grounding.is_location_query,
    )

    return QueryResponse(
        decision=audit_result.decision,
        generated_text=generated_text if is_safe else None,
        reason=audit_result.reason,
        risk_level=audit_result.risk_level,
        flags=audit_result.flags,
        citations=grounding.results[:3] if is_safe else [],  # Show sources only on PASS
        debug=debug,
    )


# ─── Global Exception Handler ──────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="An unexpected error occurred. The system defaults to BLOCK for safety.",
            decision=Decision.BLOCK,
        ).model_dump(),
    )
