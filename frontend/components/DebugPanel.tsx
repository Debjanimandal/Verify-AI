'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { QueryResponse } from '@/lib/api';

interface DebugPanelProps {
  result: QueryResponse;
}

export function DebugPanel({ result }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const d = result.debug;

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
          <span style={{ marginLeft: '0.5rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
            ({(d.duration_ms / 1000).toFixed(1)}s)
          </span>
        )}
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
              gap: '1rem',
              background: 'rgba(255,255,255,0.015)',
            }}>
              {/* Pipeline metadata */}
              <DebugSection title="Pipeline Metadata">
                <DebugRow label="Request ID" value={d.request_id || '—'} />
                <DebugRow label="Duration" value={d.duration_ms > 0 ? `${(d.duration_ms / 1000).toFixed(2)}s` : '—'} />
                <DebugRow label="Stage" value={d.stage} />
              </DebugSection>

              {/* Models */}
              <DebugSection title="Models Used">
                <DebugRow label="Generator" value={d.generator_model || '—'} />
                <DebugRow label="Auditor" value={d.auditor_model || '—'} />
              </DebugSection>

              {/* Search grounding */}
              <DebugSection title="Search Grounding">
                <DebugRow label="Provider" value={d.search_provider || 'none (no API key)'} />
                <DebugRow label="Results" value={String(d.search_results_count)} />
                <DebugRow label="Location query" value={d.is_location_query ? 'yes' : 'no'} />
                {d.search_query && d.search_results_count > 0 && (
                  <DebugRow label="Search query" value={d.search_query.slice(0, 80)} />
                )}
              </DebugSection>

              {/* Audit Result */}
              <DebugSection title="Auditor Output">
                <DebugRow label="Decision" value={d.audit_decision} />
                <DebugRow label="Risk Level" value={d.audit_risk_level} />
                <DebugRow label="Confidence" value={d.audit_confidence != null ? `${(d.audit_confidence * 100).toFixed(0)}%` : '—'} />
                <DebugRow label="Reason" value={d.audit_reason} />
                {d.audit_flags.length > 0 && (
                  <DebugRow label="Flags" value={d.audit_flags.join(', ')} />
                )}
              </DebugSection>

              {/* Raw Generated Text */}
              <DebugSection title="Raw Generator Output">
                <pre style={{
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.4)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                  margin: 0,
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}>
                  {d.raw_generated_text || '(empty)'}
                </pre>
              </DebugSection>

              {/* Citations from search */}
              {result.citations && result.citations.length > 0 && (
                <DebugSection title="Search Citations">
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
                          gap: '0.375rem',
                          fontSize: '0.72rem',
                          color: 'rgba(255,255,255,0.45)',
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={10} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.title || c.url}
                        </span>
                      </a>
                    ))}
                  </div>
                </DebugSection>
              )}
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
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.2)',
        marginBottom: '0.5rem',
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
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', minWidth: '100px', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
        {value}
      </span>
    </div>
  );
}
