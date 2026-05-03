'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, X } from 'lucide-react';
import { config } from '@/lib/config';

interface PromptBoxProps {
  onSubmit: (prompt: string, apiKey?: string) => void;
  isLoading: boolean;
  onReset?: () => void;
  showResult?: boolean;
}

export function PromptBox({ onSubmit, isLoading, onReset, showResult }: PromptBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
    }
  }, [prompt]);

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt.trim(), apiKey.trim() || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const handleSamplePrompt = (samplePrompt: string) => {
    setPrompt(samplePrompt);
    textareaRef.current?.focus();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Sample prompts */}
      {!showResult && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginRight: '0.25rem', display: 'flex', alignItems: 'center' }}>
            Try:
          </span>
          {config.samplePrompts.map((sp) => (
            <button
              key={sp.label}
              onClick={() => handleSamplePrompt(sp.prompt)}
              style={{
                padding: '0.25rem 0.75rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '999px',
                fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              {sp.label}
            </button>
          ))}
        </div>
      )}

      {/* Main input box */}
      <div style={{
        background: 'var(--bg-surface-3)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask a civic or community question..."
          rows={3}
          style={{
            width: '100%',
            padding: '1rem 1.25rem',
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            resize: 'none',
            outline: 'none',
            minHeight: '80px',
            maxHeight: '240px',
            overflowY: 'auto',
          }}
        />

        {/* Bottom bar */}
        <div style={{
          padding: '0.625rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>
              Ctrl+Enter to send
            </span>
            {/* Demo API key toggle */}
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                padding: '0.15rem 0.5rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.25)',
                cursor: 'pointer',
              }}
            >
              {showApiKey ? 'Hide' : 'API Key'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {showResult && onReset && (
              <button
                onClick={onReset}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                <X size={13} />
                New Query
              </button>
            )}
            <motion.button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1.125rem',
                background: isLoading || !prompt.trim() ? 'rgba(255,255,255,0.05)' : '#ffffff',
                color: isLoading || !prompt.trim() ? 'rgba(255,255,255,0.2)' : '#000000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Processing...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Verify
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* API Key input (demo mode) */}
      {showApiKey && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
          }}
        >
          <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '0.375rem' }}>
            Gemini API Key (session-only, not stored)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              background: 'var(--bg-surface-3)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              outline: 'none',
            }}
          />
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.375rem' }}>
            ⚠ Demo mode only. Use server-side env vars in production.
          </p>
        </motion.div>
      )}
    </div>
  );
}
