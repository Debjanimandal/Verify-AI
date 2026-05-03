import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';

export const metadata: Metadata = {
  title: 'FairZero — Civic AI Safety System',
  description:
    'FairZero is a dual-agent civic AI system. Generator creates responses. Auditor verifies them. You see only safe output.',
  keywords: ['civic AI', 'AI safety', 'dual-agent', 'hallucination detection', 'community AI'],
  openGraph: {
    title: 'FairZero — Civic AI Safety System',
    description: 'Safer AI for community questions. Every response is verified before you see it.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Nav />
        <main style={{ paddingTop: '60px', minHeight: '100vh' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
