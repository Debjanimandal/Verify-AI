"""
Generator Agent — Agent 1
Calls Gemini to produce a helpful civic response.
NEVER performs safety judgment — that is the Auditor's job.
Can accept optional real-time grounding context from web search.
"""
import logging
from pathlib import Path
from typing import Optional

from services.gemini_client import GeminiClient

logger = logging.getLogger(__name__)

# Load system prompt once at module import
_SYSTEM_PROMPT = (Path(__file__).parent.parent / "prompts" / "generator.md").read_text(encoding="utf-8").strip()


class GeneratorAgent:
    def __init__(self, client: GeminiClient, model_name: str):
        self._client = client
        self._model_name = model_name

    async def generate(
        self,
        user_prompt: str,
        api_key: Optional[str] = None,
        grounding_context: str = "",
    ) -> str:
        """
        Produce a helpful response to the user's civic question.
        Optionally incorporates real-time search grounding context.
        Returns raw text — this output MUST be audited before delivery.
        """
        logger.info(f"Generator Agent: processing prompt (length={len(user_prompt)})")

        # Combine grounding context with user prompt when available
        if grounding_context:
            full_user_message = f"{grounding_context}\n\n## User Question\n{user_prompt}"
            logger.info("Generator Agent: using search grounding context")
        else:
            full_user_message = user_prompt

        try:
            response_text = self._client.generate(
                model_name=self._model_name,
                system_prompt=_SYSTEM_PROMPT,
                user_message=full_user_message,
                api_key=api_key,
                temperature=0.7,
            )
            logger.info("Generator Agent: response received")
            return response_text

        except Exception as e:
            logger.error(f"Generator Agent failed: {e}")
            raise RuntimeError(f"Generator agent error: {str(e)}")
