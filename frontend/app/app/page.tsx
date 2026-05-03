'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { useFairZero } from '@/hooks/useFairZero';
import { PromptBox } from '@/components/PromptBox';
import { AgentStatus } from '@/components/AgentStatus';
import { ResultCard } from '@/components/ResultCard';
import { BlockCard } from '@/components/BlockCard';
import { DebugPanel } from '@/components/DebugPanel';

export default function AssistantPage() {
  const { pipelineState, result, error, submit, reset } = useFairZero();

  const isLoading = pipelineState === 'generating' || pipelineState === 'auditing';
  const showResult = pipelineState === 'pass' || pipelineState === 'block';
  const hasError = pipelineState === 'error';

  return (
    <div style={{
      maxWidth: '720px',
      margin: '0 auto',
      padding: '3rem 1.5rem 5rem',
    }}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '2.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Shield size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
          }}>
            FairZero Assistant
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '0.75rem',
        }}>
          Ask a civic question.
          <br />
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>We verify before you see it.</span>
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
          Every response passes through two independent AI agents before it reaches you.
          Generator → Auditor → Decision.
        </p>
      </motion.div>

      {/* Pipeline status and input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Input box */}
        <PromptBox
          onSubmit={submit}
          isLoading={isLoading}
          onReset={reset}
          showResult={showResult}
        />

        {/* Agent pipeline status */}
        <AnimatePresence>
          {pipelineState !== 'idle' && (
            <AgentStatus pipelineState={pipelineState} />
          )}
        </AnimatePresence>

        {/* Error state */}
        <AnimatePresence>
          {hasError && error && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '1rem 1.25rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '10px',
              }}
            >
              <AlertCircle size={16} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>
                  Connection Error
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                  {error}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result panels */}
        <AnimatePresence>
          {showResult && result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {result.decision === 'PASS' ? (
                <ResultCard result={result} />
              ) : (
                <BlockCard result={result} />
              )}
              <DebugPanel result={result} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Info strip */}
      {pipelineState === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: '3rem',
            padding: '1rem 1.25rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}
        >
          <Shield size={14} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.65 }}>
            <strong style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>How this works:</strong> Your question
            is processed by two separate AI agents. The Generator composes a helpful response.
            The Auditor checks it for hallucinations, fake contacts, and risky claims.
            Only verified responses are shown. When in doubt, we block.
          </p>
        </motion.div>
      )}
    </div>
  );
}
