'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, ChevronDown, ChevronUp, ExternalLink, AlertTriangle, Info } from 'lucide-react';
import type { QueryResponse, DetailedFlag } from '@/lib/api';
import { PipelineGraph } from './PipelineGraph';

interface DebugPanelProps {
  result: QueryResponse;
}

export function DebugPanel({ result }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const d = result.debug;

  const trustScore = d.composite_trust_score ?? 0;
  const trustColor = trustScore >= 0.6
    ? 'rgba(74,222,128,0.8)'
    : trustScore >= 0.4
    ? 'rgba(251,146,60,0.8)'
    : 'rgba(248,113,113,0.8)';

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.72rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          transition: 'color 0.2s ease',
        }}
      >
        <Bug size={12} />
        Debug / Transparency Panel
        {d.duration_ms > 0 && (
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
            ({(d.duration_ms / 1000).toFixed(1)}s)
          </span>
        )}
        {/* Trust score chip in header */}
        <span style={{
          marginLeft: '0.5rem',
          padding: '0.1rem 0.4rem',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.62rem',
          fontFamily: 'monospace',
          color: trustColor,
        }}>
          Trust {(trustScore * 100).toFixed(0)}%
        </span>
        <div style={{ marginLeft: 'auto' }}>
          {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </div>
      </button>

      {/* Debug content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              background: 'rgba(255,255,255,0.01)',
            }}>
              {/* ── Pipeline Graph ─────────────────────────────────────────── */}
              {d.pipeline_stages && d.pipeline_stages.length > 0 && (
                <DebugSection title="Pipeline Execution & Trust Scoring">
                  <PipelineGraph
                    stages={d.pipeline_stages as any}
                    scoring={d.scoring_breakdown as any}
                    decision={result.decision}
                    totalMs={d.duration_ms}
                  />
                </DebugSection>
              )}

              {/* ── Audit Decision ─────────────────────────────────────────── */}
              <DebugSection title="Auditor Output">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <DecisionBadge decision={d.audit_decision} />
                    <RiskBadge risk={d.audit_risk_level} />
                    <ConfidenceBadge confidence={d.audit_confidence} />
                  </div>
                  <div style={{
                    padding: '0.625rem 0.75rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.6,
                  }}>
                    {d.audit_reason}
                  </div>
                </div>

                {/* Detailed flags */}
                {d.audit_detailed_flags && d.audit_detailed_flags.length > 0 && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)',
                    }}>
                      Detailed Flags
                    </span>
                    {(d.audit_detailed_flags as DetailedFlag[]).map((f, i) => (
                      <FlagRow key={i} flag={f} />
                    ))}
                  </div>
                )}

                {/* Simple flags fallback */}
                {d.audit_flags.length > 0 && (!d.audit_detailed_flags || d.audit_detailed_flags.length === 0) && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {d.audit_flags.map((f) => (
                      <span key={f} style={{
                        padding: '0.15rem 0.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '4px',
                        fontSize: '0.62rem',
                        fontFamily: 'monospace',
                        color: 'rgba(255,255,255,0.35)',
                      }}>
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </DebugSection>

              {/* ── Search Grounding ───────────────────────────────────────── */}
              <DebugSection title="Search Grounding">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <DebugRow label="Provider" value={d.search_provider || 'none'} />
                  <DebugRow label="Results" value={String(d.search_results_count)} />
                  <DebugRow label="Location Query" value={d.is_location_query ? 'yes' : 'no'} />
                  <DebugRow label="Source Overlap" value={`${((d.source_overlap_score || 0) * 100).toFixed(1)}%`} />
                </div>
                {d.search_query && d.search_results_count > 0 && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <DebugRow label="Search query" value={d.search_query.slice(0, 100)} />
                  </div>
                )}
              </DebugSection>

              {/* ── Models & Metadata ──────────────────────────────────────── */}
              <DebugSection title="Pipeline Metadata">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <DebugRow label="Request ID" value={d.request_id || '—'} />
                  <DebugRow label="Duration" value={d.duration_ms > 0 ? `${(d.duration_ms / 1000).toFixed(2)}s` : '—'} />
                  <DebugRow label="Generator" value={d.generator_model || '—'} />
                  <DebugRow label="Auditor" value={d.auditor_model || '—'} />
                  <DebugRow label="Embedding sim" value={`${((d.embedding_similarity || 0) * 100).toFixed(1)}%`} />
                  <DebugRow label="Hallucination" value={`${((d.hallucination_score || 0) * 100).toFixed(0)}% safe`} />
                </div>
              </DebugSection>

              {/* ── Citations ──────────────────────────────────────────────── */}
              {result.citations && result.citations.length > 0 && (
                <DebugSection title="Verified Sources">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {result.citations.map((c, i) => (
                      <a
                        key={i}
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.375rem 0.5rem',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          color: 'rgba(255,255,255,0.45)',
                          textDecoration: 'none',
                          transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                      >
                        <ExternalLink size={10} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.25)' }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.title || c.url}
                        </span>
                        <span style={{
                          fontSize: '0.58rem', fontFamily: 'monospace',
                          color: 'rgba(255,255,255,0.2)', flexShrink: 0,
                        }}>
                          {(c.relevance_score * 100).toFixed(0)}%
                        </span>
                      </a>
                    ))}
                  </div>
                </DebugSection>
              )}

              {/* ── Raw Generator Output ────────────────────────────────────── */}
              <DebugSection title="Raw Generator Output (pre-audit)">
                <pre style={{
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.35)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                  margin: 0,
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '0.625rem 0.75rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {d.raw_generated_text || '(empty)'}
                </pre>
              </DebugSection>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DebugSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: '0.62rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.18)',
        marginBottom: '0.5rem',
        paddingBottom: '0.3rem',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {children}
      </div>
    </div>
  );
}

function DebugRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', minWidth: '90px', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
        {value}
      </span>
    </div>
  );
}

function FlagRow({ flag }: { flag: DetailedFlag }) {
  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'flex-start',
      padding: '0.375rem 0.5rem',
      background: 'rgba(248,113,113,0.04)',
      border: '1px solid rgba(248,113,113,0.1)',
      borderRadius: '5px',
    }}>
      <AlertTriangle size={10} style={{ color: 'rgba(248,113,113,0.6)', marginTop: '2px', flexShrink: 0 }} />
      <div>
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(248,113,113,0.7)', fontFamily: 'monospace' }}>
          {flag.flag}
        </span>
        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', marginLeft: '0.4rem' }}>
          ({(flag.confidence * 100).toFixed(0)}% confidence)
        </span>
        {flag.detail && (
          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.1rem' }}>
            {flag.detail}
          </div>
        )}
      </div>
    </div>
  );
}

function DecisionBadge({ decision }: { decision: string }) {
  const isPass = decision === 'PASS';
  return (
    <span style={{
      padding: '0.15rem 0.5rem',
      borderRadius: '4px',
      border: `1px solid ${isPass ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
      background: isPass ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)',
      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
      fontFamily: 'monospace',
      color: isPass ? 'rgba(74,222,128,0.9)' : 'rgba(248,113,113,0.9)',
    }}>
      {decision}
    </span>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const colors: Record<string, string> = {
    low: 'rgba(74,222,128,0.6)',
    medium: 'rgba(251,146,60,0.6)',
    high: 'rgba(248,113,113,0.6)',
  };
  return (
    <span style={{
      padding: '0.15rem 0.5rem',
      borderRadius: '4px',
      border: '1px solid rgba(255,255,255,0.08)',
      fontSize: '0.65rem', fontFamily: 'monospace',
      color: colors[risk] || 'rgba(255,255,255,0.4)',
    }}>
      risk: {risk}
    </span>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  return (
    <span style={{
      padding: '0.15rem 0.5rem',
      borderRadius: '4px',
      border: '1px solid rgba(255,255,255,0.06)',
      fontSize: '0.65rem', fontFamily: 'monospace',
      color: 'rgba(255,255,255,0.3)',
    }}>
      conf: {(confidence * 100).toFixed(0)}%
    </span>
  );
}
