# FairZero (Civic Edition) — Idea Document

## 1. Project Summary

FairZero is a dual-agent AI safety and verification system designed for community-facing assistance. Its purpose is to reduce harmful hallucinations in local or civic information, such as fake NGO contact details, fabricated government scheme links, unsafe medical advice, or misleading local resource suggestions.

The system separates the task of answering from the task of checking. One agent generates a useful response. A second, independent agent audits that response before the user sees it. In the MVP version, the result is a simple traffic-light decision:

* PASS: safe response is shown
* BLOCK: unsafe response is hidden and replaced by a warning

The project is optimized for a fast hackathon build, but the architecture is designed so it can later scale into a more advanced verification layer.

---

## 2. Problem Statement

Large language models are very good at sounding confident, but they can still produce incorrect or fabricated information. This becomes risky when users ask about local community resources, such as:

* NGOs
* hospitals and clinics
* emergency help
* government schemes
* legal aid
* educational support
* local public services

In civic settings, even a small hallucination can cause real harm. A fake phone number, false scheme, or wrong clinic recommendation can waste time or mislead vulnerable users.

FairZero addresses this by inserting a verification layer between generation and delivery.

---

## 3. Core Idea

FairZero uses a generator-auditor pipeline.

### Agent 1: Generator

The generator is the helpful assistant. It answers the user’s prompt, tries to be complete, and focuses on usefulness.

### Agent 2: Auditor

The auditor is the safety verifier. It checks whether the generated response contains:

* hallucinated facts
* fake or unverifiable contact details
* risky local claims
* misleading civic or medical suggestions
* unsupported assumptions

### Decision Layer

The auditor outputs a final decision:

* PASS → display the response
* BLOCK → suppress the response and show a safety warning

This creates a lightweight “traffic light” safety model.

---

## 4. Product Goal

The goal is to build a community-facing AI system that prioritizes trust, safety, and factual integrity without making the assistant feel weak or overly cautious.

The system should still feel useful and fast, but it should stop unsafe answers before they reach the user.

---

## 5. Target Users

FairZero is intended for people who need trustworthy local information, especially:

* students
* residents of local communities
* people searching for civic help
* users looking for basic medical or social support resources
* hackathon judges evaluating practical AI safety applications

---

## 6. MVP Scope

The 1-hour MVP should focus on one thing only: safe filtering of community-oriented AI answers.

### In scope

* text input from the user
* generator agent response
* auditor agent review
* pass/block output
* safety warning on block
* visible loading stages for both agents

### Out of scope for MVP

* database-backed verification
* regeneration loops
* human-in-the-loop review
* user profiles
* long-term memory
* multi-language support
* mobile apps

---

## 7. Why Google Gemini Fits This Project

The plan is to build around Google’s Gemini ecosystem because it supports the kind of modular, tool-aware agent design FairZero needs.

Gemini API documentation describes:

* built-in tools such as Google Search, URL Context, Google Maps, Code Execution, and Computer Use
* function calling for connecting a model to custom functions and external APIs
* structured outputs for JSON-shaped results
* safety settings that can be tuned during prototyping
* grounding with Google Search and Google Maps for fresher, more factual answers

This makes Gemini a good fit for a generator-auditor pipeline where the generator can answer and the auditor can verify, classify, and return a strict decision.

---

## 8. Recommended Google-Based Stack

### Frontend

* Streamlit for rapid UI
* simple input box and output panel
* status indicators for each agent step

### Backend

* Python
* Gemini API calls
* lightweight orchestration logic

### AI Layer

* Agent 1: Gemini-based generator
* Agent 2: Gemini-based auditor

### Optional Verification Tools

* Google Search grounding
* Google Maps grounding for location-aware queries
* structured output for strict PASS/BLOCK JSON
* function calling if custom validation or tool checks are added later

---

## 9. High-Level System Architecture

User Input → Generator Agent → Auditor Agent → Final Output

### Detailed flow

1. User submits a civic/community prompt.
2. Agent 1 creates a response.
3. Agent 2 reviews the response.
4. Agent 2 returns either PASS or BLOCK.
5. The UI shows the approved answer or the safety warning.

---

## 10. Agent Design

### Agent 1 — Generator

Purpose: produce a helpful answer.

Behavior:

* answers naturally
* gives practical guidance
* avoids overthinking safety at generation time
* stays focused on helping the user

Important constraint:

* do not rely on Agent 1 alone for correctness

### Agent 2 — Auditor

Purpose: protect the user from unsafe or unverified output.

Checks:

* fake phone numbers
* fake NGOs or institutions
* misleading claims
* unsupported local facts
* unsafe advice
* uncertain answers presented too confidently

Output:

* PASS
* BLOCK

For the MVP, the auditor should be strict.
If uncertain, it should prefer BLOCK.

---

## 11. Implementation Flow

### User Journey

1. User opens the app.
2. User types a question related to a local civic need.
3. The app shows: “Agent 1 Generating...”
4. The generator creates a response.
5. The app shows: “Agent 2 Auditing for Safety...”
6. The auditor reviews the text.
7. The result is displayed:

   * safe output, or
   * blocked warning

### Engineering Flow

1. Capture input.
2. Send prompt to Gemini generator.
3. Receive generated text.
4. Send generated text to Gemini auditor.
5. Parse the auditor’s structured response.
6. Render output in Streamlit.

---

## 12. Output Policy

### PASS

Show the response only when the auditor confirms that the text is safe and not obviously hallucinated.

### BLOCK

Show a fixed warning when the response contains unverified or risky local information.

Suggested warning text:

"⚠️ FLAGGED: This response contained unverified local information. For community safety, it has been blocked."

---

## 13. Suggested Data Contract Between Agents

To keep the pipeline simple and reliable, the auditor should return structured output.

Example format:

```json
{
  "decision": "PASS",
  "risk_level": "low",
  "reason": "No fake local facts detected",
  "flags": []
}
```

For a blocked response:

```json
{
  "decision": "BLOCK",
  "risk_level": "high",
  "reason": "Contains unverifiable phone numbers and local claims",
  "flags": ["hallucinated_contact", "unverified_organization"]
}
```

Structured output is useful because it keeps the decision easy to parse inside the app.

---

## 14. Safety Strategy

The MVP safety strategy is intentionally conservative.

### Basic rules

* If a phone number is mentioned without verification, treat it as risky.
* If the response claims exact local contact details without confidence, treat it as risky.
* If the response invents an NGO, scheme, clinic, or office, treat it as risky.
* If there is uncertainty, prefer BLOCK.

### Why this works for the demo

This makes the safety logic easy to explain to judges:

* the generator writes
* the auditor checks
* unsafe content never reaches the user

---

## 15. Google Gemini Features Useful for FairZero

### Function Calling

Useful if FairZero later needs to check a custom source, local database, or verification API.

### Structured Outputs

Useful for forcing the auditor to return clean JSON instead of free-form text.

### Grounding with Google Search

Useful for reducing hallucinations by pulling in fresher real-world context.

### Grounding with Google Maps

Useful for location-aware civic queries where local businesses, services, or nearby institutions matter.

### Built-in Safety Settings

Useful for controlling the behavior of the model during prototyping and making the demo more stable.

---

## 16. MVP UI Requirements

The interface should visibly prove the two-step process.

### Required UI elements

* title of the app
* input box
* submit button
* loading state for Agent 1
* loading state for Agent 2
* final result panel
* blocked warning panel
* optional debug expander

### Nice-to-have UI elements

* colored status badges
* progress bar
* small explanation of the pipeline
* debug view for judges

---

## 17. Hackathon Pitch Angle

The simplest pitch is:

FairZero protects communities from unsafe AI misinformation by separating generation from verification.

A stronger version is:

Most AI assistants generate answers directly. FairZero adds a second independent agent that audits the answer first, so community users only receive information that passes a safety check.

---

## 18. Success Criteria

The MVP is successful if:

* the app is easy to demo
* the dual-agent flow is visible
* unsafe local claims are blocked
* safe answers are shown clearly
* judges can understand the concept in under one minute

---

## 19. Limitations

The MVP is not a full factual verification system.

It does not guarantee perfect truth.
It reduces risk by filtering obvious problems before delivery.

Main limitations:

* no real external verification database
* may over-block useful answers
* depends on auditor quality
* still subject to model errors

---

## 20. Future Scope

After the MVP, FairZero can grow into a deeper verification system.

### Future upgrades

* regeneration loop instead of simple block
* external civic data APIs
* Google Search grounding for more factual answers
* Google Maps grounding for nearby services
* multi-auditor pipeline
* confidence scoring
* audit logs
* admin dashboard
* domain-specific verification modes for health, education, and civic aid

---

## 21. Proposed Repository Structure

```text
fairzero/
├── app.py
├── agents/
│   ├── generator.py
│   └── auditor.py
├── prompts/
│   ├── generator_prompt.md
│   └── auditor_prompt.md
├── docs/
│   └── idea.md
├── requirements.txt
└── README.md
```

---

## 22. Final Product Definition

FairZero is a dual-agent civic AI safety system built to protect users from harmful hallucinations in community-facing information. The first agent generates the answer, and the second agent audits it before delivery. In the MVP version, the system uses a simple PASS/BLOCK model to make AI responses safer, more trustworthy, and easier to demo.
