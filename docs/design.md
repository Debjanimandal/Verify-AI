# FairZero (Civic Edition) — Design System & UI Specification

## 1. Design Goal

FairZero should feel like a premium, serious, browser-first civic AI product. The visual language must communicate trust, precision, restraint, and safety.

The design direction is intentionally strict:
- black background
- monochrome palette
- no loud gradients
- no playful bright colors
- no clutter
- no visual noise
- clean cards, clean spacing, sharp hierarchy

The product must look like a real modern AI safety platform, not a generic chatbot.

---

## 2. Visual Identity

### Design keywords
- monochrome
- clinical
- minimal
- futuristic
- calm
- trustworthy
- editorial
- premium
- high-contrast
- structured

### Emotional target
The interface should make the user feel:
- the system is serious
- the system is technically strong
- the system is easy to trust
- the system is not hiding anything

---

## 3. Core Design Rule

The default visual system must be based on a pure dark mode shell:

- main background: near-black
- surfaces: charcoal / graphite
- borders: soft gray
- text: white and off-white
- muted secondary text: gray
- accent usage: minimal and restrained

### Strict monochrome rule
Do not use bright colors as the identity of the interface. The design language should rely on contrast, weight, spacing, border structure, and motion rather than color-heavy decoration.

---

## 4. Recommended Design Stack

### Core UI stack
- Next.js App Router
- Tailwind CSS
- shadcn/ui
- Radix UI primitives

### Motion stack
- GSAP for page-level animation, scroll-driven movement, and hero transitions
- Motion for React (formerly Framer Motion) for component interactions, enter/exit states, and UI transitions
- anime.js only for optional decorative micro-interactions or experimental motion pieces

### Icon stack
- Lucide React

### Content/UI behavior stack
- React Hook Form for forms
- Zod for validation
- optional TanStack Query for async state later

---

## 5. Why These Libraries

### shadcn/ui
Use this as the core component foundation because it gives accessible, customizable components that are meant to be built into your own design system rather than treated as a fixed library.

### Tailwind CSS
Use this for layout, spacing, colors, responsiveness, and rapid visual control.

### Motion for React
Use this for clean component-level transitions, hover states, mount/unmount animation, and smooth interaction polish.

### GSAP
Use this for premium movement in page entrances, section reveals, hero compositions, timeline sequencing, and scroll-linked storytelling.

### anime.js
Use only when a small, precise animation is needed. It is optional, not primary.

### FlowKit note
If by FlowKit you mean the Figma Flowkit product, it is not a primary design dependency because that product is no longer available for purchase. The FairZero system should instead rely on shadcn/ui, Tailwind, GSAP, and Motion for React for the real implementation.

---

## 6. Color System

### Primary palette
- Background: #000000 or very close black
- Surface 1: deep charcoal
- Surface 2: slightly lighter charcoal
- Border: muted gray
- Text primary: white
- Text secondary: cool gray
- Text tertiary: darker gray

### Status rendering rule
Avoid saturated semantic colors as the main identity.
Instead use:
- typography
- icon shape
- outline style
- contrast changes
- subtle border treatment
- label text such as SAFE / BLOCKED

### Important note
Even for PASS/BLOCK, keep the interface monochrome-first. Use structure, not neon color, to communicate state.

---

## 7. Typography System

### Font direction
Use a modern sans-serif font with a sharp, clean presence.

Recommended choices:
- Inter
- Geist
- Manrope
- Space Grotesk for headings if a more futuristic tone is desired

### Typography hierarchy

#### H1
- large
- bold
- compact tracking
- strong contrast

#### H2 / section headings
- medium-bold
- short line length
- clear spacing above and below

#### Body text
- readable
- slightly smaller than expected for editorial clarity
- high line height

#### Metadata / labels
- uppercase or semi-uppercase where needed
- small size
- wide tracking
- muted color

### Typography behavior rules
- avoid oversized paragraphs
- avoid dense blocks of text
- keep explanations short and structurally clean
- use line breaks generously

---

## 8. Layout System

### Global layout rule
Use a centered content column with generous side margins and strong rhythm.

### Recommended grid
- 12-column responsive grid for desktop
- 4-column or stacked layout for mobile
- max-width container for main content

### Desktop spacing behavior
- broad hero spacing
- clear card separation
- generous vertical section gaps
- no tight cluttered layouts

### Page structure principle
Each page should have:
- top header or nav zone
- main content block
- secondary explanation block
- footer or supporting section

---

## 9. Surface and Card Language

### Cards
Cards should feel like glassless dark panels, not soft pastel chat bubbles.

### Card design rules
- black or near-black fill
- thin gray border
- subtle shadow only if needed
- slightly rounded corners
- internal padding that feels spacious
- content aligned with a clear grid

### Card variants
- hero card
- feature card
- agent status card
- audit result card
- debug card
- sample prompt card

### Card style
The cards should look modular and engineered, not decorative.

---

## 10. Border, Radius, and Shadow Rules

### Borders
Use thin borders to define structure.

### Radius
Use consistent moderate rounding. Avoid overly bubbly corners.

### Shadows
Use only subtle shadows if needed. The visual language should mostly rely on contrast and border structure.

### Divider style
Use quiet dividers rather than obvious lines.

---

## 11. Motion System

Motion must support the product, not distract from it.

### Primary motion tool
- GSAP for hero sequences, scroll sections, and cinematic introduction

### Component motion tool
- Motion for React for buttons, cards, modals, and state transitions

### Optional micro motion tool
- anime.js for tiny decorative details or special demos

### Motion principles
- no chaotic bouncing
- no excessive particle effects
- no childish hover motion
- all animations should feel precise and intentional
- motion should reveal structure, not hide it

### Motion timing
- short entrance transitions
- soft staggered reveals
- controlled hover movement
- smooth loading states

### Motion tone
The motion should feel like an advanced system interface, not a toy app.

---

## 12. Required Pages

## 12.1 Landing Page
This is the public introduction.

### Purpose
- explain FairZero in one glance
- establish trust
- guide the user into the app

### Required sections
- hero banner
- concise product explanation
- how it works section
- safety principle section
- featured use cases
- launch CTA

### Visual style
- dramatic black background
- large title
- thin supporting copy
- a strong central card or split-panel layout

---

## 12.2 Main Assistant Page
This is the core functional page.

### Required sections
- prompt input
- submit control
- generator loading state
- auditor loading state
- final answer card
- blocked warning card
- optional transparency drawer

### Layout idea
- left side or top block for input
- middle zone for process steps
- bottom or side zone for result

### UX rule
The two-agent flow must be visually obvious.

---

## 12.3 Demo Page
This page is for judges and presentations.

### Purpose
- show prefilled prompts
- demonstrate safe vs blocked responses quickly
- avoid friction

### Required sections
- sample prompt buttons
- live result display
- debug panel
- short explanation strip

---

## 12.4 About Page
This page explains the idea and architecture.

### Required sections
- mission summary
- dual-agent explanation
- safety explanation
- future scope

### Style
- text-first
- calm editorial pacing
- strong hierarchy

---

## 12.5 Optional Voice Page
If voice is included, this page should support LiveKit style interaction.

### Required sections
- microphone control
- connection state
- realtime waveform or status display
- transcript area
- response area

### Style
- minimal
- technical
- quiet

---

## 13. Main Interface Components

### 13.1 Hero Block
- project title
- one-line subtitle
- CTA
- supporting statement

### 13.2 Prompt Composer
- textarea or input field
- submit button
- optional voice trigger
- optional example chips

### 13.3 Agent Status Strip
Shows:
- Agent 1 Generating
- Agent 2 Auditing
- Final Decision

### 13.4 Result Panel
Shows safe response output.

### 13.5 Block Panel
Shows the fixed safety warning.

### 13.6 Debug Drawer
Hidden by default.
Shows:
- raw generator output
- audit JSON
- flags
- model used

### 13.7 Sample Prompt Cards
Clickable example prompts for faster demo flow.

---

## 14. Page Composition Rules

### Hero page composition
- headline top-left or centered
- supporting copy beneath
- one major visual block
- one CTA

### Assistant page composition
- input at the top or left
- status lane in the middle
- output panel at the bottom or right

### Demo page composition
- prompt selection on one side
- live output on the other side

### About page composition
- modular content blocks stacked vertically

---

## 15. Spacing System

### Base spacing rule
Spacing should be generous and consistent.

### Recommended rhythm
- large top spacing for page introduction
- medium spacing between sections
- tight spacing only inside cards
- no compressed sections

### Intent
The design should breathe.

### Mobile rule
On smaller screens, content should stack naturally with clear vertical rhythm.

---

## 16. Grid and Alignment Rules

### Desktop
- use a strict grid
- align cards and section headings to the same visual axis
- keep content symmetry where useful

### Mobile
- one-column stacked layout
- no cramped side-by-side panels unless absolutely necessary

### Alignment rule
Every major element should feel like it belongs to the same system.

---

## 17. Button Design

### Primary button
- solid dark or light contrast button depending on section
- crisp border
- clear label
- controlled hover motion

### Secondary button
- outline style
- lighter emphasis
- used for demo actions and sample prompts

### Hover behavior
- subtle scale or translate
- no bounce
- no bright glow overload

---

## 18. Input Design

### Prompt input
- large enough for real use
- high-contrast text
- clear focus state
- minimal placeholder text

### Focus state
Use border and glow restraint only. The focus state should be obvious but not loud.

### Voice entry
If present, the voice entry control should feel secondary but visible.

---

## 19. Loading States

The loading states are very important for the dual-agent story.

### Required loading states
- Agent 1 Generating...
- Agent 2 Auditing for Safety...

### Visual style
- monochrome progress indicators
- pulse or shimmer only if subtle
- no cartoon loaders

### Purpose
Users should clearly see the internal separation between generation and verification.

---

## 20. Output Design

### Safe output card
- clean readable answer
- neutral monochrome panel
- clear approval label

### Blocked output card
- strong border treatment
- warning message in monochrome
- no aggressive red is required if strict monochrome is being preserved
- optionally use all-caps label and dense framing for severity

### Reason display
A short explanation may be shown under the main result for transparency.

---

## 21. Background and Atmosphere

### Main background
Pure black or near-black.

### Layering
Add depth using:
- subtle gradients in gray only
- low-opacity noise if desired
- faint radial light only if barely visible

### No-go rules
- no colorful blobs
- no neon visual noise
- no playful illustrations unless very controlled

### Atmosphere goal
The app should feel like a premium AI operations console.

---

## 22. Icon and Graphic Language

### Icons
Use small, functional icons only.

### Icon style
- thin
- geometric
- minimal
- monochrome

### Graphic usage
Use line-based graphics, flow arrows, or structured diagrams.

Avoid overly illustrated or decorative graphics.

---

## 23. Copy and Tone Rules

### Tone
- clear
- confident
- concise
- technical but readable

### Copy behavior
- no long paragraphs inside cards
- short labels preferred
- simple trust language

### Examples
- “Agent 1 Generating”
- “Agent 2 Auditing”
- “Response Approved”
- “Response Blocked”

---

## 24. Layout Ideas for the Main Assistant Screen

### Option A: Vertical flow
- top prompt
- middle process cards
- bottom result card

### Option B: Split panel
- left: input and controls
- right: live status and output

### Option C: Three-step card flow
- generation card
- audit card
- final result card

### Best choice
For clarity, the three-step card flow is the strongest visual explanation.

---

## 25. Design Tokens

### Suggested tokens
- `bg-main`
- `bg-surface`
- `bg-surface-2`
- `border-subtle`
- `text-primary`
- `text-secondary`
- `text-muted`
- `shadow-soft`
- `radius-md`
- `radius-lg`
- `spacing-section`
- `spacing-card`

### Purpose
Design tokens make the system easy to reuse across pages.

---

## 26. Accessibility Rules

### Must follow
- strong contrast
- readable type sizes
- keyboard navigability
- visible focus states
- clear labels
- no color-only meaning

### Why this matters
A monochrome system can still be highly accessible if the contrast and hierarchy are done properly.

---

## 27. Responsive Behavior

### Desktop
- broader panels
- visible multi-column rhythm
- rich page composition

### Tablet
- reduced grid complexity
- fewer side-by-side sections

### Mobile
- single-column stack
- large touch targets
- simplified navigation
- reduced motion intensity if needed

---

## 28. Design System Consistency Rules

Every page should share:
- same background family
- same border style
- same spacing logic
- same heading style
- same button style
- same card treatment
- same motion language

This prevents the app from feeling like separate pages stitched together.

---

## 29. Suggested Visual References in Spirit

The project should feel closer to:
- dark editorial product design
- high-end AI console interfaces
- research dashboard aesthetics
- modern minimal SaaS landing pages

It should not feel like:
- a colorful marketing website
- a casual consumer chatbot
- a playful anime-style UI
- a game interface

---

## 30. Final Design Direction

FairZero should be built as a black, monochrome, premium civic AI interface with strong structure, clean spacing, subtle motion, and high visual confidence. The site should use shadcn/ui as the component backbone, Tailwind

