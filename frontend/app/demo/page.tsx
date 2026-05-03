'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Shield, Zap, ShieldX } from 'lucide-react';
import { useFairZero } from '@/hooks/useFairZero';
import { AgentStatus } from '@/components/AgentStatus';
import { ResultCard } from '@/components/ResultCard';
import { BlockCard } from '@/components/BlockCard';
import { DebugPanel } from '@/components/DebugPanel';
import { config } from '@/lib/config';

const DEMO_SCENARIOS = [
  ...config.samplePrompts.map((p) => ({ ...p, type: 'safe' as const })),
  ...config.riskyPrompts.map((p) => ({ ...p, type: 'risky' as const })),
];

export default function DemoPage() {
  const { pipelineState, result, error, submit, reset } = useFairZero();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const isLoading = pipelineState === 'generating' || pipelineState === 'auditing';

  const handleRun = (prompt: string, label: string) => {
    if (isLoading) return;
    setActiveScenario(label);
    reset();
    setTimeout(() => submit(prompt), 50);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Zap size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
          }}>
            Live Demo
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          marginBottom: '0.75rem',
          lineHeight: 1.1,
        }}>
          See Verify AI in action.
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', maxWidth: '520px', lineHeight: 1.65 }}>
          Click any scenario below to run the full dual-agent pipeline live.
          Safe queries will PASS. Risky queries will be BLOCKED.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Scenario list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
              Safe Scenarios (expect PASS)
            </span>
          </div>
          {DEMO_SCENARIOS.filter(s => s.type === 'safe').map((scenario) => (
            <ScenarioCard
              key={scenario.label}
              scenario={scenario}
              isActive={activeScenario === scenario.label}
              isLoading={isLoading && activeScenario === scenario.label}
              onRun={() => handleRun(scenario.prompt, scenario.label)}
            />
          ))}

          <div style={{ marginTop: '1.25rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
              Risky Scenarios (expect BLOCK)
            </span>
          </div>
          {DEMO_SCENARIOS.filter(s => s.type === 'risky').map((scenario) => (
            <ScenarioCard
              key={scenario.label}
              scenario={scenario}
              isActive={activeScenario === scenario.label}
              isLoading={isLoading && activeScenario === scenario.label}
              onRun={() => handleRun(scenario.prompt, scenario.label)}
            />
          ))}
        </div>

        {/* Live output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pipelineState === 'idle' && (
            <div style={{
              padding: '3rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              textAlign: 'center',
            }}>
              <Shield size={28} style={{ color: 'rgba(255,255,255,0.12)', marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.25)' }}>
                Select a scenario to run the pipeline
              </p>
            </div>
          )}

          <AnimatePresence>
            {pipelineState !== 'idle' && (
              <AgentStatus pipelineState={pipelineState} />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(pipelineState === 'pass' || pipelineState === 'block') && result && (
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

          {pipelineState === 'error' && error && (
            <div style={{
              padding: '1rem',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.4)',
            }}>
              Error: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({
  scenario,
  isActive,
  isLoading,
  onRun,
}: {
  scenario: { label: string; prompt: string; type: 'safe' | 'risky' };
  isActive: boolean;
  isLoading: boolean;
  onRun: () => void;
}) {
  return (
    <motion.button
      onClick={onRun}
      whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '0.875rem 1rem',
        background: isActive ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}
    >
      <div style={{
        marginTop: '2px',
        flexShrink: 0,
        width: '24px',
        height: '24px',
        borderRadius: '6px',
        background: scenario.type === 'safe' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${scenario.type === 'safe' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.07)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {scenario.type === 'safe' ? (
          <Shield size={11} style={{ color: 'rgba(255,255,255,0.5)' }} />
        ) : (
          <ShieldX size={11} style={{ color: 'rgba(255,255,255,0.35)' }} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.25rem' }}>
          {scenario.label}
          {isLoading && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>running...</span>}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
          {scenario.prompt.slice(0, 80)}...
        </div>
      </div>
    </motion.button>
  );
}
