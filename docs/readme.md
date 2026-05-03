# FairZero (Civic Edition)

## 🛡️ Overview

FairZero is a browser-first **dual-agent AI safety system** designed to prevent harmful or misleading AI-generated civic information.

Instead of relying on a single AI model, FairZero separates responsibilities into two independent agents:

* **Generator Agent** → produces the answer
* **Auditor Agent** → verifies the answer before it reaches the user

Only responses that pass the audit are shown. Risky or unverifiable responses are blocked.

---

## 🚀 Core Idea

Traditional AI:

```
User → AI → Output (may contain hallucinations)
```

FairZero:

```
User → Generator → Auditor → Output (safe or blocked)
```

This ensures that users—especially in community and civic contexts—receive **safer, more trustworthy information**.

---

## 🎯 Problem Statement

AI systems often:

* generate fake NGO contacts
* provide incorrect hospital or civic details
* fabricate government schemes
* sound confident even when wrong

In real-world community use, this can cause harm.

FairZero solves this by introducing a **verification layer before delivery**.

---

## 🧠 System Architecture

### Core Pipeline

```
User Input
   ↓
Generator Agent (Gemini 3.1 Pro Preview)
   ↓
Auditor Agent (Gemini-based verifier)
   ↓
Decision Engine (PASS / BLOCK)
   ↓
Frontend Output
```

---

## 🌐 Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Motion for React (animations)
* GSAP (advanced motion)

### Backend

* Python (FastAPI)
* Pydantic (validation)
* Gemini API (AI agents)

### AI Layer

* Gemini 3.1 Pro Preview (primary model)

### Optional

* LiveKit (realtime voice)
* Neon / Supabase (database)

---

## 🧩 Key Features

* Dual-agent AI architecture
* Real-time safety verification
* PASS / BLOCK decision model
* No-login browser experience
* Transparent processing (Generator → Auditor)
* Debug mode for audit inspection
* Monochrome premium UI design

---

## 🖥️ Pages

* `/` → Landing page
* `/app` → Main assistant interface
* `/demo` → Prebuilt demo flows
* `/about` → System explanation
* `/voice` (optional) → Realtime voice interface

---

## 🔄 User Flow

1. User enters a query
2. Generator creates response
3. Auditor evaluates response
4. System decides:

   * PASS → Show answer
   * BLOCK → Show warning

---

## ⚠️ Safety Model

### PASS

* Response is general, safe, and non-hallucinated

### BLOCK

* Contains fake contacts
* Contains unverifiable local info
* Overconfident claims
* Any uncertainty

### Default Rule

If unsure → **BLOCK**

---

## 📁 Project Structure

```
fairzero/
├── frontend/
├── backend/
├── docs/
│   ├── idea.md
│   ├── implementation_plan.md
│   ├── techstack.md
│   ├── design.md
│   ├── prerequisites.md
│   ├── claude.md
│   └── workflow.md
├── prompts/
├── README.md
```

---

## ⚙️ Setup (Basic)

### 1. Clone Repo

```
git clone <repo-url>
cd fairzero
```

### 2. Setup Backend

```
cd backend
pip install -r requirements.txt
```

Create `.env`:

```
GEMINI_API_KEY=your_key_here
```

Run backend:

```
uvicorn main:app --reload
```

---

### 3. Setup Frontend

```
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing Prompts

### Safe

* "How to find a government hospital?"

### Risky

* "Give me exact NGO phone numbers near me"

Expected:

* Safe → PASS
* Risky → BLOCK

---

## 🔒 Security Notes

* API keys must remain server-side
* Do not store keys in frontend
* Browser key input is only for demo/testing
* Invalid audit results must default to BLOCK

---

## 🛣️ Future Scope

* Regeneration loop instead of block
* Google Search grounding
* Google Maps integration
* Multi-auditor system
* Confidence scoring
* Audit logs
* External civic databases

---

## 🎤 Pitch Line

> FairZero ensures safer AI by verifying responses before they reach the user.

---

## 📌 Final Note

FairZero is not just a chatbot.

It is a **trust layer for AI systems**, built to protect users from harmful or misleading information—especially in real-world civic contexts.
