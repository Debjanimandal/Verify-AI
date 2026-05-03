# FairZero (Civic Edition) — Idea Document v2

## 1. Project Identity

**Project Name:** FairZero (Civic Edition)

**Project Type:** Browser-first dual-agent civic AI safety system

**Primary Stack:**
- Frontend: Next.js with App Router
- Backend: Python services for agent orchestration
- AI Core: Google Gemini, with the latest official Gemini 3.1 Pro Preview model as the main reasoning model
- Realtime Layer: LiveKit for optional browser voice and live interaction components
- Database: lightweight or modular, depending on stage

**Login Policy for MVP:**
- No login required
- Public demo access only
- Input-first, frictionless experience

---

## 2. One-Line Summary

FairZero is a civic AI website where one AI agent generates a community-help answer and another AI agent audits it before it reaches the user, so harmful or unverified local information can be blocked in real time.

---

## 3. Why This Version Exists

This version of the project is designed for a polished web product instead of only a simple prototype. The goal is to build a complete browser experience that can be shown, tested, and extended.

The new focus is:
- Next.js App Router based frontend
- clear website interfaces
- browser-ready AI interaction flow
- optional realtime voice or agent interaction with LiveKit
- Python backend for model orchestration and verification logic
- a clean no-login MVP that is easy to demo

---

## 4. Core Problem

People often ask AI for local or civic information such as:
- NGO contacts
- hospital or clinic help
- government scheme guidance
- legal aid support
- educational support
- community resource discovery

The problem is that AI can sound confident even when it is wrong. In civic use cases, that is dangerous.

FairZero solves this by making the answer pass through a second independent AI safety layer before it is shown.

---

## 5. Core Product Idea

### Generator Agent
The first AI agent writes the answer.

### Auditor Agent
The second AI agent checks whether the answer is safe, factual enough, and not obviously hallucinated.

### Final Rule
- If the answer is safe, show it.
- If the answer is risky, block it.

This creates a simple, explainable trust model.

---

## 6. Product Vision

FairZero is not only a chatbot. It is a browser-based civic trust layer.

The website should make the following obvious to the user:
1. A question is entered.
2. An AI generates an answer.
3. A second AI audits it.
4. The user only sees the final safe result.

The experience should feel modern, calm, and very clear.

---

## 7. Official Model Direction

The project should use the current official Gemini 3.1 Pro Preview model as the main advanced reasoning model, because Google’s current Gemini docs describe it as a stronger model for complex tasks, better thinking, and agentic workflows.

The implementation should stay model-agnostic enough to switch model IDs later if Google updates naming again, but the documentation and code defaults should point to Gemini 3.1 Pro Preview.

---

## 8. Website Experience

The app should feel like a real product, not just a hackathon script.

### Website goals
- clean landing page
- visible value proposition
- interactive chat or query panel
- visible audit process
- clear safety status
- easy demo flow

### Design language
- modern
- minimal
- trustworthy
- civic and public-service oriented
- polished but not overly complex

---

## 9. Main Pages and Interfaces

## 9.1 Landing Page
The landing page introduces the project.

### Must include
- project name
- short slogan
- what the product does
- why it matters for communities
- CTA button to launch the experience

### Suggested sections
- hero banner
- problem statement
- how it works
- safety explanation
- sample use cases
- start demo button

---

## 9.2 Main Assistant Page
This is the core interaction page.

### Must include
- user prompt box
- submit button
- status indicators for each agent
- generated answer area
- audit result area
- safe/block output panel

### Optional additions
- topic chips
- example prompts
- recent prompt history for the session only
- debug panel for judges

---

## 9.3 Safety Explanation Panel
A dedicated panel should explain the trust model.

### Content
- Generator writes
- Auditor checks
- Unsafe information is blocked
- The user sees only verified output

This panel should be short and visually easy to understand.

---

## 9.4 Optional Realtime Voice Interface
If LiveKit is added, the site can support voice-based civic queries.

### Use cases
- speaking a question instead of typing
- live assistant responses
- browser-based realtime interaction

### Why LiveKit fits
LiveKit provides browser SDKs and agent tooling for realtime AI experiences, including React components and routes for browser token generation.

This should remain optional for the MVP so the website can still work fully without voice.

---

## 10. End-to-End User Flow

### Flow A: Text Query
1. User opens the website.
2. User enters a civic question.
3. The frontend shows a generator loading state.
4. The backend sends the prompt to Gemini 3.1 Pro Preview.
5. Generator returns a response.
6. The backend sends the response to the auditor.
7. The auditor returns PASS or BLOCK.
8. The frontend displays the approved output or warning.

### Flow B: Voice Query
1. User enters the voice interface.
2. Voice is captured in the browser.
3. The speech is converted to text.
4. The same generator-auditor flow runs.
5. The final answer is displayed and optionally spoken back.

### Flow C: Blocked Risky Query
1. User asks for exact local contact information.
2. Generator creates a potentially risky answer.
3. Auditor detects risk.
4. Final output is blocked.
5. The UI shows a safety warning.

---

## 11. Frontend Architecture

### Framework
- Next.js App Router

### Why App Router
The App Router supports the modern Next.js architecture with React Server Components, server actions, streaming, and route-based layout composition.

### Frontend responsibilities
- render pages and UI states
- collect user input
- call backend APIs
- show loading and result states
- render safety explanations
- keep the browser experience polished

---

## 12. Recommended Frontend Routes

```text
/                  Landing page
/app               Main assistant experience
/about             Product explanation
/demo              Optional focused demo screen
/api/...           Backend-connected routes
```

### Route behavior
- Landing page should focus on clarity and trust.
- The assistant page should focus on interaction.
- The demo route should be optimized for judges and presenters.

---

## 13. Frontend UI Components

### 13.1 Hero Section
- title
- subtitle
- CTA button
- trust message

### 13.2 Input Composer
- text area or input field
- send button
- optional voice button
- sample prompt buttons

### 13.3 Agent Status Cards
Show each step clearly:
- Agent 1 Generating
- Agent 2 Auditing
- Final Decision

### 13.4 Result Display
- safe result card
- blocked warning card
- optional reason panel

### 13.5 Debug / Transparency Drawer
A hidden panel for technical validation.

Possible contents:
- raw generator response
- auditor JSON
- audit flags
- final decision

---

## 14. Backend Architecture

The backend should be separate from the frontend so the system stays modular.

### Recommended backend style
- Python FastAPI or similar lightweight Python API layer

### Backend responsibilities
- receive query from frontend
- call generator model
- call auditor model
- validate the auditor response
- return final structured output to the frontend

### Why Python
- easy Gemini integration
- easy parsing and validation
- easy future database integration
- easy function calling support

---

## 15. AI Agent Design

## 15.1 Agent 1: Generator
The generator’s job is to create a useful response.

### Behavior
- friendly
- informative
- fast
- community-oriented

### Constraints
- do not overthink safety at generation time
- do not do the audit internally
- do not hide behind refusal unless clearly necessary

### Output style
- practical explanation
- readable text
- general civic guidance

---

## 15.2 Agent 2: Auditor
The auditor’s job is to inspect the generator output.

### Checks
- hallucinated phone numbers
- unverifiable local contacts
- fake organizations
- unsupported civic claims
- misleading certainty
- risky factual confidence

### Output style
The auditor should return strict structured output, not a long essay.

### Default rule
When unsure, block.

---

## 16. Decision Contract

The auditor should return a JSON object that the backend can safely parse.

### PASS example
```json
{
  "decision": "PASS",
  "risk_level": "low",
  "reason": "No unsafe or unverified local information detected.",
  "flags": []
}
```

### BLOCK example
```json
{
  "decision": "BLOCK",
  "risk_level": "high",
  "reason": "Contains unverifiable local contact information.",
  "flags": ["hallucinated_contact", "unverified_local_entity"]
}
```

### Parsing rule
If the JSON is invalid, the system should block for safety.

---

## 17. Google Gemini Usage Plan

The current Google docs describe Gemini 3.1 Pro Preview as suited for complex reasoning and agentic workflows.

### How the system should use Gemini
- Agent 1 uses Gemini 3.1 Pro Preview or a lighter model depending on speed needs
- Agent 2 uses the same model class or a cheaper smaller model for strict auditing
- The architecture should support switching model IDs in one config file

### Why this matters
- easier model upgrades
- easier experimentation
- easier cost control
- better long-term maintainability

---

## 18. Optional Google Capabilities to Add Later

### 18.1 Google Search Grounding
Use for queries where current information matters.

### 18.2 Google Maps Grounding
Use for location-based civic help.

### 18.3 Function Calling
Use when the assistant needs to query real systems or custom databases.

### 18.4 Structured Outputs
Use for the auditor and any future policy decisions.

---

## 19. LiveKit Integration Plan

LiveKit should be treated as an optional realtime enhancement.

### Potential browser features
- voice input
- voice response
- live agent session
- realtime communication panel

### Why it fits the project
LiveKit supports browser-based realtime AI experiences and provides React components plus Next.js token route patterns for secure session setup.

### MVP rule
If time is limited, keep LiveKit modular so the text-based website still works fully without it.

---

## 20. Database Plan

For the MVP, no login means no user account database is required.

### Possible lightweight storage
- session-only in memory
- temporary logs
- optional SQLite for local runs

### Future database ideas
- audit logs
- blocked prompt history
- session analytics
- prompt category stats
- feedback tracking

### MVP rule
Do not overbuild the database layer unless the demo needs it.

---

## 21. No-Login Policy

The system should avoid authentication during the MVP.

### Why
- faster access
- better demo experience
- less setup friction
- fewer failure points

### What this means
- anyone can open the site
- no sign-in screen
- no account creation
- no profile setup

### Later possibility
Login can be added once the safety product is mature.

---

## 22. Implementation Phases

### Phase 1: Web MVP
- Next.js app
- hero page
- assistant page
- backend API route or Python service
- generator-agent call
- auditor-agent call
- PASS/BLOCK output

### Phase 2: Better UX
- better animations
- smooth loading states
- sample prompts
- transparency drawer
- polished design system

### Phase 3: Realtime Upgrade
- LiveKit voice interface
- live conversation flow
- realtime status updates

### Phase 4: Grounding and Verification
- Google Search grounding
- Google Maps grounding
- external civic data integration
- custom verification functions

---

## 23. Suggested Code Architecture

```text
fairzero/
├── app/
│   ├── page.tsx
│   ├── app/
│   │   └── page.tsx
│   ├── demo/
│   │   └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   └── api/
│       └── chat/
│           └── route.ts or proxy layer
├── components/
│   ├── Hero.tsx
│   ├── PromptBox.tsx
│   ├── AgentStatus.tsx
│   ├── ResultCard.tsx
│   ├── DebugPanel.tsx
│   └── VoicePanel.tsx
├── backend/
│   ├── main.py
│   ├── agents/
│   │   ├── generator.py
│   │   └── auditor.py
│   └── utils/
│       └── validation.py
├── prompts/
│   ├── generator.md
│   └── auditor.md
├── lib/
│   ├── gemini.ts
│   ├── api.ts
│   └── config.ts
├── public/
├── docs/
│   ├── idea.md
│   └── implementation_plan.md
└── README.md
```

---

## 24. API Flow

### Frontend to Backend
The frontend sends:
- user prompt
- optional session metadata
- optional mode selection

### Backend to Generator
The backend sends:
- system prompt
- user prompt
- optional grounding instructions

### Backend to Auditor
The backend sends:
- original user prompt
- raw generated response
- audit policy

### Backend to Frontend
The backend returns:
- final decision
- displayable text
- reason
- flags

---

## 25. Safety Strategy

The MVP should be conservative.

### Block triggers
- exact contact numbers without support
- suspicious local claims
- invented civic entities
- misleading certainty
- unverified medical or legal guidance

### Safe behavior
- general guidance may pass
- verified-style caution may pass
- vague but harmless answers may pass if low-risk

### Default fallback
Any uncertainty in the auditor should result in BLOCK.

---

## 26. UI Copy Strategy

The words on the screen should be simple and explanatory.

### Suggested status copy
- Agent 1 Generating...
- Agent 2 Auditing for Safety...
- Safe response approved
- Flagged for unverified local information

### Suggested warning text
"⚠️ FLAGGED: This response contained unverified local information. For community safety, it has been blocked."

---

## 27. Demo Strategy

The demo should feel like a product story.

### Demo sequence
1. show the landing page
2. explain the dual-agent model
3. submit a safe community question
4. show the generator-auditor flow
5. submit a risky local contact question
6. show the block result
7. mention future LiveKit and grounding expansion

### Demo line
"FairZero lets AI answer civic questions, but only after a second AI checks whether the response is safe enough to show."

---

## 28. Quality Requirements

The implementation should be judged on:
- clarity
- browser polish
- visible safety flow
- easy explanation
- working end-to-end path
- no-login simplicity
- modular future-ready design

---

## 29. Acceptance Criteria

The project is complete for the MVP if:
- the Next.js site loads successfully
- users can ask questions without login
- the generator response appears in the pipeline
- the auditor returns a strict structured decision
- safe answers are shown
- risky answers are blocked
- the UI clearly shows both agent stages
- the app feels like a real web product

---

## 30. Final Product Definition

FairZero is a browser-based civic AI trust system built with Next.js App Router, a Python backend, and Google Gemini as the core reasoning engine. The product is designed to let users ask community-related questions while a second AI agent audits the answer before delivery. The first version is login-free, visually clear, and optimized for demo impact. The architecture is intentionally modular so it can later add LiveKit realtime voice, Google grounding, external databases, and richer verification workflows.
