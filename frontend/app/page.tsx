'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, CheckCircle, XCircle, Cpu, Search } from 'lucide-react';
import { gsap } from 'gsap';

// ─── Fade-in animation helper ────────────────────────────────────────────────
const FadeUp = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP subtle floating animation on hero glow
    const ctx = gsap.context(() => {
      gsap.to('.hero-glow', {
        y: -20,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          minHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6rem 1.5rem 4rem',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        {/* Background glow */}
        <div
          className="hero-glow"
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '700px',
            height: '500px',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Badge */}
        <FadeUp delay={0}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.3rem 1rem',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '999px',
            marginBottom: '2.5rem',
            background: 'rgba(255,255,255,0.03)',
          }}>
            <Shield size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
            }}>
              Civic AI Safety System
            </span>
          </div>
        </FadeUp>

        {/* Main headline */}
        <FadeUp delay={0.1}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.8rem, 7vw, 6rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            maxWidth: '900px',
            marginBottom: '1.5rem',
          }}>
            AI that verifies
            <br />
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>before it answers.</span>
          </h1>
        </FadeUp>

        {/* Subheadline */}
        <FadeUp delay={0.2}>
          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.5)',
            maxWidth: '560px',
            lineHeight: 1.7,
            marginBottom: '2.5rem',
          }}>
            Verify AI uses a dual-agent pipeline — one AI generates, another audits —
            so community users only receive responses that have been verified for safety.
          </p>
        </FadeUp>

        {/* CTA Buttons */}
        <FadeUp delay={0.3}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/app">
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.95)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 2rem',
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Try Verify AI
                <ArrowRight size={16} />
              </motion.button>
            </Link>
            <Link href="/demo">
              <motion.button
                whileHover={{ borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 1.75rem',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                See Demo
              </motion.button>
            </Link>
          </div>
        </FadeUp>

        {/* Pipeline Visual */}
        <FadeUp delay={0.5}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0',
            marginTop: '4rem',
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {[
              { icon: <Cpu size={14} />, label: 'User Query', sub: 'input' },
              { arrow: true },
              { icon: <Cpu size={14} />, label: 'Generator', sub: 'Agent 1', active: true },
              { arrow: true },
              { icon: <Search size={14} />, label: 'Auditor', sub: 'Agent 2', active: true },
              { arrow: true },
              { icon: <CheckCircle size={14} />, label: 'PASS', sub: 'safe output' },
              { divider: true },
              { icon: <XCircle size={14} />, label: 'BLOCK', sub: 'suppressed' },
            ].map((item, i) => {
              if ('arrow' in item) {
                return (
                  <ArrowRight
                    key={i}
                    size={12}
                    style={{ color: 'rgba(255,255,255,0.15)', margin: '0 0.5rem' }}
                  />
                );
              }
              if ('divider' in item) {
                return (
                  <span key={i} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 0.5rem', fontSize: '0.8rem' }}>/</span>
                );
              }
              return (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '0.25rem 0.5rem',
                }}>
                  <div style={{ color: item.active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: item.active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
                    {item.sub}
                  </span>
                </div>
              );
            })}
          </div>
        </FadeUp>
      </section>

      {/* ── Problem Statement ──────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <FadeUp>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
              }}>
                The Problem
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '1.25rem',
              lineHeight: 1.2,
            }}>
              AI sounds confident.
              <br />
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Even when it's wrong.</span>
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', maxWidth: '560px', lineHeight: 1.75 }}>
              Standard AI systems generate one answer. There's no second check.
              In civic and community contexts — hospital details, government schemes, NGO contacts —
              a wrong answer can cause real harm.
            </p>
          </FadeUp>

          {/* Problem cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginTop: '2.5rem',
          }}>
            {[
              { title: 'Fake NGO Contacts', desc: 'AI invents phone numbers and WhatsApp IDs for NGOs that may not exist.' },
              { title: 'Wrong Hospital Info', desc: 'Incorrect addresses or policies for government hospitals that patients rely on.' },
              { title: 'Fabricated Schemes', desc: 'Hallucinated government scheme names, portals, and eligibility criteria.' },
              { title: 'Overconfident Advice', desc: 'Legal or medical guidance delivered as fact without real verification.' },
            ].map((card) => (
              <motion.div
                key={card.title}
                whileHover={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}
                style={{
                  padding: '1.25rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                  {card.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <FadeUp>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              display: 'block',
              marginBottom: '0.75rem',
            }}>
              How It Works
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '3rem',
              lineHeight: 1.2,
            }}>
              Two agents. One truth.
            </h2>
          </FadeUp>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {[
              {
                step: '01',
                title: 'User enters a civic question',
                desc: 'No login required. Ask about hospitals, legal aid, government schemes, or community resources.',
              },
              {
                step: '02',
                title: 'Agent 1 (Generator) creates a response',
                desc: 'The generator agent uses Gemini to compose a helpful, informative answer focused on community guidance.',
              },
              {
                step: '03',
                title: 'Agent 2 (Auditor) verifies the response',
                desc: 'A separate auditor agent analyzes the output for hallucinations, fake contacts, and risky claims. Returns a structured PASS or BLOCK decision.',
              },
              {
                step: '04',
                title: 'Safe output or warning is shown',
                desc: 'If PASS: the verified response is displayed. If BLOCK: the response is suppressed and a safety warning is shown instead.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{
                  flexShrink: 0,
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: 'monospace',
                }}>
                  {item.step}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.375rem' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                    {item.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────── */}
      <section style={{
        padding: '6rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
      }}>
        <FadeUp>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.6rem, 4vw, 2.6rem)',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}>
            Ready to experience safer civic AI?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            No login. No setup. Just ask.
          </p>
          <Link href="/app">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '0.875rem 2.25rem',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Launch Assistant
              <ArrowRight size={16} />
            </motion.button>
          </Link>
        </FadeUp>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '1.5rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>
          Verify AI (Civic Edition) · Dual-Agent AI Safety System · Built with Gemini
        </p>
      </footer>
    </div>
  );
}
