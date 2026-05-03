'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Shield, ExternalLink, TrendingUp } from 'lucide-react';
import type { QueryResponse } from '@/lib/api';

interface ResultCardProps {
  result: QueryResponse;
}

export function ResultCard({ result }: ResultCardProps) {
  const hasCitations = result.citations && result.citations.length > 0;
  const trustScore = result.debug?.composite_trust_score ?? null;
  const trustColor = trustScore != null
    ? trustScore >= 0.7 ? 'rgba(74,222,128,0.8)' : trustScore >= 0.5 ? 'rgba(251,146,60,0.8)' : 'rgba(248,113,113,0.8)'
    : 'rgba(255,255,255,0.4)';

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
        <CheckCircle size={15} style={{ color: 'rgba(74,222,128,0.8)' }} />
        <span style={{
          fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'rgba(74,222,128,0.8)',
        }}>
          Response Approved
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Trust score badge */}
          {trustScore != null && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              border: `1px solid ${trustColor.replace('0.8', '0.3')}`,
              background: trustColor.replace('0.8', '0.06'),
              fontSize: '0.62rem', fontWeight: 600, fontFamily: 'monospace',
              color: trustColor,
            }}>
              <TrendingUp size={9} />
              Trust {(trustScore * 100).toFixed(0)}%
            </span>
          )}
          <span style={{
            padding: '0.15rem 0.5rem', borderRadius: '999px',
            border: '1px solid rgba(74,222,128,0.3)',
            background: 'rgba(74,222,128,0.06)',
            fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'rgba(74,222,128,0.9)',
          }}>
            PASS
          </span>
          <span style={{
            padding: '0.15rem 0.5rem', borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.65rem', fontWeight: 500,
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

      {/* Citations with relevance scores */}
      {hasCitations && (
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', flexDirection: 'column', gap: '0.375rem',
        }}>
          <div style={{
            fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)',
            marginBottom: '0.25rem',
          }}>
            Verified Sources ({result.citations.length})
          </div>
          {result.citations.map((citation, i) => (
            <a
              key={i}
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.375rem 0.5rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                fontSize: '0.73rem', color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none', transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
              }}
            >
              <ExternalLink size={10} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.2)' }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {citation.title || citation.url}
              </span>
              {/* Relevance score bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                <div style={{ width: '36px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                  <div style={{
                    width: `${(citation.relevance_score * 100).toFixed(0)}%`,
                    height: '100%',
                    background: 'rgba(74,222,128,0.5)',
                    borderRadius: '2px',
                  }} />
                </div>
                <span style={{ fontSize: '0.58rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>
                  {(citation.relevance_score * 100).toFixed(0)}%
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: '0.625rem 1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <Shield size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
        <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
          Verified by Verify AI Auditor Agent · {result.reason}
        </span>
      </div>
    </motion.div>
  );
}
