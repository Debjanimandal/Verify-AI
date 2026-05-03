'use client';

import { motion } from 'framer-motion';
import { Shield, Cpu, Search, ArrowRight, CheckCircle, XCircle, GitBranch } from 'lucide-react';

const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      {/* Header */}
      <FadeUp>
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Shield size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
              About FairZero
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
          }}>
            A trust layer for civic AI.
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: '560px' }}>
            FairZero is not just a chatbot. It is a browser-based civic AI safety system
            built to protect community users from harmful or misleading AI-generated information.
          </p>
        </div>
      </FadeUp>

      <Divider />

      {/* Mission */}
      <FadeUp delay={0.05}>
        <Section icon={<Shield size={16} />} label="Mission">
          <h2>Why this exists</h2>
          <p>
            AI systems often generate confident-sounding responses that contain fake NGO phone numbers,
            incorrect hospital details, fabricated government schemes, or dangerously wrong civic guidance.
            In real community contexts, these errors can cause genuine harm.
          </p>
          <p>
            FairZero solves this by introducing a mandatory verification layer between AI generation
            and user delivery. No response reaches a user without passing an independent safety audit.
          </p>
        </Section>
      </FadeUp>

      <Divider />

      {/* Architecture */}
      <FadeUp delay={0.05}>
        <Section icon={<GitBranch size={16} />} label="Architecture">
          <h2>The dual-agent pipeline</h2>
          <p>
            FairZero separates the generation and verification responsibilities into two fully independent agents.
            The agent that creates a response is never the agent that approves it.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1.5rem 0' }}>
            {[
              {
                icon: <Cpu size={15} />,
                title: 'Generator Agent (Agent 1)',
                desc: 'Produces a helpful, informative response to the user\'s civic question. Focuses on clarity and community guidance. Does NOT perform safety judgment.',
              },
              {
                icon: <Search size={15} />,
                title: 'Auditor Agent (Agent 2)',
                desc: 'Independently verifies the generator\'s output. Checks for hallucinated contacts, unverifiable local info, overconfident claims, and misleading civic guidance. Returns structured PASS or BLOCK JSON.',
              },
              {
                icon: <ArrowRight size={15} />,
                title: 'Decision Engine',
                desc: 'Enforces the auditor\'s structured output. Invalid or unparseable audit results default to BLOCK. No bypass possible.',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem 1.125rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '10px',
                }}
              >
                <div style={{ flexShrink: 0, color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', marginBottom: '0.375rem' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.65 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </FadeUp>

      <Divider />

      {/* Safety model */}
      <FadeUp delay={0.05}>
        <Section icon={<Shield size={16} />} label="Safety Model">
          <h2>PASS or BLOCK</h2>
          <p>
            The auditor returns a strict structured JSON object. The decision engine acts on it without interpretation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.6)' }}>PASS</span>
              </div>
              <ul style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, paddingLeft: '1rem' }}>
                <li>General civic guidance</li>
                <li>Safe educational content</li>
                <li>No specific unverifiable details</li>
                <li>Low-risk informational answers</li>
              </ul>
            </div>
            <div style={{
              padding: '1rem',
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <XCircle size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.4)' }}>BLOCK</span>
              </div>
              <ul style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, paddingLeft: '1rem' }}>
                <li>Hallucinated phone numbers</li>
                <li>Fake NGO or clinic contacts</li>
                <li>Unverifiable local addresses</li>
                <li>Overconfident civic claims</li>
              </ul>
            </div>
          </div>

          <div style={{
            padding: '0.875rem 1rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>Default rule: </span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
              When the auditor is uncertain, it blocks. System safety takes priority over completeness.
            </span>
          </div>
        </Section>
      </FadeUp>

      <Divider />

      {/* Tech */}
      <FadeUp delay={0.05}>
        <Section icon={<Cpu size={16} />} label="Technology">
          <h2>How it's built</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
            {[
              ['Frontend', 'Next.js App Router, TypeScript, Tailwind CSS'],
              ['UI Layer', 'shadcn/ui, Framer Motion, GSAP'],
              ['Backend', 'Python FastAPI, Pydantic, Uvicorn'],
              ['AI Engine', 'Google Gemini API (dual-agent)'],
              ['Validation', 'Strict JSON schema, BLOCK-first fallback'],
              ['Security', 'API keys server-side only, no login required'],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '0.25rem' }}>
                  {label}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </FadeUp>

      <Divider />

      {/* Future */}
      <FadeUp delay={0.05}>
        <Section icon={<ArrowRight size={16} />} label="Future Scope">
          <h2>What comes next</h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
            {[
              'Google Search grounding for real-time civic fact verification',
              'Google Maps integration for location-based community queries',
              'Multi-auditor system (Fact, Bias, Logic auditors)',
              'Confidence scoring and audit transparency logs',
              'LiveKit realtime voice interaction',
              'External civic databases for ground-truth verification',
            ].map((item) => (
              <li
                key={item}
                style={{
                  display: 'flex',
                  gap: '0.625rem',
                  alignItems: 'flex-start',
                  fontSize: '0.82rem',
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>→</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>
      </FadeUp>
    </div>
  );
}

function Divider() {
  return (
    <div style={{
      height: '1px',
      background: 'rgba(255,255,255,0.05)',
      margin: '3rem 0',
    }} />
  );
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)' }}>{icon}</div>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {children}
      </div>
    </div>
  );
}
