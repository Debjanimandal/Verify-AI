"""
Verify AI Backend — FastAPI Application (Full Overhaul)
Dual-agent civic AI safety system with scoring, embeddings, and pipeline visualization.

Pipeline: User Input → Search Grounding → Generator Agent → Auditor Agent
         → Trust Scorer → Decision Engine → Frontend
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
    ErrorResponse, DebugInfo, SearchGrounding, PipelineStage
)
from agents.generator import GeneratorAgent
from agents.auditor import AuditorAgent
from services.gemini_client import get_gemini_client
from services.search_service import SearchService
from services.scorer import compute_trust_score

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
    logger.info("Verify AI backend starting...")
    logger.info(f"Generator model: {settings.generator_model}")
    logger.info(f"Auditor model:   {settings.auditor_model}")
    logger.info(f"Search provider: {_search.active_provider or 'none (no API keys)'}")
    logger.info(f"Maps enabled:    {bool(settings.google_maps_api_key)}")
    yield
    logger.info("Verify AI backend shutting down.")


# ─── FastAPI App ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Verify AI API",
    description="Dual-agent civic AI safety system — Generator + Auditor pipeline with trust scoring",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend + all Vercel preview URLs
# allow_origin_regex covers *.vercel.app for preview deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
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
        "service": "Verify AI API",
        "version": "2.0.0",
        "generator_model": settings.generator_model,
        "auditor_model": settings.auditor_model,
        "search_provider": _search.active_provider,
        "maps_enabled": bool(settings.google_maps_api_key),
        "features": {
            "search_grounding": settings.enable_search_grounding,
            "trust_scoring": True,
            "rule_overrides": True,
            "pipeline_stages": True,
        }
    }


@app.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """
    Main Verify AI pipeline endpoint.

    Flow:
      0. (Optional) Search Grounding — fetch real-time web context
      1. Generator Agent → produces a grounded response
      2. Auditor Agent  → verifies response (PASS or BLOCK)
      3. Trust Scorer   → computes 5-dimension trust score
      4. Decision Engine → enforce result with rule overrides
      5. Return structured response with full debug + scoring to frontend

    Safety rule: Any failure defaults to BLOCK.
    """
    request_id = str(uuid.uuid4())[:8]
    start_time = time.monotonic()
    pipeline_stages: list[PipelineStage] = []
    logger.info(f"[{request_id}] === New Query: '{request.prompt[:80]}' ===")

    # Resolve API key
    active_key = request.api_key if request.api_key else None

    # ── Step 0: Search Grounding ───────────────────────────────────────────────
    grounding: SearchGrounding = SearchGrounding(query=request.prompt)
    grounding_context = ""
    stage_t0 = time.monotonic()

    if settings.enable_search_grounding and _search.has_search:
        try:
            grounding = await _search.ground(request.prompt, location=request.location)
            grounding_context = _search.format_context_for_generator(grounding)
            search_ms = (time.monotonic() - stage_t0) * 1000
            pipeline_stages.append(PipelineStage(
                name="Search Grounding",
                status="complete",
                duration_ms=round(search_ms, 1),
                details=f"{len(grounding.results)} web result(s) via {grounding.provider}",
            ))
            logger.info(f"[{request_id}] Grounding: {len(grounding.results)} results")
        except Exception as e:
            search_ms = (time.monotonic() - stage_t0) * 1000
            pipeline_stages.append(PipelineStage(
                name="Search Grounding",
                status="error",
                duration_ms=round(search_ms, 1),
                details=f"Failed: {str(e)[:80]}",
            ))
            logger.warning(f"[{request_id}] Search grounding failed (non-fatal): {e}")
    else:
        pipeline_stages.append(PipelineStage(
            name="Search Grounding",
            status="skipped",
            duration_ms=0,
            details="No search API key configured",
        ))

    # ── Step 1: Generator Agent ────────────────────────────────────────────────
    stage_t1 = time.monotonic()
    try:
        generated_text = await _generator.generate(
            user_prompt=request.prompt,
            api_key=active_key,
            grounding_context=grounding_context,
        )
        gen_ms = (time.monotonic() - stage_t1) * 1000
        pipeline_stages.append(PipelineStage(
            name="Generator Agent",
            status="complete",
            duration_ms=round(gen_ms, 1),
            details=f"{len(generated_text)} chars produced",
        ))
        logger.info(f"[{request_id}] Generator: {len(generated_text)} chars in {gen_ms:.0f}ms")
    except Exception as e:
        gen_ms = (time.monotonic() - stage_t1) * 1000
        duration_ms = (time.monotonic() - start_time) * 1000
        pipeline_stages.append(PipelineStage(
            name="Generator Agent", status="error",
            duration_ms=round(gen_ms, 1), details=str(e)[:80],
        ))
        return QueryResponse(
            decision=Decision.BLOCK,
            generated_text=None,
            reason="The generation service encountered an error. Please try again.",
            risk_level=RiskLevel.HIGH,
            flags=["generator_error"],
            debug=DebugInfo(
                stage="generator", error=str(e),
                raw_generated_text="",
                audit_decision="BLOCK", audit_risk_level="high",
                audit_reason="Generator failed",
                generator_model=settings.generator_model,
                auditor_model=settings.auditor_model,
                request_id=request_id, duration_ms=duration_ms,
                search_provider=grounding.provider,
                search_query=grounding.query,
                search_results_count=len(grounding.results),
                is_location_query=grounding.is_location_query,
                pipeline_stages=[s.model_dump() for s in pipeline_stages],
            ),
        )

    # ── Step 2: Auditor Agent ──────────────────────────────────────────────────
    stage_t2 = time.monotonic()
    audit_result = await _auditor.audit(
        user_prompt=request.prompt,
        generated_response=generated_text,
        api_key=active_key,
        search_context=grounding_context,
    )
    audit_ms = (time.monotonic() - stage_t2) * 1000
    pipeline_stages.append(PipelineStage(
        name="Auditor Agent",
        status="complete",
        duration_ms=round(audit_ms, 1),
        details=f"{audit_result.decision.value} | confidence={audit_result.confidence:.0%}",
    ))
    logger.info(
        f"[{request_id}] Audit: {audit_result.decision.value} | "
        f"risk={audit_result.risk_level.value} | confidence={audit_result.confidence:.2f}"
    )

    # ── Step 3: Trust Scorer ───────────────────────────────────────────────────
    stage_t3 = time.monotonic()
    scoring = compute_trust_score(
        prompt=request.prompt,
        response=generated_text,
        grounding=grounding,
        audit_confidence=audit_result.confidence,
        audit_flags=audit_result.flags,
    )
    score_ms = (time.monotonic() - stage_t3) * 1000
    pipeline_stages.append(PipelineStage(
        name="Trust Scorer",
        status="complete",
        duration_ms=round(score_ms, 1),
        details=f"composite={scoring.composite_trust_score:.2f} | {scoring.recommended_decision.value}",
    ))

    # ── Step 4: Decision Engine ────────────────────────────────────────────────
    # Auditor verdict is authoritative; scorer is advisory
    # If auditor says BLOCK → BLOCK. If auditor says PASS but scorer < 0.45 → escalate to review (still PASS but noted)
    is_safe = audit_result.decision == Decision.PASS
    
    # Additional override: if scorer strongly disagrees with PASS (composite < 0.40) → BLOCK
    if is_safe and scoring.composite_trust_score < 0.40:
        is_safe = False
        audit_result.flags.append("scorer_override")
        logger.warning(f"[{request_id}] Scorer override: trust={scoring.composite_trust_score:.2f} < 0.40 → BLOCK")

    duration_ms = (time.monotonic() - start_time) * 1000
    pipeline_stages.append(PipelineStage(
        name="Decision Engine",
        status="complete",
        duration_ms=round((time.monotonic() - stage_t3 - score_ms/1000) * 1000, 1),
        details=f"Final: {'PASS' if is_safe else 'BLOCK'}",
    ))

    # ── Build comprehensive debug object ──────────────────────────────────────
    debug = DebugInfo(
        stage="complete",
        raw_generated_text=generated_text,
        audit_decision=audit_result.decision.value,
        audit_risk_level=audit_result.risk_level.value,
        audit_reason=audit_result.reason,
        audit_flags=audit_result.flags,
        audit_confidence=audit_result.confidence,
        audit_detailed_flags=[df.model_dump() for df in audit_result.detailed_flags],
        generator_model=settings.generator_model,
        auditor_model=settings.auditor_model,
        request_id=request_id,
        duration_ms=round(duration_ms, 1),
        search_provider=grounding.provider,
        search_query=grounding.query,
        search_results_count=len(grounding.results),
        is_location_query=grounding.is_location_query,
        # Scoring
        scoring_breakdown=scoring.model_dump(),
        embedding_similarity=scoring.embedding_similarity,
        source_overlap_score=scoring.source_overlap_score,
        composite_trust_score=scoring.composite_trust_score,
        hallucination_score=scoring.hallucination_risk.score,
        # Pipeline stages
        pipeline_stages=[s.model_dump() for s in pipeline_stages],
    )

    logger.info(
        f"[{request_id}] Complete: {'PASS' if is_safe else 'BLOCK'} | "
        f"trust={scoring.composite_trust_score:.2f} | {duration_ms:.0f}ms"
    )

    return QueryResponse(
        decision=audit_result.decision if is_safe else Decision.BLOCK,
        generated_text=generated_text if is_safe else None,
        reason=audit_result.reason,
        risk_level=audit_result.risk_level,
        flags=audit_result.flags,
        citations=grounding.results[:5] if is_safe else [],
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
