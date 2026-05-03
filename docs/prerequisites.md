# FairZero (Civic Edition) — Prerequisites

## 1. Purpose of This Document

This document defines the prerequisites that must be in place before building FairZero. It also lists what should not be included in the first version so the project stays focused, simple, and demo-ready.

FairZero is a browser-first civic AI safety system with a dual-agent generator-auditor pipeline. Because the project has a clear product scope, the setup must be disciplined from the start.

---

## 2. What Must Be Ready Before Development Starts

## 2.1 Clear Product Scope
Before writing code, the team must agree that the first version is a no-login, browser-first civic AI safety product.

### Required agreement
- dual-agent architecture
- pass/block decision flow
- community and civic use case focus
- Next.js frontend
- Python backend
- Google Gemini as the main AI layer
- optional LiveKit only if time allows

### Why this matters
If the scope is unclear, the project will grow too quickly and lose the core demo value.

---

## 2.2 Finalized Idea Documents
The following documents should exist and be aligned:

- `idea.md`
- `implementation_plan.md`
- `techstack.md`
- `design.md`

### These documents should agree on:
- project goal
- architecture
- interface style
- technology stack
- model choice
- deployment direction
- no-login policy

---

## 2.3 Repository Structure
A clean repository layout must exist before implementation begins.

### Required folders
- frontend/
- backend/
- docs/
- prompts/
- optional scripts/

### Required files
- README.md
- .gitignore
- environment example file
- package and dependency files

### Why this matters
A clear structure prevents confusion between frontend, backend, and documentation work.

---

## 2.4 Access to Required APIs
The project must have access to the services it depends on.

### Required or optional access
- Gemini API access
- optional LiveKit access
- optional database access if storage is added later

### Required readiness
- API keys available for development
- test keys separated from production-style keys
- secrets stored safely in environment variables

---

## 2.5 Development Environment
Each developer should have a working local environment.

### Required tools
- Node.js for Next.js frontend
- Python 3.11+ for backend
- Git
- package manager such as npm, pnpm, or yarn
- Python dependency installer such as pip or uv

### Recommended tools
- VS Code
- browser developer tools
- terminal access
- environment variable support through `.env`

---

## 2.6 Shared Design Direction
The team must agree on the visual direction before building UI.

### Required design decisions
- black or near-black background
- monochrome color system
- clean card-based layouts
- minimal but premium motion
- strong typography hierarchy
- no colorful clutter

### Why this matters
UI consistency is much easier when the design language is fixed early.

---

## 2.7 Prompt Strategy
The prompts for the generator and auditor must be planned before coding.

### Required prompt files
- generator system prompt
- auditor system prompt

### Required prompt rules
- generator stays helpful and creative
- auditor stays strict and conservative
- auditor returns structured output
- unsafe or uncertain results are blocked

---

## 2.8 Output Contract
The backend must know exactly what the auditor returns.

### Required contract fields
- decision
- risk_level
- reason
- flags

### Required policy
- PASS means show the result
- BLOCK means hide the result and show the warning
- malformed output should default to BLOCK

---

## 2.9 Demo Plan
A demo sequence should be decided early.

### Required demo flow
- landing page introduction
- safe prompt example
- risky prompt example
- visible dual-agent processing
- blocked result demonstration

### Why this matters
The project is meant to communicate its value quickly in a live setting.

---

## 3. What Should Be There

## 3.1 Frontend Must Include
- Next.js App Router structure
- landing page
- main assistant page
- about page
- demo page
- optional voice page
- loading states
- result state display
- error handling view
- debug drawer for judges

---

## 3.2 Backend Must Include
- Python API service
- generator agent wrapper
- auditor agent wrapper
- validation layer
- environment variable handling
- error handling
- structured JSON output parsing

---

## 3.3 Documentation Must Include
- project idea document
- implementation plan
- tech stack document
- design document
- prerequisites document
- README with setup instructions

---

## 3.4 Safety and Validation Must Include
- strict auditor behavior
- JSON schema validation or equivalent parsing checks
- fallback to BLOCK on invalid output
- clear warning message for blocked content
- conservative decision thresholds

---

## 3.5 UI Must Include
- strong title and product identity
- simple call-to-action
- sample prompt helpers
- visible generator state
- visible auditor state
- final safe or blocked panel
- clean spacing and monochrome layout

---

## 3.6 Environment Handling Must Include
- `.env` for secrets
- `.env.example` for setup guidance
- no hardcoded keys in code
- no exposed secrets in frontend bundles

---

## 4. What Should Not Be There in the First Version

## 4.1 No Login System
The first version should not require:
- signup
- login
- user profiles
- password management
- role-based access control

### Why not
These features add friction and are unnecessary for the MVP.

---

## 4.2 No Heavy Infrastructure
Avoid:
- Kubernetes
- microservices
- job queues
- complex event buses
- multi-region deployment
- overengineered observability stacks

### Why not
The first version should stay simple and demo-focused.

---

## 4.3 No Overcomplicated Databases
Avoid building a large schema early.

### Not needed initially
- user account tables
- authentication tables
- large analytics databases
- vector databases unless retrieval is actually required

---

## 4.4 No Overuse of Libraries
Do not add too many libraries just because they exist.

### Avoid in the first build
- unnecessary state libraries
- heavy animation libraries everywhere
- multiple form libraries
- multiple UI kits at once
- large AI orchestration frameworks unless truly required

---

## 4.5 No Color-Heavy Visual Design
Avoid:
- bright gradients as the identity
- rainbow themes
- loud decorative backgrounds
- flashy neon interfaces
- playful cartoon UI styles

### Why not
The project is intended to feel serious, premium, and trustworthy.

---

## 4.6 No Production Secret Exposure
Never:
- place API keys in frontend code
- commit secrets to Git
- log sensitive keys
- store keys in browser localStorage permanently

---

## 4.7 No Weak Safety Logic
Avoid:
- letting the generator decide safety by itself
- weak or vague auditor prompts
- free-form auditor text without structure
- passing questionable answers without review

---

## 5. Required Development Rules

## 5.1 Separation of Concerns
Frontend and backend must remain separate.

### Frontend responsibility
- user interface
- interaction handling
- result rendering

### Backend responsibility
- AI orchestration
- safety decisions
- validation
- tool integration

---

## 5.2 Safety First Policy
If the system is unsure, it must block.

This rule should be followed everywhere:
- prompts
- validation
- UI messaging
- fallback logic

---

## 5.3 Clean Code Rule
The code must remain readable and modular.

### Required coding style
- small files
- clear naming
- separated prompts
- minimal duplication
- helper functions for repeated logic

---

## 5.4 Reproducibility Rule
The project should be easy to run again from scratch.

### Required support
- setup instructions
- dependency list
- environment variable guide
- run commands for frontend and backend

---

## 6. Recommended Pre-Development Checklist

Before implementation begins, confirm the following:

- [ ] Idea document complete
- [ ] Implementation plan complete
- [ ] Stack document complete
- [ ] Design document complete
- [ ] Prerequisites document complete
- [ ] Repo structure finalized
- [ ] Gemini access confirmed
- [ ] Optional LiveKit access confirmed
- [ ] Frontend and backend folder split agreed
- [ ] No-login rule confirmed
- [ ] Black monochrome design confirmed
- [ ] Auditor JSON contract confirmed
- [ ] Demo prompts prepared

---

## 7. Minimum Build Inputs

To start coding, the project should already know:

- the exact app identity
- the target users
- the UI style
- the backend framework
- the AI model choice
- the safety flow
- the output policy
- the folder structure
- the deployment direction

---

## 8. Minimum Build Outputs

The first working version should produce:

- a Next.js frontend
- a Python backend API
- a generator call
- an auditor call
- a PASS/BLOCK decision
- a visible browser interface
- a blocked warning path
- a working end-to-end demo

---

## 9. Final Readiness Rule

FairZero is ready for development only when:

1. the project scope is fixed,
2. the design direction is fixed,
3. the backend and frontend split is fixed,
4. the prompt strategy is fixed,
5. the auditor decision format is fixed,
6. secrets and environment handling are fixed.

If any of these are missing, the project should pause and resolve them first.
