'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { clsx } from 'clsx';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/app', label: 'Assistant' },
  { href: '/demo', label: 'Demo' },
  { href: '/about', label: 'About' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(0,0,0,0.85)',
      }}
    >
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 1.5rem',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} style={{ color: 'rgba(255,255,255,0.8)' }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.05rem',
            color: '#ffffff',
            letterSpacing: '-0.01em',
          }}>
            FairZero
          </span>
          <span style={{
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            marginLeft: '2px',
            marginTop: '2px',
          }}>
            Civic
          </span>
        </Link>

        {/* Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}
