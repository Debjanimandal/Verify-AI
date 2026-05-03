"""
Trust Scoring Engine — Multi-dimensional response trust scoring.

Computes 5 independent scoring dimensions without external APIs:
  1. Factual Accuracy       — Phrase overlap between response and verified sources
  2. Specificity Risk       — Detects risky specificity patterns (phone#, addresses, etc.)
  3. Source Coverage        — How much of the response is backed by search grounding
  4. Consistency            — Semantic alignment between prompt and response (TF-IDF cosine)
  5. Hallucination Risk     — Combined signal of unverifiable specifics

All scores are 0.0–1.0.  Higher = SAFER (except specificity_risk which is inverted).
"""
import re
import logging
import math
from typing import Optional

from schemas.audit import (
    ScoringBreakdown, ScoringDimension, Decision, SearchGrounding
)

logger = logging.getLogger(__name__)

# ─── Regex Patterns for Risky Specificity ─────────────────────────────────────
_PHONE_PATTERN = re.compile(
    r'(\+?\d[\d\s\-\(\)]{7,}\d)',
    re.IGNORECASE,
)
_EMAIL_PATTERN = re.compile(
    r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+',
    re.IGNORECASE,
)
_ADDRESS_PATTERN = re.compile(
    r'\b\d+[,\s]+[A-Za-z\s]+(road|street|lane|nagar|colony|sector|block|marg|chowk|bazaar|market)\b',
    re.IGNORECASE,
)
_SPECIFIC_CONTACT_PHRASES = [
    'whatsapp', 'call us', 'contact us at', 'reach us at', 'helpline',
    'toll-free', 'toll free', 'mobile:', 'phone:', 'tel:', 'fax:',
    'website:', 'visit us at', 'walk in',
]
_HIGH_CONFIDENCE_PHRASES = [
    'i confirm', 'i verified', 'definitely', 'guaranteed', 'i assure',
    'i can confirm', 'certainly available', 'always available',
    'exact address', 'exact location',
]
_CIVIC_SENSITIVE_KEYWORDS = [
    'ngo', 'government hospital', 'ration card', 'aadhar', 'scheme id',
    'portal', 'official website', 'registration number', 'helpline number',
]


# ─── TF-IDF Cosine Similarity (no external deps needed beyond stdlib) ─────────

def _tokenize(text: str) -> list[str]:
    """Simple whitespace + punct tokenizer."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return [t for t in text.split() if len(t) > 2]


def _compute_tf(tokens: list[str]) -> dict[str, float]:
    tf: dict[str, float] = {}
    total = len(tokens) or 1
    for t in tokens:
        tf[t] = tf.get(t, 0) + 1.0 / total
    return tf


def _cosine_similarity(vec_a: dict[str, float], vec_b: dict[str, float]) -> float:
    """Cosine similarity between two sparse TF vectors."""
    vocab = set(vec_a) | set(vec_b)
    if not vocab:
        return 0.0
    dot = sum(vec_a.get(t, 0.0) * vec_b.get(t, 0.0) for t in vocab)
    mag_a = math.sqrt(sum(v ** 2 for v in vec_a.values()))
    mag_b = math.sqrt(sum(v ** 2 for v in vec_b.values()))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def compute_embedding_similarity(text_a: str, text_b: str) -> float:
    """
    Compute TF-IDF cosine similarity between two texts.
    Returns 0.0–1.0. Higher = more similar.
    """
    if not text_a.strip() or not text_b.strip():
        return 0.0
    tf_a = _compute_tf(_tokenize(text_a))
    tf_b = _compute_tf(_tokenize(text_b))
    return round(_cosine_similarity(tf_a, tf_b), 4)


# ─── Source Overlap ────────────────────────────────────────────────────────────

def compute_source_overlap(response: str, grounding: Optional[SearchGrounding]) -> float:
    """
    Measure how much of the response content appears in the grounding sources.
    Returns 0.0–1.0. Higher = more source-backed.
    """
    if not grounding or not grounding.results:
        return 0.0

    resp_tokens = set(_tokenize(response))
    if not resp_tokens:
        return 0.0

    # Gather all source content
    all_source_text = " ".join(r.content for r in grounding.results)
    source_tokens = set(_tokenize(all_source_text))

    if not source_tokens:
        return 0.0

    # Overlap = what fraction of response tokens appear in sources
    overlap = resp_tokens & source_tokens
    overlap_score = len(overlap) / len(resp_tokens)
    return round(min(overlap_score * 1.5, 1.0), 4)  # Boost slightly, cap at 1


# ─── Specificity Risk Scorer ───────────────────────────────────────────────────

def compute_specificity_risk(response: str) -> tuple[float, list[str]]:
    """
    Detect risky specific claims in the response.
    Returns (risk_score 0–1, list of risk signals found).
    Higher risk_score = LESS safe.
    """
    risk_signals = []
    risk_score = 0.0

    # Phone numbers (very high risk)
    phones = _PHONE_PATTERN.findall(response)
    if phones:
        risk_signals.append(f"phone_numbers({len(phones)})")
        risk_score += 0.6 * min(len(phones), 2)

    # Email addresses
    emails = _EMAIL_PATTERN.findall(response)
    if emails:
        risk_signals.append(f"email_addresses({len(emails)})")
        risk_score += 0.3 * min(len(emails), 2)

    # Physical addresses
    addresses = _ADDRESS_PATTERN.findall(response)
    if addresses:
        risk_signals.append(f"street_addresses({len(addresses)})")
        risk_score += 0.5 * min(len(addresses), 2)

    # Contact phrases
    lower_resp = response.lower()
    for phrase in _SPECIFIC_CONTACT_PHRASES:
        if phrase in lower_resp:
            risk_signals.append(f"contact_phrase:'{phrase}'")
            risk_score += 0.2

    # Overconfident phrases
    for phrase in _HIGH_CONFIDENCE_PHRASES:
        if phrase in lower_resp:
            risk_signals.append(f"overconfident:'{phrase}'")
            risk_score += 0.15

    # Civic sensitive keywords (mild signal)
    for kw in _CIVIC_SENSITIVE_KEYWORDS:
        if kw in lower_resp:
            risk_score += 0.05

    return round(min(risk_score, 1.0), 4), risk_signals


# ─── Main Scoring Engine ───────────────────────────────────────────────────────

def compute_trust_score(
    prompt: str,
    response: str,
    grounding: Optional[SearchGrounding],
    audit_confidence: float = 1.0,
    audit_flags: list[str] | None = None,
) -> ScoringBreakdown:
    """
    Compute the full 5-dimension trust scoring breakdown.
    
    Args:
        prompt: Original user question
        response: Generated response text
        grounding: Search grounding results (may be None/empty)
        audit_confidence: Confidence score from the auditor agent (0–1)
        audit_flags: List of flags from the auditor agent
        
    Returns:
        ScoringBreakdown with all dimension scores and composite trust score
    """
    audit_flags = audit_flags or []

    # ── Dimension 1: Factual Accuracy ─────────────────────────────────────────
    # Proxy: source_overlap + audit confidence
    src_overlap = compute_source_overlap(response, grounding)
    factual_base = src_overlap * 0.5 + audit_confidence * 0.5
    factual_score = round(factual_base, 4)
    factual_dim = ScoringDimension(
        name="Factual Accuracy",
        score=factual_score,
        weight=0.30,
        explanation=(
            f"Source overlap: {src_overlap:.0%} of response terms appear in verified sources. "
            f"Auditor confidence: {audit_confidence:.0%}."
        )
    )

    # ── Dimension 2: Specificity Risk (inverted — lower is safer) ─────────────
    risk_score, risk_signals = compute_specificity_risk(response)
    specificity_safety = round(1.0 - risk_score, 4)  # Inverted
    specificity_dim = ScoringDimension(
        name="Specificity Risk",
        score=specificity_safety,
        weight=0.25,
        explanation=(
            f"Risk signals detected: {', '.join(risk_signals) if risk_signals else 'none'}. "
            f"Safety score (1 - risk): {specificity_safety:.0%}."
        )
    )

    # ── Dimension 3: Source Coverage ────────────────────────────────────────
    has_search = grounding is not None and len(grounding.results) > 0
    source_count = len(grounding.results) if grounding else 0
    coverage_score = round(min(source_count / 5.0, 1.0) * 0.7 + src_overlap * 0.3, 4) if has_search else 0.3
    source_dim = ScoringDimension(
        name="Source Coverage",
        score=coverage_score,
        weight=0.20,
        explanation=(
            f"{source_count} source(s) retrieved. "
            f"{'Response content is {:.0%} backed by sources.'.format(src_overlap) if has_search else 'No live sources available — base model knowledge only.'}"
        )
    )

    # ── Dimension 4: Consistency (prompt ↔ response alignment) ────────────────
    consistency = compute_embedding_similarity(prompt, response)
    # Scale: very low similarity might mean the response drifted
    consistency_adjusted = round(min(consistency * 3.5, 1.0), 4)  # Boost — even 0.2 sim is good
    consistency_dim = ScoringDimension(
        name="Prompt-Response Consistency",
        score=consistency_adjusted,
        weight=0.15,
        explanation=(
            f"TF-IDF cosine similarity: {consistency:.4f} "
            f"(scaled to {consistency_adjusted:.0%}). "
            f"Measures topical alignment between question and answer."
        )
    )

    # ── Dimension 5: Hallucination Risk (inverted) ────────────────────────────
    # High audit flags → higher hallucination risk → lower score
    flag_penalty = min(len(audit_flags) * 0.2, 0.8)
    hallucination_signals = [f for f in audit_flags if f in (
        'hallucinated_contact', 'unverified_local_entity',
        'fake_government_data', 'unverifiable_phone_number',
        'invented_address', 'overconfident_claim',
    )]
    hallucination_penalty = min(len(hallucination_signals) * 0.35, 1.0)
    hallucination_safety = round(max(0.0, 1.0 - flag_penalty - hallucination_penalty * 0.3), 4)
    hallucination_dim = ScoringDimension(
        name="Hallucination Risk",
        score=hallucination_safety,
        weight=0.10,
        explanation=(
            f"Hallucination flags: {hallucination_signals or 'none'}. "
            f"Total flags: {len(audit_flags)}. "
            f"Safety score (1 - penalty): {hallucination_safety:.0%}."
        )
    )

    # ── Composite Trust Score (weighted average) ─────────────────────────────
    dims = [factual_dim, specificity_dim, source_dim, consistency_dim, hallucination_dim]
    composite = sum(d.score * d.weight for d in dims) / sum(d.weight for d in dims)
    composite = round(composite, 4)

    # ── Recommended Decision ─────────────────────────────────────────────────
    # Score >= 0.60 → PASS, < 0.60 → BLOCK (conservative threshold)
    # Additionally, if any explicit hallucination flag exists → always BLOCK
    if hallucination_signals or risk_score > 0.5:
        recommended = Decision.BLOCK
    elif composite >= 0.60:
        recommended = Decision.PASS
    else:
        recommended = Decision.BLOCK

    # ── Overall confidence ────────────────────────────────────────────────────
    # How certain we are of the composite score
    uncertainty = abs(composite - 0.5) * 2  # 0 at boundary, 1 at extremes
    final_confidence = round(0.5 + uncertainty * 0.5, 4)

    logger.info(
        f"Trust Score: composite={composite:.3f} recommended={recommended.value} "
        f"factual={factual_score:.2f} specificity={specificity_safety:.2f} "
        f"source={coverage_score:.2f} consistency={consistency_adjusted:.2f} "
        f"hallucination={hallucination_safety:.2f}"
    )

    return ScoringBreakdown(
        factual_accuracy=factual_dim,
        specificity_risk=specificity_dim,
        source_coverage=source_dim,
        consistency=consistency_dim,
        hallucination_risk=hallucination_dim,
        composite_trust_score=composite,
        embedding_similarity=consistency,
        source_overlap_score=src_overlap,
        recommended_decision=recommended,
        confidence=final_confidence,
    )
