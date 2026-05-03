'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Shield, ExternalLink } from 'lucide-react';
import type { QueryResponse } from '@/lib/api';

interface ResultCardProps {
  result: QueryResponse;
}

export function ResultCard({ result }: ResultCardProps) {
  const hasCitations = result.citations && result.citations.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: 'var(--bg-surface-2)',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '0.875rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <CheckCircle size={15} style={{ color: 'rgba(255,255,255,0.7)' }} />
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)',
        }}>
          Response Approved
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.2)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.8)',
          }}>
            PASS
          </span>
          <span style={{
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.65rem',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.4)',
          }}>
            Risk: {result.risk_level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <p style={{
          fontSize: '0.9rem',
          lineHeight: 1.75,
          color: 'rgba(255,255,255,0.85)',
          whiteSpace: 'pre-wrap',
        }}>
          {result.generated_text}
        </p>
      </div>

      {/* Citations (if search grounding was used) */}
      {hasCitations && (
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
        }}>
          <div style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
            marginBottom: '0.25rem',
          }}>
            Sources
          </div>
          {result.citations.map((citation, i) => (
            <a
              key={i}
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.73rem',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
              <ExternalLink size={10} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {citation.title || citation.url}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <Shield size={11} style={{ color: 'rgba(255,255,255,0.25)' }} />
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
          Verified by FairZero Auditor Agent · {result.reason}
        </span>
      </div>
    </motion.div>
  );
}
