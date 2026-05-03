"""
Search Grounding Service for FairZero.
Fetches real-time web data to ground the generator in verified facts.

Providers (in priority order):
  1. Tavily — best for RAG, returns pre-extracted clean content
  2. Serper — Google Search results (titles, snippets, links)
  3. None   — proceeds without grounding (still works, just less factual)
"""
import logging
import asyncio
from typing import Optional

import httpx

from schemas.audit import SearchResult, SearchGrounding

logger = logging.getLogger(__name__)

# ─── Keywords that suggest a location-based query ──────────────────────────────
LOCATION_KEYWORDS = [
    "near me", "nearest", "nearby", "in my city", "in my area",
    "hospital near", "clinic near", "office near", "centre near", "center near",
    "local", "in delhi", "in mumbai", "in bangalore", "in chennai", "in kolkata",
    "in hyderabad", "in pune", "in ahmedabad", "address of", "location of",
    "directions to", "how to reach", "where is",
]


def _is_location_query(prompt: str) -> bool:
    lower = prompt.lower()
    return any(kw in lower for kw in LOCATION_KEYWORDS)


# ─── Tavily Search ─────────────────────────────────────────────────────────────

async def _search_tavily(query: str, api_key: str, max_results: int = 5) -> list[SearchResult]:
    """
    Tavily Search API — best for RAG.
    Returns pre-extracted, clean content ready for LLM use.
    Free tier: 1000 requests/month at tavily.com
    """
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": api_key,
        "query": query,
        "search_depth": "basic",
        "include_answer": False,
        "include_raw_content": False,
        "max_results": max_results,
        "include_domains": [],
        "exclude_domains": [],
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()

        results = []
        for r in data.get("results", [])[:max_results]:
            results.append(SearchResult(
                title=r.get("title", ""),
                url=r.get("url", ""),
                content=r.get("content", "")[:800],  # truncate for token budget
                source="tavily",
                relevance_score=r.get("score", 0.5),
            ))

        logger.info(f"Tavily: got {len(results)} results for '{query[:60]}'")
        return results

    except httpx.HTTPStatusError as e:
        logger.warning(f"Tavily HTTP error {e.response.status_code}: {e.response.text[:200]}")
        return []
    except Exception as e:
        logger.warning(f"Tavily search failed: {e}")
        return []


# ─── Serper Search (Google) ────────────────────────────────────────────────────

async def _search_serper(query: str, api_key: str, max_results: int = 5) -> list[SearchResult]:
    """
    Serper.dev — Google Search API.
    Free tier: 2500 queries/month at serper.dev
    """
    url = "https://google.serper.dev/search"
    headers = {
        "X-API-KEY": api_key,
        "Content-Type": "application/json",
    }
    payload = {
        "q": query,
        "num": max_results,
        "gl": "in",     # India-focused for civic context
        "hl": "en",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        results = []

        # Answer box (if present)
        if "answerBox" in data:
            ab = data["answerBox"]
            results.append(SearchResult(
                title=ab.get("title", "Answer"),
                url=ab.get("link", ""),
                content=ab.get("answer", ab.get("snippet", ""))[:800],
                source="serper",
                relevance_score=1.0,
            ))

        # Organic results
        for r in data.get("organic", [])[:max_results]:
            if len(results) >= max_results:
                break
            results.append(SearchResult(
                title=r.get("title", ""),
                url=r.get("link", ""),
                content=r.get("snippet", "")[:800],
                source="serper",
                relevance_score=0.7,
            ))

        logger.info(f"Serper: got {len(results)} results for '{query[:60]}'")
        return results

    except httpx.HTTPStatusError as e:
        logger.warning(f"Serper HTTP error {e.response.status_code}: {e.response.text[:200]}")
        return []
    except Exception as e:
        logger.warning(f"Serper search failed: {e}")
        return []


# ─── Maps Search (Google Places Text Search) ───────────────────────────────────

async def _search_maps(query: str, api_key: str, location: Optional[str] = None) -> list[dict]:
    """
    Google Maps Places Text Search.
    Returns place details without fabricating phone numbers or addresses.
    Only returns what the API explicitly provides.
    """
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": query,
        "key": api_key,
        "language": "en",
        "region": "in",     # India region
    }

    if location:
        params["location"] = location

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()

        if data.get("status") not in ("OK", "ZERO_RESULTS"):
            logger.warning(f"Maps API status: {data.get('status')}")
            return []

        places = []
        for place in data.get("results", [])[:3]:
            places.append({
                "name": place.get("name", ""),
                "address": place.get("formatted_address", ""),
                "rating": place.get("rating"),
                "place_id": place.get("place_id", ""),
                "types": place.get("types", []),
                "open_now": place.get("opening_hours", {}).get("open_now"),
                "maps_url": f"https://maps.google.com/?place_id={place.get('place_id', '')}",
            })

        logger.info(f"Maps: got {len(places)} places for '{query[:60]}'")
        return places

    except httpx.HTTPStatusError as e:
        logger.warning(f"Maps HTTP error {e.response.status_code}: {e.response.text[:200]}")
        return []
    except Exception as e:
        logger.warning(f"Maps search failed: {e}")
        return []


# ─── Main Search Orchestrator ──────────────────────────────────────────────────

class SearchService:
    """
    Orchestrates all search providers for grounding.
    Gracefully degrades if API keys are missing.
    """

    def __init__(
        self,
        tavily_api_key: Optional[str] = None,
        serper_api_key: Optional[str] = None,
        google_maps_api_key: Optional[str] = None,
        max_results: int = 5,
    ):
        self.tavily_key = tavily_api_key
        self.serper_key = serper_api_key
        self.maps_key = google_maps_api_key
        self.max_results = max_results

    @property
    def has_search(self) -> bool:
        return bool(self.tavily_key or self.serper_key)

    @property
    def active_provider(self) -> Optional[str]:
        if self.tavily_key:
            return "tavily"
        if self.serper_key:
            return "serper"
        return None

    async def ground(self, prompt: str, location: Optional[str] = None) -> SearchGrounding:
        """
        Perform search grounding for a prompt.
        Returns SearchGrounding with all results and metadata.
        """
        is_loc = _is_location_query(prompt)
        grounding = SearchGrounding(
            query=prompt,
            provider=self.active_provider,
            is_location_query=is_loc,
        )

        if not self.has_search:
            logger.info("Search grounding skipped — no API keys configured")
            return grounding

        # Build focused search query from the prompt
        search_query = self._build_search_query(prompt)
        grounding.query = search_query

        # Run searches in parallel
        tasks = []
        labels = []

        if self.tavily_key:
            tasks.append(_search_tavily(search_query, self.tavily_key, self.max_results))
            labels.append("tavily")
        elif self.serper_key:
            tasks.append(_search_serper(search_query, self.serper_key, self.max_results))
            labels.append("serper")

        if is_loc and self.maps_key:
            tasks.append(_search_maps(prompt, self.maps_key, location))
            labels.append("maps")

        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for label, result in zip(labels, results):
                if isinstance(result, Exception):
                    logger.warning(f"Search task '{label}' failed: {result}")
                    continue
                if label == "maps":
                    grounding.maps_results = result
                else:
                    grounding.results.extend(result)

        logger.info(
            f"Grounding complete: {len(grounding.results)} web results, "
            f"{len(grounding.maps_results)} map results, "
            f"provider={grounding.provider}"
        )
        return grounding

    def _build_search_query(self, prompt: str) -> str:
        """Build a focused search query from the user prompt."""
        # Clean up conversational filler
        clean = prompt.strip()
        clean = clean.replace("?", "").strip()
        # Add India civic context if not present
        if "india" not in clean.lower() and len(clean) < 150:
            clean = f"{clean} India government scheme"
        return clean[:200]

    def format_context_for_generator(self, grounding: SearchGrounding) -> str:
        """
        Format grounding results as context for the generator prompt.
        """
        if not grounding.results and not grounding.maps_results:
            return ""

        parts = ["## Real-Time Research Context (verified sources)\n"]
        parts.append("Use the following factual information to ground your response:\n")

        for i, r in enumerate(grounding.results[:5], 1):
            parts.append(f"**[Source {i}]** {r.title}")
            parts.append(f"URL: {r.url}")
            parts.append(f"Content: {r.content}")
            parts.append("")

        if grounding.maps_results:
            parts.append("## Nearby Places (from Google Maps)\n")
            parts.append("⚠ These are verified addresses from Google Maps. Do NOT add phone numbers not listed here.\n")
            for place in grounding.maps_results:
                parts.append(f"**{place.get('name', '')}**")
                if place.get("address"):
                    parts.append(f"Address: {place['address']}")
                if place.get("rating"):
                    parts.append(f"Rating: {place['rating']}/5")
                if place.get("maps_url"):
                    parts.append(f"Maps: {place['maps_url']}")
                parts.append("")

        parts.append("---\n")
        return "\n".join(parts)
