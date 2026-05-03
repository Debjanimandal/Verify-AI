/**
 * Verify AI API client
 * Handles communication with the Python FastAPI backend.
 * All AI logic stays server-side — this is only the HTTP layer.
 */

import { config } from './config';

export type Decision = 'PASS' | 'BLOCK';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface QueryRequest {
  prompt: string;
  api_key?: string;
  location?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  source: string;
  relevance_score: number;
}

export interface DebugInfo {
  stage: string;
  error?: string | null;
  // Generator
  raw_generated_text: string;
  // Auditor
  audit_decision: string;
  audit_risk_level: string;
  audit_reason: string;
  audit_flags: string[];
  audit_confidence: number;
  // Search grounding
  search_provider?: string | null;
  search_query?: string | null;
  search_results_count: number;
  is_location_query: boolean;
  // Models
  generator_model: string;
  auditor_model: string;
  // Timing
  request_id: string;
  duration_ms: number;
}

export interface QueryResponse {
  decision: Decision;
  generated_text: string | null;
  reason: string;
  risk_level: RiskLevel;
  flags: string[];
  citations: SearchResult[];
  debug: DebugInfo;
}

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Submit a query through the full Verify AI dual-agent pipeline.
 * Returns a structured response with PASS or BLOCK decision.
 */
export async function submitQuery(request: QueryRequest): Promise<QueryResponse> {
  const url = `${config.backendUrl}/api/query`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(60_000), // 60s timeout
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new APIError('Request timed out. The AI pipeline is taking too long.', 408);
    }
    throw new APIError('Could not connect to the Verify AI backend. Is it running?');
  }

  if (!response.ok) {
    let errorMessage = `Backend error (${response.status})`;
    try {
      const body = await response.json();
      errorMessage = body.error || body.detail || errorMessage;
    } catch {}
    throw new APIError(errorMessage, response.status);
  }

  const data = await response.json();
  return data as QueryResponse;
}

/**
 * Check if the backend is reachable.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${config.backendUrl}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
