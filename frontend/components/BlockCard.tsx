'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, ShieldX, TrendingDown } from 'lucide-react';
import type { QueryResponse, DetailedFlag } from '@/lib/api';

interface BlockCardProps {
  result: QueryResponse;
}

const FLAG_LABELS: Record<string, { label: string; severity: 'high' | 'medium' | 'low' }> = {
  hallucinated_contact:     { label: 'Hallucinated contact info',     severity: 'high' },
  unverified_local_entity:  { label: 'Unverified local entity',        severity: 'high' },
  fake_government_data:     { label: 'Fabricated government data',     severity: 'high' },
  overconfident_claim:      { label: 'Overconfident claim',            severity: 'medium' },
  misleading_civic_info:    { label: 'Misleading civic information',   severity: 'high' },
  risky_specificity:        { label: 'Risky specificity',              severity: 'medium' },
  unverifiable_phone_number:{ label: 'Unverifiable phone number',      severity: 'high' },
  invented_address:         { label: 'Invented address',               severity: 'high' },
  lacks_disclaimer:         { label: 'Missing official source disclaimer', severity: 'low' },
  out_of_scope:             { label: 'Out of scope',                   severity: 'low' },
  generator_error:          { label: 'Generator internal error',       severity: 'medium' },
  audit_failure:            { label: 'Audit process failure',          severity: 'medium' },
  scorer_override:          { label: 'Low trust score override',       severity: 'medium' },
};

const SEVERITY_COLORS = {
  high:   { bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.25)', text: 'rgba(248,113,113,0.8)' },
  medium: { bg: 'rgba(251,146,60,0.06)',  border: 'rgba(251,146,60,0.25)',  text: 'rgba(251,146,60,0.8)' },
  low:    { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.1)',  text: 'rgba(255,255,255,0.4)' },
};

export function BlockCard({ result }: BlockCardProps) {
  const trustScore = result.debug?.composite_trust_score ?? null;
  const hallucinationScore = result.debug?.hallucination_score ?? null;
  const detailedFlags = (result.debug?.audit_detailed_flags ?? []) as DetailedFlag[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: 'var(--bg-surface-2)',
        border: '1px solid rgba(248,113,113,0.15)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '0.875rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        background: 'rgba(248,113,113,0.04)',
      }}>
        <ShieldX size={15} style={{ color: 'rgba(248,113,113,0.7)' }} />
        <span style={{
          fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'rgba(248,113,113,0.7)',
        }}>
          Response Blocked
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Trust score */}
          {trustScore != null && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              border: 'rgba(248,113,113,0.25) solid 1px',
              background: 'rgba(248,113,113,0.06)',
              fontSize: '0.62rem', fontWeight: 600, fontFamily: 'monospace',
              color: 'rgba(248,113,113,0.7)',
            }}>
              <TrendingDown size={9} />
              Trust {(trustScore * 100).toFixed(0)}%
            </span>
          )}
          <span style={{
            padding: '0.15rem 0.5rem', borderRadius: '999px',
            border: '1px solid rgba(248,113,113,0.3)',
            background: 'rgba(248,113,113,0.06)',
            fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'rgba(248,113,113,0.8)',
          }}>
            BLOCK
          </span>
          <span style={{
            padding: '0.15rem 0.5rem', borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.65rem', fontWeight: 500, color: 'rgba(255,255,255,0.3)',
          }}>
            Risk: {result.risk_level}
          </span>
        </div>
      </div>

      {/* Warning body */}
      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Reason block */}
        <div style={{
          display: 'flex', gap: '0.875rem',
          padding: '0.875rem 1rem',
          background: 'rgba(248,113,113,0.04)',
          border: '1px solid rgba(248,113,113,0.12)',
          borderRadius: '8px',
        }}>
          <AlertTriangle size={16} style={{ color: 'rgba(248,113,113,0.6)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{
              fontSize: '0.78rem', fontWeight: 600,
              color: 'rgba(255,255,255,0.65)', marginBottom: '0.3rem',
            }}>
              Safety Violation Detected
            </div>
            <p style={{ fontSize: '0.79rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, margin: 0 }}>
              {result.reason}
            </p>
          </div>
        </div>

        {/* Trust metrics row */}
        {(trustScore != null || hallucinationScore != null) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {trustScore != null && (
              <MetricBox
                label="Composite Trust Score"
                value={`${(trustScore * 100).toFixed(0)}%`}
                note="Threshold: ≥60% to pass"
                color="rgba(248,113,113,0.7)"
              />
            )}
            {hallucinationScore != null && (
              <MetricBox
                label="Hallucination Safety"
                value={`${(hallucinationScore * 100).toFixed(0)}%`}
                note="Lower = more risk"
                color={hallucinationScore > 0.5 ? 'rgba(251,146,60,0.7)' : 'rgba(248,113,113,0.7)'}
              />
            )}
          </div>
        )}

        {/* Detected issues — detailed flags */}
        {detailedFlags.length > 0 && (
          <div>
            <div style={{
              fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
              marginBottom: '0.5rem',
            }}>
              Detailed Flag Analysis ({detailedFlags.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {detailedFlags.map((f, i) => {
                const meta = FLAG_LABELS[f.flag];
                const severity = meta?.severity ?? 'medium';
                const colors = SEVERITY_COLORS[severity];
                return (
                  <div key={i} style={{
                    padding: '0.5rem 0.625rem',
                    background: colors.bg, border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  }}>
                    <AlertTriangle size={10} style={{ color: colors.text, marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: colors.text }}>
                          {meta?.label ?? f.flag}
                        </span>
                        <span style={{
                          fontSize: '0.58rem', fontFamily: 'monospace',
                          color: 'rgba(255,255,255,0.2)',
                        }}>
                          {(f.confidence * 100).toFixed(0)}% conf
                        </span>
                      </div>
                      {f.detail && (
                        <div style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.15rem' }}>
                          {f.detail}
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontSize: '0.58rem', padding: '0.1rem 0.3rem',
                      background: colors.bg, border: `1px solid ${colors.border}`,
                      borderRadius: '3px', color: colors.text, flexShrink: 0,
                    }}>
                      {severity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Simple flags fallback */}
        {result.flags.length > 0 && detailedFlags.length === 0 && (
          <div>
            <div style={{
              fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
              marginBottom: '0.5rem',
            }}>
              Detected Issues
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {result.flags.map((flag) => {
                const meta = FLAG_LABELS[flag];
                const severity = meta?.severity ?? 'medium';
                const colors = SEVERITY_COLORS[severity];
                return (
                  <span key={flag} style={{
                    padding: '0.2rem 0.6rem',
                    background: colors.bg, border: `1px solid ${colors.border}`,
                    borderRadius: '4px', fontSize: '0.69rem', color: colors.text,
                  }}>
                    {meta?.label ?? flag}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '0.625rem 1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', margin: 0, lineHeight: 1.6 }}>
          For verified local information, please contact your district government office, official civic portal, or national helplines directly.
        </p>
      </div>
    </motion.div>
  );
}

function MetricBox({ label, value, note, color }: {
  label: string; value: string; note: string; color: string;
}) {
  return (
    <div style={{
      padding: '0.625rem 0.75rem',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '6px',
    }}>
      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', color }}>{value}</div>
      <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.15)', marginTop: '0.1rem' }}>{note}</div>
    </div>
  );
}
