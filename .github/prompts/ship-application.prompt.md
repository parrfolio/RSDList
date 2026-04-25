---
description: "Comprehensive step-by-step workflow to build an application from nothing to a deployed, feature-rich, beautiful product"
agent: "conductor.powder"
---

# Ship an Application (End-to-End)

The definitive workflow for building a complete application — from a blank canvas to a production-deployed product with beautiful UI, solid architecture, and quality gates at every step.

Append `--auto` to the user request when you want Powder to keep moving through phases without pausing for user approval. `--auto` is permission to continue — it is NOT permission to skip anything.

`--auto` does not permit skipping ANY agents or gates. Every agent that would run in normal mode MUST also run in auto mode. Specifically:

- **frontend.design-system** MUST be invoked before AND after every UI implementation phase (Reuse Plan + Figma sync)
- **frontend.storybook** MUST be invoked after every UI implementation phase (stories for all components)
- **frontend.accessibility**, **frontend.browsertesting**, **security.application**, **quality.code-review** MUST all run when their trigger conditions are met

Listing any mandatory agent's work as a "future recommendation" or "next step" instead of executing it is a violation. Execute it now or the phase is not done.

Use @conductor.powder to orchestrate the entire agent chain through this lifecycle.

## Pre-Flight: MCP Connectivity Check

Before starting any phase or task that explicitly requires Figma-backed sync, Figma artifact creation, or running-app-to-Figma live capture, verify that the required MCP servers are connected. Do not block generic UI planning or implementation work that does not yet need Figma operations.

**Required MCP servers for UI work:**

- **Figma MCP** (`figma`) — Required for Design System sync (component creation, token sync, view capture)

**How to check:**

1. Before any phase or task that requires Figma sync, Figma component/frame creation, or live capture, run `figma/whoami`
2. If it returns your Figma identity, the MCP is connected
3. If it fails or tools aren't loaded: Open Command Palette (`Cmd+Shift+P`) → `MCP: List Servers` → Start the `figma` server → Authenticate if prompted
4. Stop and ask the user to complete that startup/auth flow before moving on
5. Do NOT allow a Figma-required phase or task to continue without a connected Figma MCP

**Why this exists:** Agents have historically claimed "Figma MCP not available" to skip the Design System gate entirely, then marked it N/A in the Phase Gate Receipt. The MCP works — it just needs to be started. This pre-flight prevents that bypass.

## The Complete Workflow

```
Step 1: Discovery ──────── Is this idea worth building?
Step 2: Architecture ───── What are we building and how?
Step 3: Scaffold ────────── Stand up the project skeleton
Step 4: Backend ─────────── Configure Firebase services
Step 5: Visual Identity ── Design tokens, theme, brand
Step 6: Marketing Site ─── Public-facing landing page
Step 7: App Shell ────────── Authenticated layout skeleton
Step 8: Screen Mocks ───── Prove the visual language
Step 9: Auth ──────────────── Authentication and authorization (Optional)
Step 10: Features ────────── Build features iteratively
Step 11: Billing ─────────── Stripe payments (if SaaS)
Step 12: Polish ──────────── Full quality pass
Step 13: Pre-Launch ──────── Legal, CI/CD, production config
Step 14: Launch ──────────── Deploy and monitor
```

---

### Step 1: Discovery — Is This Worth Building?

**Prompt**: `/critical-thinking-review` + `/value-realization-analysis`

Before writing a single line of code, stress-test the idea:

- **@Critical Thinking** — Challenge every assumption. Play devil's advocate.
- **Value Realization skill** — Will users discover clear value? What's the "aha moment"?

**Gate**: You should be able to articulate in one sentence what the product does, who it's for, and why they'd pay for it (or use it). If you can't, keep iterating here.

---

### Step 2: Architecture — Plan Before You Build

**Prompt**: `/architect-new-project`

Day 0 architectural decisions that shape everything:

- **@Critical Thinking** — Challenge stack and architecture assumptions
- **@architecture.engineer** — Produce the 9-section architecture document
- **@frontend.design-system** — Design system strategy
- **@security.application** — Security architecture review

**Deliverables**: Architecture decision document, frontend plan, backend plan, project structure map, open questions resolved.

**Gate**: Architecture document approved by user before proceeding.

---

### Step 3: Scaffold — Stand Up the Skeleton

**Prompt**: `/scaffold-new-app` (or `/scaffold-monorepo` for complex projects)

Execute the architecture plan into actual files:

- **@architecture.engineer** — pnpm monorepo, React + Vite, TypeScript strict, Tailwind v4, Vitest

**Deliverables**: Working project that builds and runs (empty shell).

---

### Step 4: Backend Services — Configure Backend

**Prompt**: `/scaffold-backend-setup`

Set up the backend foundation:

- **@engineering.implementation** — Backend config, database rules/policies skeleton, serverless functions scaffold, local dev setup
- **@security.application** — Initial security rules/policies audit

**Deliverables**: Firebase project configured, local dev running, hosting configured.

---

### Step 5: Visual Identity & Theme (CRITICAL)

**Prompt**: `/design-foundation`

**This is the most important step before features.** Everything users see and feel comes from decisions made here. Do not skip or rush this step.

- **@frontend.design-system** with design-system skill — Establish tokens, theme, component baseline
- **@frontend.implementation** with design-system + product-designer skills — Build visual foundation
- **@design.ux-engineer** with product-designer skill — Validate layout, navigation, flow
- **@frontend.accessibility** — Accessibility audit of foundation UI
- Configure design tokens (colors, typography, spacing, shadows) as CSS custom properties
- Theme shadcn/ui components to match the brand (not default styles)
- Set up dark mode support from Day 1
- Brand font loaded and configured
- **@frontend.design-system** syncs all design tokens to Figma via the official Figma MCP — colors, typography scales, spacing, shadows, and border radii must exist as Figma variables/styles

**Deliverables**: Themed design tokens (CSS custom properties), Figma token sync complete, icon-library parity defined for code and Figma.

**Gate**: Design tokens established and synced to Figma before proceeding.

---

### Step 6: Marketing / Landing Page

Every product needs a front door — the public-facing experience that communicates value:

- **@frontend.marketing-site** with marketing-site skill — Build the landing page
- Hero with value proposition and primary CTA
- Feature highlights, social proof, how-it-works
- Responsive, accessible, SEO-ready (meta tags, OG tags, heading structure)
- Footer with legal links (placeholders for TOS/Privacy until Step 13)

**Deliverables**: Marketing/landing page (responsive, accessible).

**Gate**: Landing page reviewed and approved.

---

### Step 7: App Shell (Authenticated Layout)

The skeleton that all feature pages live inside:

- **@frontend.implementation** — Build the app shell
- Sidebar or top navigation (themed, responsive, collapsible)
- Top bar with breadcrumbs, user menu
- Main content area with proper landmarks
- Empty states and loading skeletons
- **@frontend.design-system** creates Figma components and assembled shell frames for every app shell element/state (nav items, sidebar, top bar, breadcrumbs, user menu, loading skeletons, primary shell routes) via the official Figma MCP
- For any step where the source of truth is the running app and the goal is to mirror the real UI in Figma, require browser-verified route/state evidence first, then `generate_figma_design` capture for each reachable route/state, then `use_figma` cleanup/refinement

**Deliverables**: App shell with navigation (responsive — sidebar collapses to mobile drawer), Figma components for all shell elements, assembled Figma app-shell frames.

**Gate**: App shell navigable and Figma components plus shell frames created. If the app shell is being captured from a running app, no substitute placeholder frames are allowed when localhost or Figma MCP is unavailable; the phase is BLOCKED instead.

---

### Step 8: Screen Mocks — Prove the Visual Language

Mock 2-4 representative screens before building real features:

- **@design.visual-designer** — Produce Visual Implementation Specs
- Dashboard/home view
- List/table view
- Detail/form view
- Settings view

**Deliverables**:

- 2-4 screen mocks proving the visual language
- Figma component library and assembled screen frames with synced tokens (@frontend.design-system via the official Figma MCP)
- Storybook initialized with stories for all baseline components (@frontend.storybook)
- Mobile responsiveness verified at 320px for all foundation screens

**Gate — Design Fidelity Approval**: User approves the visual direction. The marketing page, app shell, and mock screens must match the approved design foundation in spacing, color, typography, layout, and visual hierarchy. All foundation screens must be verified at 320px (mobile) and 768px (tablet) breakpoints. Figma component library and representative screen frames must be created. Storybook must be running with stories for all baseline components. Figma artifacts must use the real product icon system and never emojis or emoticons as UI icons. These approved mocks become the **visual contract** for all subsequent feature implementation. Any deviation from the approved design mocks during feature development requires explicit approval. Only proceed to features after the visual direction passes this gate.

---

### Step 9: Authentication — Identity & Access (Optional)

**Prompt**: `/build-auth-flow` (+ `/build-multi-tenant` if multi-tenant)

> **Optional Step**: If your application doesn't require user authentication, skip this step and proceed to Step 10. conductor.powder will ask whether to include this step during the workflow.

Now that the visual foundation exists, build auth with proper themed UI:

- **@engineering.implementation** — Firebase Auth, custom claims, RBAC, Firestore user profiles
- **@frontend.implementation** — Login, signup, forgot password pages (matching design foundation)
- **@security.application** — Security audit (MANDATORY — PASS required)

**Deliverables**: Working auth flow, role-based access, protected routes, security audit PASS.

---

### Step 10: Core Features — Build Iteratively

**Prompt**: `/build-full-stack-feature` or `/feature-from-idea` (repeat per feature)

For EACH feature, run the full agent pipeline:

1. **@frontend.design-system** — Component reuse plan (what exists, what's new)
2. **@design.visual-designer** — Visual Implementation Spec (if design mock provided)
3. **@design.ux-engineer** — CRUD completeness, flow validation
4. **@engineering.implementation** + **@frontend.implementation** — Backend + frontend implementation (parallel when possible)
   4a. **@data.synthetic** with synthetic-data skill — Generate realistic seed data, Storybook fixtures, and demo data for the feature's data models
5. **@frontend.storybook** — Storybook stories for new/modified app UI components (all states: default, hover, active, focused, loading, empty, error)
6. **@frontend.design-system** — Post-implementation Figma sync: create/update Figma components and assembled Figma views for every new or modified app component, route, or page surface via the official Figma MCP (`use_figma`, `generate_figma_design`). When the request is to faithfully mirror a running localhost app or live web app, require browser-verified route/state inventory and use `generate_figma_design` as the authoritative first capture step for each reachable route/state; `use_figma` is cleanup/refinement only after capture. Never use emojis or emoticons as UI icons.
7. **@quality.code-review** — Code review (APPROVED required)
8. **@security.application** + **@frontend.accessibility** — Security + accessibility gates (parallel, both PASS required)

**Supporting prompts for specific feature types:**

| Feature Type     | Prompt                     |
| ---------------- | -------------------------- |
| Forms            | `/build-form`              |
| Data tables      | `/build-data-table`        |
| Dashboards       | `/build-dashboard`         |
| Wizards          | `/build-wizard`            |
| Search           | `/build-search`            |
| Real-time        | `/build-realtime-feature`  |
| File uploads     | `/build-file-upload`       |
| Notifications    | `/build-notifications`     |
| Navigation       | `/build-navigation`        |
| Animations       | `/add-animations`          |
| State management | `/setup-state-management`  |
| API integrations | `/api-integration`         |
| Synthetic data   | `/generate-synthetic-data` |

**Gate**: Every feature must pass code review + all applicable quality gates before the next feature.

---

### Step 11: Billing — Payments & Subscriptions (If SaaS)

**Prompt**: `/setup-stripe-billing`

- **@billing.stripe** — Stripe architecture (products, prices, webhooks, entitlements)
- **@security.application** — Billing security audit (webhook verification, billing data rules)
- **@platform.pce** — Payment/subscription clauses for legal docs
- **@frontend.implementation** — Checkout UI, billing portal, plan selection (matching design foundation)

**Gate**: Stripe test mode working end-to-end, security audit PASS.

---

### Step 12: Polish — Full Quality Pass

**Prompts**: `/accessibility-audit` + `/security-audit` + `/code-review` + `/performance-optimization`

Full-application quality sweep:

- **@frontend.accessibility** — Complete accessibility audit (WCAG 2.2 AA)
- **@security.application** — Complete security audit (Firestore rules/policies, Cloud Functions, auth, storage)
- **@quality.code-review** — Full codebase review
- **@frontend.design-system** — Final Figma library audit: verify every app UI component in the codebase has a matching Figma component with correct variants, tokens, states, and icon parity, and that every primary user-facing view has a matching Figma frame. Flag any Figma-to-code drift.
- **Performance** — Lighthouse scores, bundle analysis, lazy loading, image optimization
- **Responsive** — Verify all pages at 320px (mobile), 768px (tablet), and 1280px (desktop) breakpoints. All interactive elements operable, no horizontal scrolling, no content loss.
- **Testing** — Coverage gaps, edge cases, error handling

**Gate**: All audits PASS. No CRITICAL or HIGH findings unresolved. All pages verified responsive at 320px minimum. Figma library fully synced with codebase components and primary user-facing views. For live app to Figma tasks, every captured route/state must come from `generate_figma_design` or the workflow remains BLOCKED.

---

### Step 13: Pre-Launch — Legal, CI/CD, Production

**Prompts**: `/draft-legal-docs` + `/setup-cicd-deployment` + `/generate-docs`

- **@platform.pce** — Terms of Service, Privacy Policy, Cookie Policy (legally reviewed)
- **CI/CD** — GitHub Actions pipeline (lint → test → build → deploy to Firebase)
- **Production config** — Environment variables, Firebase production project, error tracking
- **Documentation** — README, API docs, deployment guide
- **Smoke tests** — End-to-end flow verification on staging

**Gate**: Legal docs published, CI/CD deploying to staging successfully, smoke tests passing.

---

### Step 14: Launch — Ship It

- Deploy to production via CI/CD
- Verify production deployment (smoke test key flows)
- Monitor error tracking for first 24-48 hours
- Gather initial user feedback
- Plan first iteration based on real usage

---

## Post-Launch Prompts

After launch, use these for ongoing development:

| Need                | Prompt                      |
| ------------------- | --------------------------- |
| Bug fixes           | `/fix-bug`                  |
| New features        | `/build-full-stack-feature` |
| Synthetic data      | `/generate-synthetic-data`  |
| Tech debt           | `/refactor-tech-debt`       |
| Dependencies        | `/dependency-maintenance`   |
| Design drift        | `/audit-design-system`      |
| Onboarding          | `/build-onboarding`         |
| Email system        | `/build-email-system`       |
| New agent           | `/new-agent`                |
| Challenge decisions | `/critical-thinking-review` |

## Instructions

1. Start at Step 1 — work through every step in order
2. Each step has a gate — get user approval before proceeding
3. **Optional steps** (marked "Optional") — conductor.powder must still present these to the user and ask whether to include them. Do not silently skip optional steps.
4. Step 5 (Visual Identity) is the most commonly skipped and most commonly regretted step — take the time
5. Features in Step 10 are iterative — build one at a time through the full pipeline
6. Quality gates are not optional — every FAIL must be remediated before proceeding
7. conductor.powder orchestrates the entire workflow — she delegates to the appropriate subagents at each step and ensures all gates pass before advancing
8. **Figma documentation is mandatory** — every app UI component must have a matching Figma component created via the official Figma MCP (`use_figma`, `generate_figma_design`). Design tokens must be synced to Figma as variables/styles. The Figma library is a living document that mirrors the codebase component library. @frontend.design-system is responsible for creating and maintaining Figma components at every step where UI components are created or modified.

## User Input

The application I want to build: {{input}}
