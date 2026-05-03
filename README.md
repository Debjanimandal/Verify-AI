<p align="center">
  <img src="https://img.shields.io/badge/Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Python%203.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Tavily%20RAG-FF6B6B?style=for-the-badge" alt="Tavily">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT">
</p>

<h1 align="center">
  🛡️ FairZero — Civic AI Safety System
</h1>

<p align="center">
  <strong>AI that verifies before it answers.</strong><br/>
  A dual-agent pipeline where one AI generates, another audits —<br/>
  so community users only receive responses verified for safety.
</p>

---

## 📖 Table of Contents

- [What is FairZero?](#-what-is-fairzero)
- [The Problem](#-the-problem)
- [How the Pipeline Works](#-how-the-pipeline-works)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Run Everything](#4-run-everything)
- [API Keys Guide](#-api-keys-guide)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Safety Logic](#-safety-logic)
- [Demo Scenarios](#-demo-scenarios)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 🧠 What is FairZero?

FairZero is a **civic-first AI safety layer** built for communities where a wrong AI answer can cause real harm — fake NGO contacts, incorrect hospital info, fabricated government schemes, hallucinated phone numbers.

It solves this with a **dual-agent pipeline**:

1. **Generator Agent** (Gemini) — crafts a helpful response, grounded in real-time web search
2. **Auditor Agent** (Gemini) — independently reviews the response for hallucinations, risky claims, and unverifiable specifics
3. **Decision Engine** — enforces `PASS` or `BLOCK`. When in doubt, it always **BLOCKS**.

Users only ever see **audited, verified output**.

> 🚫 No login required. No data stored. Just safe civic AI.

---

## ⚠️ The Problem

Standard AI systems generate one answer. There's no second check. In civic and community contexts:

| Risk | Example |
|------|---------|
| 🔴 Fake NGO contacts | AI invents phone numbers and WhatsApp IDs for NGOs that may not exist |
| 🔴 Wrong hospital info | Incorrect addresses or policies for government hospitals patients rely on |
| 🔴 Fabricated schemes | Hallucinated government scheme names, portals, and eligibility criteria |
| 🔴 Overconfident advice | Legal or medical guidance delivered as fact without real verification |

FairZero's Auditor catches all of these **before** the user sees them.

---

## ⚙️ How the Pipeline Works

```
User Input
    │
    ▼
┌─────────────────────────────────┐
│  Step 0: Search Grounding       │  ← Tavily / Serper fetches real-time web context
│  (optional, requires API key)   │
└─────────────┬───────────────────┘
              │  grounding context
              ▼
┌─────────────────────────────────┐
│  Agent 1: Generator             │  ← Gemini 2.5 Flash generates a civic response
│  Prompted to be helpful         │    using the real-time search context
│  NOT tasked with safety         │
└─────────────┬───────────────────┘
              │  raw generated text
              ▼
┌─────────────────────────────────┐
│  Agent 2: Auditor               │  ← Independent Gemini instance audits the response
│  Checks for:                    │    Returns strict JSON: { decision, risk_level,
│  • Hallucinated contacts        │    reason, flags, confidence }
│  • Unverifiable local entities  │
│  • Overconfident civic claims   │
│  • Fabricated data              │
└─────────────┬───────────────────┘
              │  structured audit result
              ▼
┌─────────────────────────────────┐
│  Decision Engine                │
│  PASS → Show response + sources │
│  BLOCK → Show reason + flags    │
│  Error → Default to BLOCK       │  ← Safety-first fallback
└─────────────────────────────────┘
              │
              ▼
         Frontend UI
```

---

## 🏗️ Architecture

```
Verify-AI-/
├── backend/                    # Python FastAPI
│   ├── main.py                 # App entrypoint + /api/query pipeline
│   ├── config.py               # Pydantic settings (env vars)
│   ├── agents/
│   │   ├── generator.py        # Agent 1 — generates civic responses
│   │   └── auditor.py          # Agent 2 — audits for safety
│   ├── services/
│   │   ├── gemini_client.py    # Google GenAI SDK wrapper w/ retries
│   │   └── search_service.py   # Tavily + Serper + Maps grounding
│   ├── schemas/
│   │   └── audit.py            # Pydantic request/response models
│   ├── prompts/
│   │   ├── generator.md        # System prompt for Generator agent
│   │   └── auditor.md          # System prompt for Auditor agent
│   ├── utils/
│   │   └── validation.py       # JSON extraction + decision validation
│   ├── requirements.txt
│   └── .env.example            # ← Copy to .env and fill your keys
│
├── frontend/                   # Next.js 16 App Router
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── app/page.tsx        # Main assistant page
│   │   ├── demo/page.tsx       # Demo page (PASS vs BLOCK scenarios)
│   │   ├── about/page.tsx      # Architecture explainer
│   │   ├── layout.tsx          # Root layout + Nav
│   │   └── globals.css         # Design system tokens
│   ├── components/
│   │   ├── Nav.tsx             # Navigation bar
│   │   ├── ResultCard.tsx      # PASS result display + citations
│   │   ├── BlockCard.tsx       # BLOCK result display + flags
│   │   ├── DebugPanel.tsx      # Transparency panel (timing, models, search)
│   │   └── PipelineStatus.tsx  # Live pipeline state animation
│   ├── hooks/
│   │   └── useFairZero.ts      # State machine hook (idle→generating→auditing→result)
│   ├── lib/
│   │   ├── api.ts              # HTTP client + TypeScript types
│   │   └── config.ts           # Sample + risky prompts
│   ├── package.json
│   └── .env.example            # ← Copy to .env.local
│
└── docs/
    └── implementation_plan.md  # Full architecture spec
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Runtime |
| FastAPI | 0.110+ | HTTP API framework |
| Uvicorn | 0.27+ | ASGI server |
| Google GenAI SDK (`google-genai`) | 1.74+ | Gemini API client |
| Gemini 2.5 Flash | latest | LLM for Generator + Auditor |
| Pydantic v2 | 2.5+ | Schema validation |
| Pydantic Settings | 2.2+ | Env var management |
| Tenacity | 8.2+ | Retry logic for API calls |
| HTTPX | 0.27+ | Async HTTP client |
| Tavily | REST API | RAG search grounding |
| Serper | REST API | Google Search fallback |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.4 | React framework (App Router) |
| React | 19.2 | UI library |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | v4 | Styling |
| Framer Motion | 12+ | Animations |
| GSAP | 3.15 | Advanced animations |
| Lucide React | latest | Icons |
| Radix UI | latest | Accessible primitives |

---

## 🚀 Quick Start

### Prerequisites

Make sure you have these installed:

```bash
# Check Python version (needs 3.10+)
python --version

# Check Node.js (needs 18+)
node --version

# Check npm
npm --version

# Check git
git --version
```

### 1. Clone the Repository

```bash
git clone https://github.com/Debjanimandal/Verify-AI-.git
cd Verify-AI-
```

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install all Python dependencies
pip install -r requirements.txt

# Copy the environment template
cp .env.example .env
```

Now open `backend/.env` and fill in your API keys (see [API Keys Guide](#-api-keys-guide)):

```env
# REQUIRED — get free at https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# OPTIONAL — for real-time search grounding
TAVILY_API_KEY=your_tavily_key_here
SERPER_API_KEY=your_serper_key_here
```

**Verify everything is configured correctly:**

```bash
python -c "from config import get_settings; s = get_settings(); print('Gemini key set:', bool(s.gemini_api_key))"
```

Expected output:
```
FairZero Configuration Loaded
 Generator model : gemini-2.5-flash
 Auditor model   : gemini-2.5-flash
 Search grounding: ✓ tavily     ← shows if Tavily key is set
Gemini key set: True
```

---

### 3. Frontend Setup

Open a **new terminal** and run:

```bash
# Navigate to frontend directory (from repo root)
cd frontend

# Install all Node dependencies
npm install

# Copy the environment template
cp .env.example .env.local
```

The `.env.local` file should contain:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

> ✅ That's it — no other frontend configuration needed.

---

### 4. Run Everything

You need **two terminals running simultaneously**.

**Terminal 1 — Start Backend (FastAPI):**

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
FairZero backend starting...
Generator model: gemini-2.5-flash
Auditor model:   gemini-2.5-flash
Search provider: tavily
INFO:     Application startup complete.
```

**Terminal 2 — Start Frontend (Next.js):**

```bash
cd frontend
npm run dev
```

You should see:
```
▲ Next.js 16.2.4 (Turbopack)
- Local:   http://localhost:3000
✓ Ready in ~600ms
```

**Open your browser:**

| Page | URL | Description |
|------|-----|-------------|
| 🏠 Home | http://localhost:3000 | Landing page & overview |
| 🤖 Assistant | http://localhost:3000/app | Main AI assistant interface |
| 🎭 Demo | http://localhost:3000/demo | Try PASS vs BLOCK scenarios |
| 📖 About | http://localhost:3000/about | Architecture deep-dive |
| 🔧 API Docs | http://localhost:8000/docs | Interactive Swagger UI |
| ❤️ Health | http://localhost:8000/health | Backend health check |

---

## 🔑 API Keys Guide

### Google Gemini API (Required)

The only **required** key. Without it, nothing works.

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **Get API Key** → **Create API key**
3. Copy the key and add to `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

> **Model**: FairZero uses `gemini-2.5-flash` by default. You can change this in `.env`.

> **Quota note**: Free tier has limits per minute/day. If you hit `429 RESOURCE_EXHAUSTED`, wait a minute or enable billing in Google Cloud.

---

### Tavily API (Optional — Recommended)

Enables real-time web search grounding. Without it, Gemini relies only on its training data.

1. Go to [app.tavily.com](https://app.tavily.com/)
2. Sign up (free) → copy your API key
3. Add to `backend/.env`:
   ```env
   TAVILY_API_KEY=tvly-...
   ```

**What it does:** Before generating a response, FairZero sends the user's query to Tavily, retrieves top 5 real-time web results, and injects that context into the Generator's prompt. This dramatically reduces hallucinations for civic queries.

---

### Serper API (Optional — Google Search fallback)

A Google Search API used as fallback if Tavily is unavailable.

1. Go to [serper.dev](https://serper.dev/)
2. Sign up (2,500 free queries/month)
3. Add to `backend/.env`:
   ```env
   SERPER_API_KEY=your_serper_key_here
   ```

> FairZero automatically uses **Tavily first**, then falls back to Serper if Tavily fails.

---

### Google Maps API (Optional)

Enables location-aware civic queries (e.g., "nearest government hospital to Connaught Place, Delhi").

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Places API** and **Geocoding API**
3. Create credentials → API key
4. Add to `backend/.env`:
   ```env
   GOOGLE_MAPS_API_KEY=AIzaSy...
   ENABLE_MAPS_INTEGRATION=true
   ```

---

## 📡 API Reference

### `POST /api/query`

The core endpoint. Runs the full Generator → Auditor → Decision pipeline.

**Request:**
```json
{
  "prompt": "How do I apply for a ration card in Maharashtra?",
  "api_key": "optional-per-request-gemini-key",
  "location": "optional location string for maps grounding"
}
```

**Response (PASS):**
```json
{
  "decision": "PASS",
  "generated_text": "To apply for a ration card in Maharashtra...",
  "reason": "Response contains accurate, verifiable civic information",
  "risk_level": "low",
  "flags": [],
  "citations": [
    {
      "title": "Maharashtra Ration Card — Official Portal",
      "url": "https://rcms.mahafood.gov.in/",
      "content": "...",
      "source": "mahafood.gov.in",
      "relevance_score": 0.95
    }
  ],
  "debug": {
    "stage": "complete",
    "request_id": "a1b2c3d4",
    "duration_ms": 12340,
    "generator_model": "gemini-2.5-flash",
    "auditor_model": "gemini-2.5-flash",
    "audit_decision": "PASS",
    "audit_risk_level": "low",
    "audit_reason": "...",
    "audit_flags": [],
    "audit_confidence": 0.95,
    "search_provider": "tavily",
    "search_results_count": 5,
    "is_location_query": false,
    "raw_generated_text": "..."
  }
}
```

**Response (BLOCK):**
```json
{
  "decision": "BLOCK",
  "generated_text": null,
  "reason": "Response contains unverifiable NGO contact information that may be hallucinated.",
  "risk_level": "high",
  "flags": ["unverifiable_local_entity", "hallucinated_contact"],
  "citations": [],
  "debug": { ... }
}
```

### `GET /health`

```json
{
  "status": "ok",
  "service": "FairZero API",
  "generator_model": "gemini-2.5-flash",
  "auditor_model": "gemini-2.5-flash",
  "search_provider": "tavily",
  "maps_enabled": false
}
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | — | Google Gemini API key |
| `TAVILY_API_KEY` | ⬜ No | — | Tavily search grounding |
| `SERPER_API_KEY` | ⬜ No | — | Google Search fallback |
| `GOOGLE_MAPS_API_KEY` | ⬜ No | — | Location-aware queries |
| `GENERATOR_MODEL` | ⬜ No | `gemini-2.5-flash` | Generator LLM model |
| `AUDITOR_MODEL` | ⬜ No | `gemini-2.5-flash` | Auditor LLM model |
| `ALLOWED_ORIGINS` | ⬜ No | `http://localhost:3000` | CORS allowed origins |
| `ENABLE_SEARCH_GROUNDING` | ⬜ No | `true` | Toggle search grounding |
| `ENABLE_MAPS_INTEGRATION` | ⬜ No | `false` | Toggle Maps features |
| `ENABLE_MULTI_AUDITOR` | ⬜ No | `true` | Multi-auditor consensus |
| `MAX_RETRIES` | ⬜ No | `2` | Gemini API retry count |
| `REQUEST_TIMEOUT` | ⬜ No | `45` | Gemini timeout (seconds) |
| `SEARCH_MAX_RESULTS` | ⬜ No | `5` | Max search results to fetch |
| `LOG_LEVEL` | ⬜ No | `INFO` | Python logging level |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | ✅ Yes | `http://localhost:8000` | Backend API base URL |

---

## 🛡️ Safety Logic

FairZero's core safety principle: **when in doubt, BLOCK**.

### Decision Flow

```python
# Auditor returns structured JSON
{
  "decision": "PASS" | "BLOCK",
  "risk_level": "low" | "medium" | "high",
  "reason": "human-readable explanation",
  "flags": ["hallucinated_contact", "unverifiable_local_entity", ...],
  "confidence": 0.0 - 1.0
}

# Safety fallbacks (always BLOCK):
# - Gemini API returns error
# - Auditor returns malformed JSON
# - Auditor JSON missing required fields
# - Any unhandled exception in the pipeline
```

### Audit Flag Types

| Flag | Description |
|---|---|
| `hallucinated_contact` | AI invented a phone number, email, or address |
| `unverifiable_local_entity` | NGO, hospital, or office that can't be verified |
| `fake_government_data` | Made-up scheme names, portals, or eligibility rules |
| `overconfident_claim` | Presented uncertain info as guaranteed fact |
| `misleading_civic_info` | Directionally wrong information for civic context |
| `risky_specificity` | Dangerously specific claims that can't be verified |
| `unverifiable_phone_number` | Phone number that may not exist or be current |
| `invented_address` | Address that cannot be confirmed to exist |

### Search Grounding Benefits

When Tavily/Serper API keys are configured:

1. **Before generation** — real web results are retrieved for the user's query
2. **Context injection** — the Generator is shown these results and asked to ground its response in them
3. **Citation display** — on PASS decisions, source URLs are shown to the user
4. **Reduced hallucination** — real facts anchor the response, reducing the Auditor's BLOCK rate for legitimate queries

---

## 🎭 Demo Scenarios

Visit **http://localhost:3000/demo** to run pre-configured scenarios, or try these in the assistant:

### ✅ Expected PASS

```
How do I file an RTI (Right to Information) application in India?
```
```
What documents do I need to apply for a passport in India?
```
```
How does the PM Kisan Yojana scheme work and who is eligible?
```
```
What are my rights if I am detained by police in India?
```

### 🚫 Expected BLOCK

```
Give me the exact phone numbers and WhatsApp of NGOs near Dharavi, Mumbai that provide food aid.
```
```
What is the direct mobile number of the District Collector of Pune?
```
```
List the exact addresses of 5 free cancer treatment hospitals in Bengaluru with their helpline numbers.
```
```
What is the case status and next hearing date for FIR #2847 at Andheri police station?
```

---

## 🌐 Deployment

### Deploy Backend to Railway / Render

1. Push your repo to GitHub (no `.env` — it's gitignored ✅)
2. Connect Railway or Render to your GitHub repo
3. Set environment variables in the platform dashboard:
   - `GEMINI_API_KEY`
   - `TAVILY_API_KEY` (optional)
   - `ALLOWED_ORIGINS=https://your-frontend.vercel.app`
4. Set the start command:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
```

Or connect your GitHub repo directly at [vercel.com](https://vercel.com) and set the root directory to `frontend`.

---

## 🗺️ Roadmap

| Feature | Status |
|---|---|
| Dual-agent Generator + Auditor pipeline | ✅ Complete |
| Real-time Tavily search grounding | ✅ Complete |
| Serper Google Search fallback | ✅ Complete |
| Structured audit JSON with confidence scoring | ✅ Complete |
| Transparency debug panel (timing, models, sources) | ✅ Complete |
| Search citation display on PASS responses | ✅ Complete |
| Google Maps location-aware grounding | 🔧 Config ready, key optional |
| Multi-auditor consensus pipeline | 🔧 Config flag ready |
| LiveKit voice interface | 📋 Planned |
| Audit history / telemetry logging | 📋 Planned |
| Multi-language civic query support | 📋 Planned |
| Authentication + multi-user mode | 📋 Optional future |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test the pipeline: ensure PASS/BLOCK logic works correctly
5. Commit: `git commit -m "feat: your description"`
6. Push: `git push origin feature/your-feature`
7. Open a Pull Request

**Never commit `.env` files or API keys.** The `.gitignore` protects you, but double-check before pushing.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for civic communities · <strong>FairZero — AI that verifies before it answers.</strong>
</p>
