"""
Auditor Agent — Agent 2
Strictly verifies the generator's output BEFORE it reaches the user.
Returns a structured JSON decision: PASS or BLOCK with full scoring breakdown.
NEVER generates new content. NEVER rewrites answers.
Default behavior: when uncertain → BLOCK.
"""
import json
import logging
from pathlib import Path
from typing import Optional

from services.gemini_client import GeminiClient
from schemas.audit import AuditResult, AuditFlag, Decision, RiskLevel

logger = logging.getLogger(__name__)

# Load system prompt once at module import
_SYSTEM_PROMPT = (Path(__file__).parent.parent / "prompts" / "auditor.md").read_text(encoding="utf-8").strip()

# Safe fallback when audit fails completely
_FALLBACK_BLOCK = AuditResult(
    decision=Decision.BLOCK,
    risk_level=RiskLevel.HIGH,
    reason="Audit process failed or returned invalid output. Defaulting to BLOCK for safety.",
    flags=["audit_failure"],
    confidence=0.0,
    detailed_flags=[AuditFlag(flag="audit_failure", confidence=1.0, detail="Auditor returned unparseable output")],
    scoring_notes="Fallback — parse error",
)


class AuditorAgent:
    def __init__(self, client: GeminiClient, model_name: str):
        self._client = client
        self._model_name = model_name

    async def audit(
        self,
        user_prompt: str,
        generated_response: str,
        api_key: Optional[str] = None,
        search_context: str = "",
    ) -> AuditResult:
        """
        Audit a generated response. Returns AuditResult with PASS or BLOCK.
        If anything goes wrong, defaults to BLOCK.
        """
        logger.info("Auditor Agent: beginning audit")

        audit_input = self._build_audit_input(user_prompt, generated_response, search_context)

        try:
            raw_output = self._client.generate(
                model_name=self._model_name,
                system_prompt=_SYSTEM_PROMPT,
                user_message=audit_input,
                api_key=api_key,
                temperature=0.05,  # Very low temp for deterministic structured output
            )
            logger.debug(f"Auditor raw output: {raw_output[:400]}")
            result = self._parse_audit_result(raw_output)
            
            # Additional rule-based override: if specificity risk detected, confirm BLOCK
            result = self._apply_rule_overrides(result, generated_response)
            return result

        except Exception as e:
            logger.error(f"Auditor Agent failed: {e}")
            return _FALLBACK_BLOCK

    def _build_audit_input(self, user_prompt: str, generated_response: str, search_context: str) -> str:
        parts = [
            "## Original User Query",
            user_prompt,
            "",
            "## Generated Response to Audit",
            generated_response,
        ]
        if search_context:
            parts.extend([
                "",
                "## Verified Source Context (for your reference)",
                search_context[:2000],  # Limit context to avoid token overflow
                "(Compare the response's claims against these verified sources)",
            ])
        parts.extend([
            "",
            "## Your Task",
            "Evaluate the generated response thoroughly and return ONLY a valid JSON object "
            "following the scoring rubric and contract defined in your system instructions.",
        ])
        return "\n".join(parts)

    def _parse_audit_result(self, raw_output: str) -> AuditResult:
        """
        Parse the auditor's JSON output.
        Any parsing failure → BLOCK for safety.
        """
        from utils.validation import extract_json_from_text

        try:
            json_str = extract_json_from_text(raw_output)
            if json_str is None:
                logger.warning("Auditor: no JSON found in output → BLOCK")
                return _FALLBACK_BLOCK

            data = json.loads(json_str)
            
            # Parse detailed_flags if present
            detailed_flags = []
            for df in data.get("detailed_flags", []):
                try:
                    detailed_flags.append(AuditFlag(**df))
                except Exception:
                    pass
            
            result = AuditResult(
                decision=Decision(data.get("decision", "BLOCK")),
                risk_level=RiskLevel(data.get("risk_level", "high")),
                reason=str(data.get("reason", "No reason provided")),
                flags=data.get("flags", []),
                confidence=float(data.get("confidence", 0.5)),
                detailed_flags=detailed_flags,
                scoring_notes=str(data.get("scoring_notes", "")),
            )
            logger.info(f"Auditor decision: {result.decision.value} | risk: {result.risk_level.value} | confidence: {result.confidence:.2f}")
            return result

        except (json.JSONDecodeError, ValueError, KeyError, TypeError) as e:
            logger.warning(f"Auditor: JSON parse failed ({e}) → BLOCK")
            return _FALLBACK_BLOCK

    def _apply_rule_overrides(self, result: AuditResult, response: str) -> AuditResult:
        """
        Hard rule-based overrides AFTER LLM audit.
        Catches patterns the LLM might miss.
        """
        import re
        
        phone_pattern = re.compile(r'(\+?\d[\d\s\-\(\)]{7,}\d)', re.IGNORECASE)
        phones = phone_pattern.findall(response)
        
        if phones and result.decision == Decision.PASS:
            logger.warning(f"Rule override: found {len(phones)} phone number(s) in PASS response → BLOCK")
            flags = list(result.flags)
            if "unverifiable_phone_number" not in flags:
                flags.append("unverifiable_phone_number")
            if "hallucinated_contact" not in flags:
                flags.append("hallucinated_contact")
            
            return AuditResult(
                decision=Decision.BLOCK,
                risk_level=RiskLevel.HIGH,
                reason=f"Rule override: response contains {len(phones)} phone number(s) that cannot be verified. Original auditor decision overridden.",
                flags=flags,
                confidence=0.99,  # Very confident about this override
                detailed_flags=result.detailed_flags + [
                    AuditFlag(
                        flag="unverifiable_phone_number",
                        confidence=0.99,
                        detail=f"Found pattern: {phones[0][:20]}..."
                    )
                ],
                scoring_notes="Hard rule override triggered by phone number detection",
            )
        
        return result
