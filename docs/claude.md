# FairZero (Civic Edition) — Claude-Oriented Agent Orchestration Guide

## 1. Purpose of This Document

This document defines how an LLM agent (such as Claude or any advanced reasoning model) should orchestrate the FairZero system during development and execution.

It acts as a **behavioral + architectural instruction layer** for:
- building the system correctly
- maintaining separation of concerns
- enforcing safety-first design
- guiding agentic workflows

This is NOT just a coding guide.
This is an **agent orchestration blueprint**.

---

## 2. Core Philosophy

FairZero is not a single AI assistant.

It is a **multi-agent system with strict role separation**:

- Generator → creates
- Auditor → verifies
- System → enforces decision

### Golden Rule
The agent that creates must NEVER be the agent that approves.

---

## 3. Agentic Flow Definition

### Base Flow

```text
User Input
  ↓
Generator Agent
  ↓
Auditor Agent
  ↓
Decision Engine
  ↓
Frontend Output
```

### Extended Flow (Future)

```text
User Input
  ↓
Context Enrichment (optional)
  ↓
Generator Agent
  ↓
Tool Calls (optional)
  ↓
Auditor Agent
  ↓
Secondary Validation (optional)
  ↓
Decision Engine
  ↓
Output / Block
```

---

## 4. Responsibilities of Each Layer

## 4.1 Generator Agent

### Purpose
Produce helpful, natural, and useful responses.

### Must Do
- answer the user's question
- provide general guidance
- maintain clarity
- avoid unnecessary refusal

### Must NOT Do
- perform final safety judgment
- claim verification certainty without evidence
- invent precise local contacts
- override system constraints

### Mental Model
"Write the answer as if it will be reviewed by a strict auditor."

---

## 4.2 Auditor Agent

### Purpose
Act as a strict verifier and safety gate.

### Must Do
- detect hallucinations
- detect unverifiable local information
- detect unsafe advice
- detect overconfidence
- return structured output

### Must NOT Do
- generate new content unnecessarily
- rewrite full answers
- be lenient under uncertainty

### Default Behavior
If uncertain → BLOCK

### Mental Model
"If this answer could harm a real user, block it."

---

## 4.3 Decision Engine

### Purpose
Convert audit result into system action.

### Must Do
- parse auditor output
- enforce PASS or BLOCK
- handle malformed outputs safely

### Must NOT Do
- reinterpret auditor intent loosely
- bypass audit results

### Rule
Invalid or unclear audit output = BLOCK

---

## 4.4 Frontend Layer

### Purpose
Display the system behavior clearly.

### Must Do
- show generation phase
- show audit phase
- show final decision

### Must NOT Do
- directly call AI models
- implement safety logic
- bypass backend

---

## 5. Agent-Oriented Development Rules

## 5.1 Strict Separation of Concerns

Each agent must remain independent.

Bad:
- generator deciding safety
- auditor rewriting answers extensively

Good:
- generator creates
- auditor evaluates
- system enforces

---

## 5.2 Deterministic Output Contract

Auditor must return structured JSON.

### Required Format

```json
{
  "decision": "PASS" | "BLOCK",
  "risk_level": "low" | "medium" | "high",
  "reason": "string",
  "flags": []
}
```

### Enforcement Rule
- parsing fails → BLOCK

---

## 5.3 Safety-First Execution

The system must always prioritize safety over completeness.

### Rules
- uncertain data → BLOCK
- suspicious specificity → BLOCK
- hallucinated entities → BLOCK

---

## 5.4 Stateless Core Logic

The MVP should not depend on memory or user history.

### Why
- easier debugging
- easier demo
- fewer failure points

---

## 6. Claude / LLM Behavior Instructions

If using Claude or similar models to orchestrate:

### Behavior Mode
- structured thinker
- deterministic output producer
- safety-first evaluator

### Avoid
- long unnecessary explanations
- creative rewriting in audit stage
- emotional tone

### Prefer
- concise reasoning
- strict classification
- structured outputs

---

## 7. What to Build (Agentically)

## 7.1 Phase 1 — Core Pipeline

Build ONLY:
- generator agent
- auditor agent
- API route
- PASS/BLOCK enforcement

### Output
Working dual-agent system

---

## 7.2 Phase 2 — UI Integration

Build:
- Next.js interface
- input system
- loading states
- result panels

### Output
Visible dual-agent flow

---

## 7.3 Phase 3 — Validation Layer

Add:
- JSON validation
- fallback rules
- logging

---

## 7.4 Phase 4 — Enhancements

Optional:
- grounding
- tool calls
- multi-auditor system
- confidence scoring

---

## 8. What NOT to Build (Critical)

Do NOT build early:
- login systems
- user profiles
- vector databases
- multi-agent frameworks
- complex orchestration engines
- microservices
- real-time pipelines before core works

---

## 9. Agentic Expansion Strategy

## 9.1 Multi-Auditor Future

Future design:

```text
Generator
  ↓
Fact Auditor
Bias Auditor
Logic Auditor
  ↓
Aggregator
```

## 9.2 Tool-Augmented Agents

Future generator can:
- call search
- call maps
- call database

But MUST still pass audit.

---

## 10. Failure Handling Strategy

### Cases

#### Auditor fails
→ BLOCK

#### Generator fails
→ retry once or show fallback

#### Invalid JSON
→ BLOCK

#### API failure
→ graceful error message

---

## 11. Performance Strategy

### MVP Priority
- correctness > speed

### Later Optimization
- parallel calls
- caching
- model selection per task

---

## 12. Deployment Mental Model

### System Structure

```text
Frontend (Next.js)
   ↓
Backend API (Python)
   ↓
Gemini Generator
   ↓
Gemini Auditor
```

---

## 13. Agentic Coding Guidelines

### Code Style
- modular
- readable
- minimal abstraction

### File Rules
- one responsibility per file
- separate prompts from logic
- separate validation from execution

---

## 14. Evaluation Criteria

System is correct if:
- unsafe responses are blocked
- safe responses are shown
- pipeline is visible
- outputs are structured

---

## 15. Final Principle

FairZero is successful when:

> The system behaves like a responsible AI pipeline, not just a chatbot.

The user should feel:
- protected
- informed
- not misled

The system should feel:
- structured
- deliberate
- trustworthy

