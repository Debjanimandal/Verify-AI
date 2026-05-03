/**
 * useFairZero — Custom hook for the dual-agent pipeline state machine.
 * 
 * States: idle → generating → auditing → result (pass/block) | error
 */
'use client';

import { useState, useCallback } from 'react';
import { submitQuery, QueryResponse, APIError } from '@/lib/api';

export type PipelineState = 'idle' | 'generating' | 'auditing' | 'pass' | 'block' | 'error';

export interface FairZeroState {
  pipelineState: PipelineState;
  result: QueryResponse | null;
  error: string | null;
  lastPrompt: string | null;
}

export interface FairZeroActions {
  submit: (prompt: string, apiKey?: string) => Promise<void>;
  reset: () => void;
}

export function useFairZero(): FairZeroState & FairZeroActions {
  const [pipelineState, setPipelineState] = useState<PipelineState>('idle');
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const submit = useCallback(async (prompt: string, apiKey?: string) => {
    if (!prompt.trim()) return;

    // Reset state
    setResult(null);
    setError(null);
    setLastPrompt(prompt);

    // Step 1: Generating state
    setPipelineState('generating');

    try {
      // Simulate generator loading time for UX clarity
      // (backend does both calls; we show stages based on time heuristic)
      const genStartTime = Date.now();

      // Start the request
      const responsePromise = submitQuery({ prompt, api_key: apiKey });

      // After ~2s, transition to "auditing" state visually
      const auditingTimer = setTimeout(() => {
        setPipelineState('auditing');
      }, 2000);

      const response = await responsePromise;
      clearTimeout(auditingTimer);

      // Ensure auditing state shows for at least a moment
      const elapsed = Date.now() - genStartTime;
      if (elapsed < 2500) {
        setPipelineState('auditing');
        await new Promise((r) => setTimeout(r, 2500 - elapsed));
      }

      setResult(response);
      setPipelineState(response.decision === 'PASS' ? 'pass' : 'block');
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setPipelineState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setPipelineState('idle');
    setResult(null);
    setError(null);
    setLastPrompt(null);
  }, []);

  return { pipelineState, result, error, lastPrompt, submit, reset };
}
