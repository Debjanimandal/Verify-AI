'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, ShieldX } from 'lucide-react';
import type { QueryResponse } from '@/lib/api';

interface BlockCardProps {
  result: QueryResponse;
}

const FLAG_LABELS: Record<string, string> = {
  hallucinated_contact: 'Hallucinated contact',
  unverified_local_entity: 'Unverified local entity',
  fake_government_data: 'Fake government data',
  overconfident_claim: 'Overconfident claim',
  misleading_civic_info: 'Misleading civic info',
  risky_specificity: 'Risky specificity',
  unverifiable_phone_number: 'Unverifiable phone number',
  invented_address: 'Invented address',
  generator_error: 'Generator error',
  audit_failure: 'Audit process failure',
};

export function BlockCard({ result }: BlockCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: 'var(--bg-surface-2)',
        border: '1px solid rgba(255,255,255,0.10)',
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
        background: 'rgba(255,255,255,0.015)',
      }}>
        <ShieldX size={15} style={{ color: 'rgba(255,255,255,0.5)' }} />
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
        }}>
          Response Blocked
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.12)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
          }}>
            BLOCK
          </span>
          <span style={{
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.65rem',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.3)',
          }}>
            Risk: {result.risk_level}
          </span>
        </div>
      </div>

      {/* Warning message */}
      <div style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          gap: '0.875rem',
          padding: '1rem 1.125rem',
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          marginBottom: '1rem',
        }}>
          <AlertTriangle size={18} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <div style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '0.375rem',
            }}>
              ⚠ FLAGGED: This response was blocked for community safety.
            </div>
            <p style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.6,
            }}>
              {result.reason}
            </p>
          </div>
        </div>

        {/* Flags */}
        {result.flags.length > 0 && (
          <div>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
              marginBottom: '0.5rem',
            }}>
              Detected Issues
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {result.flags.map((flag) => (
                <span
                  key={flag}
                  style={{
                    padding: '0.2rem 0.6rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                    fontSize: '0.69rem',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  {FLAG_LABELS[flag] ?? flag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer guidance */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
          For verified local information, please contact your local government office, district helpline, or official civic portal directly.
        </p>
      </div>
    </motion.div>
  );
}
