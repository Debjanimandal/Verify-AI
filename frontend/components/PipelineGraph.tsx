'use client';

import { motion } from 'framer-motion';
import type { PipelineStage, ScoringBreakdown } from '@/lib/api';

interface PipelineGraphProps {
  stages: PipelineStage[];
  scoring?: ScoringBreakdown | null;
  decision: 'PASS' | 'BLOCK';
  totalMs: number;
}

// Color mapping for stages
const STAGE_COLORS: Record<string, { bg: string; border: string; dot: string }> = {
  'Search Grounding': { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.3)', dot: '#818cf8' },
  'Generator Agent': { bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.25)', dot: '#4ade80' },
  'Auditor Agent':   { bg: 'rgba(251,146,60,0.06)', border: 'rgba(251,146,60,0.25)', dot: '#fb923c' },
  'Trust Scorer':    { bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.25)', dot: '#c084fc' },
  'Decision Engine': { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.15)', dot: '#ffffff' },
};

const STATUS_ICONS: Record<string, string> = {
  complete: '✓',
  error: '✗',
  skipped: '–',
};

export function PipelineGraph({ stages, scoring, decision, totalMs }: PipelineGraphProps) {
  const totalBarMs = Math.max(totalMs, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
        }}>
          Pipeline Execution Graph
        </span>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
          {(totalMs / 1000).toFixed(2)}s total
        </span>
      </div>

      {/* Gantt-style timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {stages.map((stage, i) => {
          const colors = STAGE_COLORS[stage.name] || {
            bg: 'rgba(255,255,255,0.02)',
            border: 'rgba(255,255,255,0.1)',
            dot: 'rgba(255,255,255,0.4)',
          };
          const widthPct = Math.max((stage.duration_ms / totalBarMs) * 100, 4);
          const isError = stage.status === 'error';
          const isSkipped = stage.status === 'skipped';

          return (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
            >
              {/* Stage row */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                {/* Dot */}
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: isError ? '#f87171' : isSkipped ? 'rgba(255,255,255,0.15)' : colors.dot,
                  flexShrink: 0,
                }} />
                {/* Stage name */}
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', minWidth: '120px' }}>
                  {stage.name}
                </span>
                {/* Status badge */}
                <span style={{
                  fontSize: '0.62rem',
                  fontFamily: 'monospace',
                  color: isError ? '#f87171' : isSkipped ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)',
                }}>
                  {STATUS_ICONS[stage.status]} {stage.status !== 'skipped' ? `${stage.duration_ms.toFixed(0)}ms` : 'skipped'}
                </span>
                {/* Details */}
                {stage.details && (
                  <span style={{
                    fontSize: '0.62rem',
                    color: 'rgba(255,255,255,0.2)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    · {stage.details}
                  </span>
                )}
              </div>

              {/* Bar */}
              {!isSkipped && (
                <div style={{
                  marginLeft: '14px',
                  height: '4px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ delay: i * 0.07 + 0.2, duration: 0.5, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: isError ? '#f87171' : colors.dot,
                      borderRadius: '2px',
                      opacity: 0.7,
                    }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Trust score dimensions — if scoring available */}
      {scoring && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
            marginBottom: '0.5rem',
          }}>
            5-Dimension Trust Score
          </div>

          {/* Composite score ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <CompositeRing score={scoring.composite_trust_score} decision={decision} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>
                Composite Trust Score
              </div>
              <div style={{
                fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace',
                color: scoring.composite_trust_score >= 0.6 ? 'rgba(74,222,128,0.9)' : 'rgba(248,113,113,0.9)',
              }}>
                {(scoring.composite_trust_score * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.1rem' }}>
                Recommended: {scoring.recommended_decision} · Confidence: {(scoring.confidence * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Dimension bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {[
              scoring.factual_accuracy,
              scoring.specificity_risk,
              scoring.source_coverage,
              scoring.consistency,
              scoring.hallucination_risk,
            ].map((dim, i) => (
              <DimensionBar key={dim.name} dim={dim} index={i} />
            ))}
          </div>

          {/* Similarity metrics */}
          <div style={{
            marginTop: '0.75rem',
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '0.4rem',
          }}>
            <MetricChip
              label="Embedding Similarity"
              value={`${(scoring.embedding_similarity * 100).toFixed(1)}%`}
              sub="TF-IDF cosine (prompt↔response)"
            />
            <MetricChip
              label="Source Overlap"
              value={`${(scoring.source_overlap_score * 100).toFixed(1)}%`}
              sub="Response backed by sources"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CompositeRing({ score, decision }: { score: number; decision: 'PASS' | 'BLOCK' }) {
  const pct = Math.min(Math.max(score, 0), 1);
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ * (1 - pct);
  const color = pct >= 0.6 ? '#4ade80' : pct >= 0.4 ? '#fb923c' : '#f87171';

  return (
    <svg width="56" height="56" style={{ flexShrink: 0 }}>
      {/* Background ring */}
      <circle
        cx="28" cy="28" r={radius}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"
      />
      {/* Score arc */}
      <motion.circle
        cx="28" cy="28" r={radius}
        fill="none" stroke={color} strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circ}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '28px 28px' }}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* Center text */}
      <text x="28" y="33" textAnchor="middle"
        fontSize="11" fontWeight="700" fontFamily="monospace"
        fill={color}>
        {(pct * 100).toFixed(0)}
      </text>
    </svg>
  );
}

function DimensionBar({ dim, index }: {
  dim: { name: string; score: number; weight: number; explanation: string };
  index: number;
}) {
  const DIM_COLORS = ['#818cf8', '#4ade80', '#fb923c', '#c084fc', '#38bdf8'];
  const color = DIM_COLORS[index % DIM_COLORS.length];
  const pct = dim.score * 100;

  return (
    <div title={dim.explanation}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
        <span style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.4)' }}>{dim.name}</span>
        <span style={{ fontSize: '0.66rem', fontFamily: 'monospace', color }}>
          {pct.toFixed(0)}% <span style={{ color: 'rgba(255,255,255,0.2)' }}>×{dim.weight}</span>
        </span>
      </div>
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.1 + index * 0.06, duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: '2px', opacity: 0.75 }}
        />
      </div>
    </div>
  );
}

function MetricChip({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{
      padding: '0.5rem 0.625rem',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '6px',
    }}>
      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', marginBottom: '0.15rem' }}>{label}</div>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)' }}>{value}</div>
      <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.15)', marginTop: '0.1rem' }}>{sub}</div>
    </div>
  );
}
