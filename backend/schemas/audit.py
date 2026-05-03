"""
Pydantic schemas for Verify AI — Full overhaul with scoring, embeddings, pipeline stages.
"""
from pydantic import BaseModel, field_validator, model_validator
from typing import Optional, Any
from enum import Enum
import time
import uuid


class Decision(str, Enum):
    PASS = "PASS"
    BLOCK = "BLOCK"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# ─── Request schemas ──────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    prompt: str
    api_key: Optional[str] = None      # Demo mode only
    location: Optional[str] = None     # Optional location hint for Maps queries

    @field_validator("prompt")
    @classmethod
    def prompt_must_not_be_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Prompt cannot be empty")
        if len(v) > 4000:
            raise ValueError("Prompt exceeds maximum length of 4000 characters")
        return v


# ─── Search result schema ─────────────────────────────────────────────────────

class SearchResult(BaseModel):
    """A single search result used for grounding."""
    title: str
    url: str
    content: str
    source: str = "web"         # "web", "maps", "tavily", "serper"
    relevance_score: float = 0.0


class SearchGrounding(BaseModel):
    """Web search results used to ground the generator."""
    query: str
    results: list[SearchResult] = []
    provider: Optional[str] = None
    is_location_query: bool = False
    maps_results: list[dict] = []


# ─── Scoring schemas ──────────────────────────────────────────────────────────

class ScoringDimension(BaseModel):
    """Single dimension of the trust score."""
    name: str                      # human-readable label
    score: float                   # 0.0 – 1.0
    weight: float                  # contribution weight
    explanation: str               # why this score was given


class ScoringBreakdown(BaseModel):
    """
    5-dimension trust scoring model.
    Each dimension is scored 0–1 and weighted into a composite trust score.
    """
    # Dimensions
    factual_accuracy: ScoringDimension
    specificity_risk: ScoringDimension     # high specificity = higher risk
    source_coverage: ScoringDimension      # how well sources back the claims
    consistency: ScoringDimension          # prompt vs response semantic match
    hallucination_risk: ScoringDimension   # computed via embedding similarity

    # Derived composites
    composite_trust_score: float           # 0.0 – 1.0
    embedding_similarity: float            # cosine similarity of prompt vs response
    source_overlap_score: float            # how much response content came from sources

    # Computed recommendation
    recommended_decision: Decision
    confidence: float                      # 0.0 – 1.0


# ─── Auditor output contract ───────────────────────────────────────────────────

class AuditFlag(BaseModel):
    """Detailed flag with confidence."""
    flag: str
    confidence: float = 1.0
    detail: str = ""


class AuditResult(BaseModel):
    """Strict JSON contract for a single Auditor Agent output."""
    decision: Decision
    risk_level: RiskLevel
    reason: str
    flags: list[str] = []
    confidence: float = 1.0          # 0.0–1.0
    detailed_flags: list[AuditFlag] = []
    scoring_notes: str = ""          # human-readable scoring notes from auditor


class MultiAuditResult(BaseModel):
    """Combined result from all 3 auditors."""
    fact_audit: Optional[AuditResult] = None
    bias_audit: Optional[AuditResult] = None
    logic_audit: Optional[AuditResult] = None

    # Consensus decision (any BLOCK → BLOCK)
    final_decision: Decision = Decision.BLOCK
    final_risk_level: RiskLevel = RiskLevel.HIGH
    final_reason: str = ""
    final_flags: list[str] = []


# ─── Pipeline stage tracking ──────────────────────────────────────────────────

class PipelineStage(BaseModel):
    """Timing and result for each pipeline stage."""
    name: str
    status: str                   # "complete", "error", "skipped"
    duration_ms: float
    details: Optional[str] = None


# ─── Debug schema (always complete shape) ─────────────────────────────────────

class DebugInfo(BaseModel):
    """Always-complete debug information — same shape regardless of outcome."""
    stage: str = "complete"                          # "generator", "auditor", "complete"
    error: Optional[str] = None

    # Generator output
    raw_generated_text: str = ""

    # Single auditor info
    audit_decision: str = "BLOCK"
    audit_risk_level: str = "high"
    audit_reason: str = ""
    audit_flags: list[str] = []
    audit_confidence: float = 0.0
    audit_detailed_flags: list[dict] = []

    # Multi-auditor details
    fact_audit: Optional[dict] = None
    bias_audit: Optional[dict] = None
    logic_audit: Optional[dict] = None

    # Search grounding
    search_provider: Optional[str] = None
    search_query: Optional[str] = None
    search_results_count: int = 0
    is_location_query: bool = False

    # ── NEW: Scoring breakdown ────────────────────────────────────────────────
    scoring_breakdown: Optional[dict] = None
    embedding_similarity: float = 0.0
    source_overlap_score: float = 0.0
    composite_trust_score: float = 0.0
    hallucination_score: float = 0.0          # 1 - hallucination_risk.score

    # ── NEW: Pipeline stage timings ───────────────────────────────────────────
    pipeline_stages: list[dict] = []

    # Model info
    generator_model: str = ""
    auditor_model: str = ""

    # Timing
    request_id: str = ""
    duration_ms: float = 0.0


# ─── Final API response ────────────────────────────────────────────────────────

class QueryResponse(BaseModel):
    decision: Decision
    generated_text: Optional[str] = None
    reason: str
    risk_level: RiskLevel
    flags: list[str] = []

    # Search citations shown to user
    citations: list[SearchResult] = []

    # Always-complete debug object
    debug: DebugInfo = DebugInfo()


class ErrorResponse(BaseModel):
    error: str
    decision: Decision = Decision.BLOCK
