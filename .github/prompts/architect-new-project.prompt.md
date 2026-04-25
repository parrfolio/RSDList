---
description: "Plan the architecture for a new project before any PRD, features, or scaffolding — establish frontend + backend foundations"
agent: "conductor.powder"
---

# Architect a New Project

You are establishing the architectural foundation for a brand new project. No PRD exists yet. No features are defined. This is Day 0 — the decisions made here shape everything that follows.

Append `--auto` to the user request when you want Powder to keep iterating through soft findings without pausing for approval between non-destructive planning steps. Powder records loop state for this work in `plans/powder-active-task-plan.md`.

## Context

Use @conductor.powder to orchestrate:

1. **@Critical Thinking** — Challenge assumptions about scope, stack, and architecture before committing
2. **@architecture.engineer** — Design the technical architecture and produce the 9-section architecture document
3. **@frontend.design-system** — Establish the design system baseline (tokens, component strategy, theming)
4. **@security.application** — Security architecture review (auth model, data isolation, rules strategy)

## What This Prompt Produces

This is a PLANNING prompt, not an implementation prompt. The output is a set of architecture decision documents that feed into the scaffold prompts (`scaffold-new-app`, `scaffold-monorepo`, `scaffold-backend-setup`) when you're ready to build.

### Deliverables

1. **Architecture Decision Document** — Stack choices with rationale
2. **Frontend Architecture Plan** — Component strategy, routing, state management, styling approach
3. **Backend Architecture Plan** — Data model strategy, API surface, security model, hosting
4. **Design System Baseline** — Token palette, typography, component library strategy
5. **Security Architecture** — Auth model, authorization strategy, data isolation, threat model
6. **Project Structure Map** — Directory layout, package boundaries, dependency graph
7. **Open Questions & Risks** — What needs to be answered before building

## Architecture Discovery Questions

The agent should work through these with you before producing any documents:

### Product Shape

- What is this product in one sentence?
- Who are the users? (B2C / B2B / internal tool / developer tool)
- Single-tenant or multi-tenant?
- What scale are you designing for initially? (MVP / startup / enterprise)
- Is this a greenfield project or replacing something existing?

### Frontend Considerations

- What type of application? (SPA / SSR / static / hybrid)
- Primary device targets? (desktop-first / mobile-first / responsive)
- Offline support needed?
- Real-time features needed? (live updates, collaboration, chat)
- Complex forms or wizards?
- Data visualization / dashboards?
- Internationalization (i18n) from Day 1?
- What should the visual identity feel like? (brand colors, aesthetic, existing brand guidelines?)

### Backend Considerations

- Data model complexity? (simple CRUD / relational / graph-like / time-series)
- Expected data volume and query patterns?
- Third-party integrations needed? (payments, email, analytics, AI/ML)
- File storage requirements? (user uploads, media, documents)
- Background job processing needs?
- API strategy? (REST / GraphQL / Cloud Functions callable / mixed)
- Pricing/billing model? (free / freemium / subscription / usage-based)

### Operations & Security

- Auth requirements? (email/password, OAuth, SSO/SAML, magic link)
- Role-based access needed? How many roles?
- Compliance requirements? (GDPR, SOC2, HIPAA, PCI)
- CI/CD preferences? (GitHub Actions, other)
- Environment strategy? (dev / staging / production)
- Monitoring and error tracking approach?

## Standard Stack (Default)

Unless there's a compelling reason to deviate, the default stack is:

| Layer           | Technology                                     | Why                                                       |
| --------------- | ---------------------------------------------- | --------------------------------------------------------- |
| **Frontend**    | React 18+                                      | Component ecosystem, hiring pool, framework agent support |
| **Build**       | Vite                                           | Fast dev server, native ESM, Tailwind v4 plugin           |
| **Language**    | TypeScript strict                              | Type safety, Zod integration, better DX                   |
| **Styling**     | Tailwind CSS v4                                | Utility-first, v4 CSS-native, no config file              |
| **Components**  | shadcn/ui + Radix                              | Accessible primitives, customizable, copy-paste model     |
| **State**       | Zustand (client) + TanStack Query (server)     | Simple client state + powerful server cache               |
| **Forms**       | react-hook-form + Zod                          | Performant forms with schema validation                   |
| **Backend**     | Firebase (Firebase Auth, Firestore, Cloud Functions, Hosting) | Serverless, real-time, easy auth, good free tier          |
| **Functions**   | Node.js 20 + TypeScript                        | Same language as frontend, Firebase native                |
| **Payments**    | Stripe                                         | Best developer experience, webhook-driven                 |
| **Package Mgr** | pnpm workspaces                                | Fast, disk-efficient, monorepo-native                     |
| **Testing**     | Vitest + RTL + Firebase Emulator               | Fast, Vite-native, full local backend                     |
| **Icons**       | Lucide React                                   | Clean, consistent, tree-shakeable                         |

The Critical Thinking agent should challenge any default choices that don't fit the specific project needs.

## Architecture Document Structure (`architecture.engineer`'s 9 Sections)

1. **Tech Stack** — Technologies with version targets and justification
2. **Project Structure** — Directory layout, monorepo packages, module boundaries
3. **Frontend Architecture** — Routing, component patterns, state management, data fetching
4. **Backend Architecture** — Firebase services, Firestore data model, Cloud Functions API
5. **Authentication & Authorization** — Auth providers, RBAC model, custom claims, security rules
6. **Styling & Design System** — Tailwind config, tokens, shadcn/ui customization, theming
7. **Testing Strategy** — Unit, integration, e2e approach, coverage targets
8. **Deployment & CI/CD** — Environments, GitHub Actions, Firebase deploy
9. **DevEx & Tooling** — ESLint, Prettier, editor config, scripts, debugging

## Instructions

1. Start by asking the Discovery Questions above (batch related questions, don't ask one at a time)
2. Run the answers through @Critical Thinking to challenge assumptions and identify blind spots
3. Delegate to @architecture.engineer to produce the 9-section Architecture Document based on confirmed decisions
4. Delegate to @frontend.design-system to establish the design system baseline
5. Delegate to @security.application to review the security architecture and auth model
6. Compile all deliverables into a single architecture plan
7. Present the plan to the user with a summary of decisions, open questions, and recommended next steps
8. Once approved, the user can proceed with `scaffold-new-app` to execute the plan

## User Input

What I'm building: {{input}}
