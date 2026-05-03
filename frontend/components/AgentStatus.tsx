'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import type { PipelineState } from '@/hooks/useFairZero';

interface AgentStatusProps {
  pipelineState: PipelineState;
}

interface StepConfig {
  id: 'generator' | 'auditor' | 'decision';
  label: string;
  sublabel: string;
  activeStates: PipelineState[];
  completeStates: PipelineState[];
}

const STEPS: StepConfig[] = [
  {
    id: 'generator',
    label: 'Agent 1 — Generator',
    sublabel: 'Composing civic response...',
    activeStates: ['generating'],
    completeStates: ['auditing', 'pass', 'block'],
  },
  {
    id: 'auditor',
    label: 'Agent 2 — Auditor',
    sublabel: 'Verifying for safety...',
    activeStates: ['auditing'],
    completeStates: ['pass', 'block'],
  },
  {
    id: 'decision',
    label: 'Decision Engine',
    sublabel: 'Enforcing PASS / BLOCK...',
    activeStates: [],
    completeStates: ['pass', 'block'],
  },
];

function getStepState(step: StepConfig, pipelineState: PipelineState) {
  if (step.activeStates.includes(pipelineState)) return 'active';
  if (step.completeStates.includes(pipelineState)) return 'complete';
  return 'idle';
}

export function AgentStatus({ pipelineState }: AgentStatusProps) {
  if (pipelineState === 'idle') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'var(--bg-surface-2)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Pipeline Status
        </span>
      </div>

      {STEPS.map((step, i) => {
        const state = getStepState(step, pipelineState);
        return (
          <div key={step.id}>
            <StepRow step={step} state={state} pipelineState={pipelineState} />
            {i < STEPS.length - 1 && (
              <div style={{
                width: '1px',
                height: '24px',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
                marginLeft: '16px',
              }} />
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

function StepRow({ step, state, pipelineState }: {
  step: StepConfig;
  state: 'idle' | 'active' | 'complete';
  pipelineState: PipelineState;
}) {
  const isDecision = step.id === 'decision';
  const isComplete = state === 'complete';
  const isActive = state === 'active';

  let iconColor = 'rgba(255,255,255,0.2)';
  let labelColor = 'rgba(255,255,255,0.3)';
  let bgColor = 'transparent';
  let borderColor = 'rgba(255,255,255,0.08)';

  if (isActive) {
    iconColor = '#ffffff';
    labelColor = '#ffffff';
    bgColor = 'rgba(255,255,255,0.04)';
    borderColor = 'rgba(255,255,255,0.15)';
  } else if (isComplete) {
    iconColor = 'rgba(255,255,255,0.6)';
    labelColor = 'rgba(255,255,255,0.7)';
    bgColor = 'transparent';
    borderColor = 'rgba(255,255,255,0.06)';
  }

  // Decision complete states
  let decisionLabel = 'Awaiting audit...';
  let decisionIcon = null;

  if (isDecision && isComplete) {
    if (pipelineState === 'pass') {
      decisionLabel = 'PASS — Response approved';
      decisionIcon = <CheckCircle size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />;
    } else if (pipelineState === 'block') {
      decisionLabel = 'BLOCK — Response suppressed';
      decisionIcon = <XCircle size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />;
    }
  }

  return (
    <motion.div
      animate={{ opacity: state === 'idle' ? 0.4 : 1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.625rem 0.75rem',
        borderRadius: '8px',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Status indicator */}
      <div style={{ flexShrink: 0, width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isActive ? (
          <ActiveDot />
        ) : isComplete ? (
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.4)',
          }} />
        ) : (
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
          }} />
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: labelColor, marginBottom: '1px' }}>
          {step.label}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
          {isDecision && isComplete ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {decisionIcon}
              {decisionLabel}
            </span>
          ) : isActive ? (
            step.sublabel
          ) : isComplete ? (
            'Complete'
          ) : (
            'Waiting...'
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ActiveDot() {
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#ffffff',
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
