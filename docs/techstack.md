# FairZero (Civic Edition) — Tech Stack Document

## 1. Purpose

This document defines the recommended technology stack for FairZero as a browser-first civic AI product built around a dual-agent safety pipeline.

The goal is to keep the system:
- fast to build
- cleanly separated into frontend and backend
- easy to demo without login
- easy to extend later
- aligned with the current Google/Gemini ecosystem

This is the stack reference for implementation from scratch.

---

## 2. Core Architecture Summary

FairZero should be implemented as a two-layer web system:

### Frontend Layer
A modern Next.js website that contains:
- landing page
- assistant interface
- demo page
- explanation pages
- optional realtime voice UI

### Backend Layer
A Python API that contains:
- generator agent orchestration
- auditor agent orchestration
- response validation
- optional tool calls and grounding logic
- optional database access

### AI Layer
Google Gemini is the primary AI engine.

### Optional Realtime Layer
LiveKit can be used for browser voice or realtime conversation sessions.

### Optional Data Layer
A lightweight database can be added later for logs, sessions, or audit history.

---

## 3. Recommended Stack, Layer by Layer

## 3.1 Frontend: Recommended

### Core framework
- Next.js
- App Router
- TypeScript

### UI and styling
- Tailwind CSS
- shadcn/ui
- Radix UI primitives
- Lucide icons
- Framer Motion for subtle transitions

### Form and input handling
- React Hook Form
- Zod for validation

### State handling
- React state for MVP
- Zustand only if the UI grows larger

### Network and data fetching
- native fetch for simple calls
- TanStack Query only if caching or retries become useful

### Optional realtime UI
- LiveKit React components
- browser audio controls
- conversation status components

### Why this frontend stack
This combination gives the project a polished product feel without making the codebase too heavy.

---

## 3.2 Backend: Recommended

### Core backend framework
- Python
- FastAPI
- Uvicorn

### API and data validation
- Pydantic
- typing module

### Gemini integration
- Google Gen AI SDK for Python
- structured output handling
- function calling support

### Utility libraries
- python-dotenv
- httpx
- tenacity for retries if needed
- logging

### Why this backend stack
FastAPI is lightweight, easy to separate from the frontend, and ideal for a modular AI orchestration service.

---

## 3.3 AI and Model Layer: Recommended

### Main model
- Gemini 3.1 Pro Preview

### Model usage pattern
- Generator Agent: Gemini 3.1 Pro Preview
- Auditor Agent: Gemini 3.1 Pro Preview or a lighter Gemini model if cost later matters

### AI behavior goals
- generation should stay helpful and fluent
- auditing should stay strict and structured
- unsafe results should be blocked before user delivery

---

## 3.4 Realtime and Voice Layer: Optional

### Recommended tool
- LiveKit

### What it can add
- browser voice input
- realtime conversation UX
- stream-style AI interaction
- future multimodal demo support

### When to use it
Only after the text-based web flow is stable.

### Why it is optional
The MVP should still work fully without voice.

---

## 3.5 Database Layer: Recommended Options

For the no-login MVP, a database is not strictly required.

### Best lightweight choices later
- Neon Postgres
- Supabase Postgres
- Google Cloud storage services if the project becomes more Google-native

### What the database is for later
- audit logs
- session history
- blocked query storage
- prompt analytics
- feedback tracking

### MVP rule
Keep the first version stateless unless a database is truly needed.

---

## 4. What Should Be Used

### Use these
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- FastAPI
- Gemini 3.1 Pro Preview
- Pydantic
- Zod
- React Hook Form
- LiveKit only if realtime voice is needed
- Neon or Supabase only if persistent storage is needed

### Use later, not first
- TanStack Query
- Zustand
- Redis
- background queues
- multi-agent orchestration frameworks
- vector databases
- full auth systems

### Keep the first build simple
The most important thing is to get the generator-auditor flow working end to end.

---

## 5. What Should Not Be Used in the First MVP

The following should be avoided unless there is a strong reason:

- heavy auth systems
- user login and signup flows
- complex role-based permissions
- microservice sprawl
- Kubernetes
- overly abstract agent frameworks
- large database schemas
- complex analytics pipelines
- unnecessary vector search in the first version
- multi-provider AI routing in the first version

### Why avoid these
They slow down the demo and add failure points that are not needed for proving the core idea.

---

## 6. Frontend Folder Structure

A clean App Router structure should look like this:

```text
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── app/
│   │   └── page.tsx
│   ├── demo/
│   │   └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── api/
│   │   └── chat/
│   │       └── route.ts
│   └── voice/
│       └── page.tsx
├── components/
│   ├── ui/
│   ├── Hero.tsx
│   ├── PromptBox.tsx
│   ├── AgentStatus.tsx
│   ├── ResultCard.tsx
│   ├── DebugPanel.tsx
│   └── VoicePanel.tsx
├── lib/
│   ├── api.ts
│   ├── config.ts
│   └── utils.ts
├── hooks/
│   └── useFairZero.ts
├── public/
├── styles/
└── package.json
```

### Frontend responsibility split
- `app/` → routing and page composition
- `components/` → reusable UI blocks
- `lib/` → helper functions and API wiring
- `hooks/` → custom behavior hooks

---

## 7. Backend Folder Structure

The Python backend should be separated cleanly from the frontend.

```text
backend/
├── main.py
├── config.py
├── requirements.txt
├── .env
├── agents/
│   ├── __init__.py
│   ├── generator.py
│   └── auditor.py
├── schemas/
│   ├── __init__.py
│   └── audit.py
├── prompts/
│   ├── generator.md
│   └── auditor.md
├── services/
│   ├── gemini_client.py
│   ├── audit_service.py
│   └── tool_service.py
├── utils/
│   ├── __init__.py
│   ├── validation.py
│   └── logger.py
└── tests/
    └── test_audit_contract.py
```

### Backend responsibility split
- `agents/` → agent wrappers
- `schemas/` → structured response models
- `services/` → orchestration and external calls
- `utils/` → parsing, logging, validation
- `tests/` → minimal safety and contract tests

---

## 8. File Structure for the Full Project

A good top-level structure is:

```text
fairzero/
├── frontend/
├── backend/
├── docs/
│   ├── idea.md
│   ├── implementation_plan.md
│   └── techstack.md
├── prompts/
├── scripts/
├── .gitignore
├── README.md
└── docker-compose.yml
```

This keeps the website and backend independent while still living in one repository.

---

## 9. Deployment Stack

## 9.1 Frontend Deployment
Recommended options:
- Vercel Hobby for quick Next.js deployment
- or a comparable static/edge host if needed

Why:
- easy Next.js support
- simple preview deployments
- good for demo links

## 9.2 Backend Deployment
Recommended options:
- Google Cloud Run
- Render free web service

Why:
- backend can run as a container or web service
- easy Python deployment
- good fit for API-based orchestration

## 9.3 Database Deployment
Recommended options:
- Neon free Postgres
- Supabase free Postgres

Why:
- easy signup
- free starting plan
- enough for small logs or session storage

---

## 10. Free or Low-Cost Services to Consider

These are good for a hackathon or early prototype.

### Frontend hosting
- Vercel Hobby

### Backend hosting
- Google Cloud Run free tier usage
- Render free web services

### Database
- Neon free plan
- Supabase free plan

### Realtime voice or agent layer
- LiveKit cloud or self-hosted LiveKit development setup

### AI access
- Google AI Studio / Gemini API key

### Optional Google services
- Google Cloud project for deployment and service management

---

## 11. API Keys and Secret Management

The project will require several secrets.

### Required keys
- Gemini API key
- optional LiveKit API key and secret
- optional database credentials
- optional deployment environment secrets

### Important security rule
Never hardcode keys in frontend code.

### Recommended handling
- store secrets in backend environment variables
- keep browser-side keys only for temporary demo/testing flow if absolutely necessary
- never persist user-entered API keys in localStorage or a database
- never expose production secrets in the browser bundle

---

## 12. Browser Input for API Keys

For development or demo verification, the browser can accept a temporary Gemini API key input field.

### Safe rule for this feature
This should only be used as a temporary session-level testing mode.

### Recommended behavior
- user pastes key into a secure browser form
- the frontend sends it only to the backend for that session
- the backend uses it for that run only
- the key is not saved permanently
- the app warns that production deployment should use server-side environment variables instead

### Why this is useful
It lets judges or developers test the system without needing a full account-based setup.

### What not to do
- do not store keys in plain browser storage
- do not expose keys in client-side JavaScript bundles
- do not log keys

---

## 13. Multiple Gemini API Keys

The system can support multiple Gemini keys in a controlled way.

### Good use cases
- key rotation for testing
- separate keys for generator and auditor in development
- fallback key during demos
- team-specific keys if multiple people are testing

### Recommended key strategy
- one primary server-side key for production-style runs
- optional secondary key for local testing or backup
- optional browser-pasted temporary key only for demo verification

### What not to do
Do not make the frontend depend on permanent user-provided keys in production.

---

## 14. Backend Priority Rules

The backend should be treated as the core product logic layer.

### Backend must own
- Gemini calls
- prompt injection
- audit decisions
- JSON validation
- safety rules
- tool orchestration
- any future database access

### Frontend must only
- collect user input
- display loading and results
- send requests to backend
- render state transitions

This keeps the product maintainable and secure.

---

## 15. Interface Pages to Build

### Landing page
- project summary
- CTA
- safety explanation
- how-it-works section

### Assistant page
- prompt input
- generator loading state
- auditor loading state
- final answer or block message

### Demo page
- prefilled prompts
- judge-friendly interface
- debug panel

### About page
- architecture explanation
- trust model explanation
- project goals

### Voice page
- optional LiveKit room or voice panel
- microphone button
- realtime interaction view

---

## 16. Suggested Frontend Libraries by Need

### Styling
- Tailwind CSS
- shadcn/ui
- Radix UI

### Animation
- Framer Motion

### Icons
- Lucide React

### Validation
- Zod
- React Hook Form

### Optional charts / stats later
- Recharts

### Optional data fetching improvements
- TanStack Query

### Optional realtime voice
- LiveKit React components

---

## 17. Suggested Backend Libraries by Need

### API layer
- FastAPI
- Uvicorn

### AI integration
- Google Gen AI SDK for Python

### Validation
- Pydantic

### Environment loading
- python-dotenv

### HTTP support
- httpx

### Retry handling
- tenacity

### Logging
- standard logging module

### Testing
- pytest

---

## 18. What Each Layer Should Not Contain

### Frontend should not contain
- secret keys
- audit rules that must stay authoritative
- raw Gemini orchestration logic
- database credentials

### Backend should not contain
- React components
- layout styling code
- browser-only state logic

This separation makes the code easier to maintain.

---

## 19. Recommended Data Flow

```text
User Browser
   ↓
Next.js Frontend
   ↓
Python Backend API
   ↓
Gemini Generator
   ↓
Gemini Auditor
   ↓
Validation Layer
   ↓
Frontend Result State
```

### Optional later flow
- backend also queries search, maps, or custom data services
- auditor gets more context before deciding PASS or BLOCK

---

## 20. Minimal MVP Stack Recommendation

If the goal is the fastest good-quality build, use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- FastAPI
- Google Gen AI SDK
- Gemini 3.1 Pro Preview
- Pydantic
- Vercel Hobby for frontend
- Cloud Run or Render for backend
- Neon or Supabase only if data storage is needed

This is the cleanest balance between speed and quality.

---

## 21. Stack to Avoid for the First Build

Avoid these in the first version unless required:

- MongoDB if you only need simple audit logs
- multiple frontend frameworks
- large UI kits that slow customization
- complex auth providers
- full microservice architecture
- vector DBs before grounding is needed
- event streaming systems
- overengineering realtime voice before text flow works

---

## 22. Security and Privacy Notes

### API keys
- must stay server-side whenever possible

### User input
- must be treated as untrusted

### Audit logs
- should avoid storing sensitive information unnecessarily

### Demo mode
- temporary browser key input is okay only for testing and should be clearly marked as temporary

---

## 23. Suggested Build Order

1. create repository structure
2. build Next.js frontend shell
3. build Python FastAPI backend shell
4. connect frontend to backend
5. add generator call
6. add auditor call
7. validate JSON output
8. render PASS/BLOCK UI
9. add loading states and polish
10. add optional voice or database integrations later

---

## 24. Final Recommendation

The best stack for FairZero is a modular two-folder architecture:

- frontend = Next.js App Router + modern UI libraries
- backend = Python FastAPI + Gemini orchestration
- AI = Gemini 3.1 Pro Preview
- realtime = LiveKit only if needed
- database = optional free-tier service only when required

This keeps the project clean, demo-friendly, and future-proof.
