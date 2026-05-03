"""
Gemini API client wrapper using the new google-genai SDK.
Wraps google.genai for use by generator and auditor agents.
"""
import logging
from pathlib import Path
from typing import Optional

from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)


def _load_prompt(filename: str) -> str:
    """Load a prompt file from the prompts/ directory."""
    prompt_path = Path(__file__).parent.parent / "prompts" / filename
    return prompt_path.read_text(encoding="utf-8").strip()


class GeminiClient:
    """
    Thin wrapper around the google-genai SDK.
    Supports per-request API key override (demo mode only).
    """

    def __init__(self, default_api_key: str):
        self._default_api_key = default_api_key
        self._default_client = genai.Client(api_key=default_api_key)

    @retry(
        retry=retry_if_exception_type(Exception),
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=1, max=4),
        reraise=True,
    )
    def generate(
        self,
        model_name: str,
        system_prompt: str,
        user_message: str,
        api_key: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        """
        Call Gemini with a system prompt + user message.
        Returns the raw text response.
        
        If api_key is provided (demo mode), it overrides the default key for this call.
        """
        # Use per-request key if provided (demo mode)
        client = genai.Client(api_key=api_key) if api_key else self._default_client
        
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=user_message,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=temperature,
                    max_output_tokens=2048,
                ),
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise


# Singleton factory — created once per app lifetime
_client: Optional[GeminiClient] = None


def get_gemini_client(api_key: str) -> GeminiClient:
    global _client
    if _client is None:
        _client = GeminiClient(default_api_key=api_key)
    return _client
