"""
Validation utilities for FairZero.
Handles JSON extraction and audit result validation.
"""
import json
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def extract_json_from_text(text: str) -> Optional[str]:
    """
    Extract a JSON object from a text string that may contain surrounding prose.
    Gemini sometimes wraps JSON in markdown code fences or adds explanation text.
    Returns the raw JSON string, or None if not found.
    """
    if not text:
        return None

    # Strategy 1: Try direct parse (clean JSON output)
    stripped = text.strip()
    if stripped.startswith("{") and stripped.endswith("}"):
        try:
            json.loads(stripped)
            return stripped
        except json.JSONDecodeError:
            pass

    # Strategy 2: Extract from markdown code fences (```json ... ```)
    fence_pattern = r"```(?:json)?\s*(\{.*?\})\s*```"
    match = re.search(fence_pattern, stripped, re.DOTALL)
    if match:
        candidate = match.group(1)
        try:
            json.loads(candidate)
            return candidate
        except json.JSONDecodeError:
            pass

    # Strategy 3: Find first { ... } block in the text
    brace_pattern = r"\{[^{}]*(?:\{[^{}]*\}[^{}]*)?\}"
    matches = re.findall(brace_pattern, stripped, re.DOTALL)
    for candidate in matches:
        try:
            json.loads(candidate)
            return candidate
        except json.JSONDecodeError:
            continue

    # Strategy 4: Find the outermost balanced braces
    start_idx = stripped.find("{")
    if start_idx != -1:
        depth = 0
        for i, ch in enumerate(stripped[start_idx:], start_idx):
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    candidate = stripped[start_idx:i+1]
                    try:
                        json.loads(candidate)
                        return candidate
                    except json.JSONDecodeError:
                        break

    logger.warning("extract_json_from_text: no valid JSON found")
    return None


def is_valid_decision(value: str) -> bool:
    """Check if a decision string is a valid PASS or BLOCK value."""
    return value in ("PASS", "BLOCK")


def is_valid_risk_level(value: str) -> bool:
    """Check if a risk level string is valid."""
    return value in ("low", "medium", "high")
