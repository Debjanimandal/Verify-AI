"""
Auditor Agent — Agent 2
Strictly verifies the generator's output BEFORE it reaches the user.
Returns a structured JSON decision: PASS or BLOCK.
NEVER generates new content. NEVER rewrites answers.
Default behavior: when uncertain → BLOCK.
"""
import json
import logging
from pathlib import Path
from typing import Optional

from services.gemini_client import GeminiClient
from schemas.audit import AuditResult, Decision, RiskLevel

logger = logging.getLogger(__name__)

# Load system prompt once at module import
_SYSTEM_PROMPT = (Path(__file__).parent.parent / "prompts" / "auditor.md").read_text(encoding="utf-8").strip()

# Safe fallback when audit fails completely
_FALLBACK_BLOCK = AuditResult(
    decision=Decision.BLOCK,
    risk_level=RiskLevel.HIGH,
    reason="Audit process failed or returned invalid output. Defaulting to BLOCK for safety.",
    flags=["audit_failure"],
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
    ) -> AuditResult:
        """
        Audit a generated response. Returns AuditResult with PASS or BLOCK.
        If anything goes wrong, defaults to BLOCK.
        """
        logger.info("Auditor Agent: beginning audit")

        audit_input = self._build_audit_input(user_prompt, generated_response)

        try:
            raw_output = self._client.generate(
                model_name=self._model_name,
                system_prompt=_SYSTEM_PROMPT,
                user_message=audit_input,
                api_key=api_key,
                temperature=0.1,  # Low temp for deterministic structured output
            )
            logger.debug(f"Auditor raw output: {raw_output[:300]}")
            return self._parse_audit_result(raw_output)

        except Exception as e:
            logger.error(f"Auditor Agent failed: {e}")
            return _FALLBACK_BLOCK

    def _build_audit_input(self, user_prompt: str, generated_response: str) -> str:
        return (
            f"## Original User Query\n{user_prompt}\n\n"
            f"## Generated Response to Audit\n{generated_response}\n\n"
            f"## Your Task\n"
            f"Evaluate the generated response for safety and return ONLY a valid JSON object "
            f"following the contract defined in your system instructions."
        )

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
            result = AuditResult(**data)
            logger.info(f"Auditor decision: {result.decision.value} | risk: {result.risk_level.value}")
            return result

        except (json.JSONDecodeError, ValueError, KeyError, TypeError) as e:
            logger.warning(f"Auditor: JSON parse failed ({e}) → BLOCK")
            return _FALLBACK_BLOCK
