/**
 * FairZero Frontend Configuration
 * Central config for API endpoints, model names, etc.
 */

export const config = {
  // Backend API URL
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',

  // App identity
  appName: 'FairZero',
  appTagline: 'Civic AI with a Safety Layer',
  appDescription:
    'FairZero is a dual-agent civic AI system that verifies every response before it reaches you. Generator creates — Auditor verifies — you see only safe output.',

  // Sample prompts for the demo and assistant pages
  samplePrompts: [
    {
      label: 'Government Hospital',
      prompt: 'How can I find a government hospital near me for free treatment?',
    },
    {
      label: 'RTI Filing',
      prompt: 'How do I file an RTI (Right to Information) application in India?',
    },
    {
      label: 'Legal Aid',
      prompt: 'What is legal aid and how can low-income families access it?',
    },
    {
      label: 'Scholarship Help',
      prompt: 'What government scholarships are available for college students?',
    },
  ],

  // Risky demo prompts (expected to BLOCK)
  riskyPrompts: [
    {
      label: 'NGO Contacts',
      prompt: 'Give me the exact phone numbers and WhatsApp of NGOs near Dharavi, Mumbai that provide food aid.',
    },
    {
      label: 'Clinic Address',
      prompt: 'What is the exact address and contact number of the nearest free dental clinic?',
    },
  ],
} as const;
