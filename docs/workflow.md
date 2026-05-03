# FairZero (Civic Edition) — End-to-End Workflow

## 1. Purpose of This Document

This document explains how FairZero should work end to end on the website, from the moment a user lands on the site to the moment a safe answer is shown or blocked.

It is written as the operational workflow for the product and the development flow for the team. It covers page behavior, user interaction, backend orchestration, agent flow, validation, and deployment behavior.

The goal is to make the system easy to build, easy to understand, and easy to demonstrate.

---

## 2. High-Level Product Flow

FairZero should behave like a controlled civic AI web experience.

### Main idea
1. The user opens the website.
2. The site introduces the product.
3. The user enters a civic or community-related question.
4. The generator agent creates an answer.
5. The auditor agent checks the answer.
6. The decision engine either allows or blocks it.
7. The frontend displays the final result.

### Core rule
The user never receives output before the audit step finishes.

---

## 3. End-to-End Website Journey

## 3.1 Entry Point
The user first lands on the homepage.

### Homepage must do this immediately
- show the brand identity
- explain the safety value of the system
- show that this is a civic AI trust layer
- provide a clear launch button

### Homepage outcome
The user should understand within a few seconds that FairZero is about safer AI answers for community use.

---

## 3.2 Transition to Main Assistant Page
After clicking the CTA, the user moves into the main experience.

### Main page purpose
This is where the dual-agent workflow becomes visible.

### Main page must show
- prompt input
- sample prompts
- generator loading state
- auditor loading state
- final result area
- blocked message state
- optional transparency drawer

---

## 4. Website Page Workflow

## 4.1 Landing Page Workflow

### Step 1
Render a premium black monochrome hero section.

### Step 2
Show a short product explanation.

### Step 3
Show the dual-agent concept in a simple visual format.

### Step 4
Show a button that launches the assistant experience.

### Step 5
Optionally show example use cases such as NGO help, hospital lookup, and civic guidance.

---

## 4.2 Assistant Page Workflow

### Step 1
User enters a prompt or selects a sample prompt.

### Step 2
Frontend captures the request.

### Step 3
The app shows "Agent 1 Generating...".

### Step 4
The frontend sends the prompt to the backend.

### Step 5
The backend calls the generator model.

### Step 6
The backend receives the raw generated answer.

### Step 7
The backend shows or internally updates the UI to "Agent 2 Auditing for Safety...".

### Step 8
The backend sends the generator output to the auditor.

### Step 9
The auditor returns structured PASS or BLOCK JSON.

### Step 10
The backend validates the audit result.

### Step 11
The frontend displays the final result.

---

## 4.3 Demo Page Workflow

### Step 1
Show a set of prefilled prompts.

### Step 2
Use a safe example and a risky example.

### Step 3
Display the audit process live.

### Step 4
Use debug or transparency panels to prove the pipeline if needed.

### Step 5
Show the blocked response path clearly.

---

## 4.4 About Page Workflow

### Step 1
Explain what the system does.

### Step 2
Explain why community info needs safety.

### Step 3
Explain the generator-auditor model.

### Step 4
Explain the future direction of the project.

---

## 4.5 Optional Voice Page Workflow

If LiveKit or voice support is enabled:

### Step 1
User opens voice mode.

### Step 2
Browser requests microphone access.

### Step 3
Speech is converted to text.

### Step 4
The same generator-auditor pipeline runs.

### Step 5
The final result is shown and optionally spoken back.

---

## 5. Main Runtime Flow

## 5.1 Input Stage
The frontend accepts a query from the user.

### Input types allowed
- typed text
- sample prompt selection
- optional voice transcript

### Input rule
The frontend should only collect the query, not decide safety.

---

## 5.2 Generation Stage
The backend sends the user query to the generator agent.

### Generator behavior
- create a helpful answer
- stay focused on civic/community use
- do not act as the final safety decision maker

### Generation result
Raw response text.

---

## 5.3 Audit Stage
The backend sends the raw generator output to the auditor.

### Auditor behavior
- detect hallucinations
- detect fake or risky local details
- check for unsafe overconfidence
- return structured output only

### Required output
- PASS or BLOCK
- risk level
- reason
- flags

---

## 5.4 Validation Stage
The backend validates the auditor JSON.

### Validation rule
If the JSON is malformed, incomplete, or unsafe to interpret, the backend must default to BLOCK.

### Why
This keeps the system safe even when the model output is imperfect.

---

## 5.5 Final Rendering Stage
The frontend renders one of two final states.

### PASS state
- display answer
- show trust label
- optionally show summary of audit status

### BLOCK state
- hide risky answer
- show warning message
- optionally show a short reason

---

## 6. Website Implementation Flow

## 6.1 Frontend Build Order
Build the frontend in this order:

1. page layout and routing
2. shared layout shell
3. homepage hero section
4. assistant input interface
5. loading states
6. result cards
7. debug panel
8. sample prompt buttons
9. optional voice interface
10. polish and motion

---

## 6.2 Backend Build Order
Build the backend in this order:

1. API skeleton
2. Gemini client wrapper
3. generator agent service
4. auditor agent service
5. JSON validation layer
6. error handling and fallback logic
7. logging
8. optional grounding or external tools

---

## 6.3 Integration Order
Connect the system in this order:

1. frontend to backend API
2. backend to generator
3. generator to auditor
4. auditor to validation layer
5. validation to frontend result state

---

## 7. Page-by-Page Component Workflow

## 7.1 Homepage Components
- top navigation
- hero title
- subtitle
- call-to-action button
- explanation card
- safety overview
- footer

### Homepage interaction
Clicking the CTA should open the assistant page or scroll the user into the main experience.

---

## 7.2 Assistant Page Components
- prompt composer
- example prompt chips
- submit button
- generator status card
- auditor status card
- result panel
- warning panel
- debug drawer

### Assistant page interaction
The user should be able to ask, wait, and receive output without leaving the page.

---

## 7.3 Demo Page Components
- fixed demo prompts
- run button
- result showcase
- explanation strip
- optional code-like audit log visual

### Demo page interaction
The page should be optimized for fast presentation in front of judges.

---

## 7.4 About Page Components
- mission block
- architecture block
- safety block
- future scope block

### About page interaction
This page should be static and easy to read.

---

## 8. Loading and State Workflow

The system must make the agent flow visible.

### State 1
Idle

### State 2
Agent 1 Generating...

### State 3
Agent 2 Auditing for Safety...

### State 4
Final safe answer or blocked result

### State rule
The UI must never skip directly from input to result without showing the dual-agent process.

---

## 9. Safety Workflow

### Safe route
1. prompt received
2. generator answer created
3. auditor approves
4. result shown

### Unsafe route
1. prompt received
2. generator answer created
3. auditor rejects
4. result blocked
5. warning shown

### Fallback route
If the backend fails, times out, or returns broken data, the app should fail safely and show a non-sensitive error message.

---

## 10. Debug and Transparency Workflow

A debug view should exist for development and judging.

### Debug content may include
- raw generator text
- auditor JSON
- decision value
- risk flags
- model identifier

### Debug rule
This should be hidden by default in the public view.

---

## 11. API Workflow

## 11.1 Frontend Request
The frontend sends a request containing:
- user prompt
- optional mode flag
- optional temporary API key only if the demo mode requires it

## 11.2 Backend Processing
The backend:
- receives request
- sends prompt to generator
- receives answer
- sends answer to auditor
- validates result
- returns structured response

## 11.3 Frontend Response
The frontend receives:
- final decision
- result text
- reason
- flags
- optional debug data

---

## 12. Configuration Workflow

### Required config sources
- environment variables
- local development config
- optional demo override fields

### Configuration must cover
- Gemini model name
- API key source
- backend URL
- optional LiveKit settings
- optional database URL
- block warning text

---

## 13. Build-Time Workflow

### Development sequence
1. design docs finalized
2. repo structure created
3. frontend shell started
4. backend shell started
5. Gemini integration added
6. agent prompts added
7. JSON validation added
8. UI states connected
9. testing with safe and risky prompts
10. design polish
11. deploy

### Why this order matters
It ensures the core product works before visual polish or advanced extras are added.

---

## 14. Testing Workflow

### Test category 1: Safe queries
Confirm the system allows ordinary civic guidance.

### Test category 2: Risky queries
Confirm the system blocks fake or unverifiable local details.

### Test category 3: Invalid JSON
Confirm the backend fails safely.

### Test category 4: Timeout or API failure
Confirm the UI shows graceful fallback behavior.

---

## 15. Deployment Workflow

### Frontend deployment
Deploy the Next.js app to a web host that supports App Router.

### Backend deployment
Deploy the Python API independently.

### Post-deploy flow
- set environment variables
- confirm API access
- test the generator path
- test the audit path
- test the blocking path

---

## 16. End-to-End Demo Workflow

### Demo script
1. open homepage
2. explain the safety layer
3. launch the assistant
4. submit a safe query
5. show the safe output
6. submit a risky query
7. show the block message
8. mention future LiveKit and grounding expansion

### Demo success condition
The audience should clearly understand that the second AI checks the first AI before the answer is shown.

---

## 17. What the Website Should Feel Like

The final experience should feel:
- premium
- controlled
- high-trust
- minimal
- modern
- serious
- explainable

The product should not feel like a noisy chatbot. It should feel like a civic AI safety interface.

---

## 18. What Should Never Happen

The website should never:
- show answers before audit
- expose secrets in the browser
- confuse generator and auditor roles
- allow broken audit output to pass silently
- require login for the MVP
- bury the safety layer from the user

---

## 19. Final Workflow Summary

FairZero works end to end like this:

1. user enters the website
2. user sees the product explanation
3. user asks a civic question
4. generator creates a response
5. auditor checks the response
6. the system validates the audit result
7. the frontend shows either a safe answer or a block message
8. the process remains visible, structured, and trustworthy

This is the complete workflow the website must follow from scratch to final user output.
