---
description: "Build a complete full-stack feature end-to-end with all gates"
agent: "conductor.powder"
---

# Build Full-Stack Feature

You are building a complete feature from database to UI, going through all quality gates.

Append `--auto` to the user request when you want Powder to keep looping through soft review findings automatically. Powder records the current feature state in `plans/powder-active-task-plan.md`.

`--auto` does not permit skipping mandatory agents or deliverables. frontend.design-system, frontend.storybook, and other required gates still have to run whenever the feature touches UI work.

## Context

Use @conductor.powder to orchestrate the full lifecycle:

### Phase 0: Design Audit

- **@frontend.design-system** — Component reuse plan (what exists, what's new)
- **@design.visual-designer** — Visual Implementation Spec from design mock (if provided)
- **@design.ux-engineer** — CRUD completeness and flow validation
- For faithful running-app-to-Figma work, add **@frontend.browsertesting** before capture to produce the canonical route/state inventory and screenshots that feed `generate_figma_design`

### Phase 1: Backend

- **@engineering.implementation** — Firestore model, Cloud Functions, security rules

### Phase 2: Frontend

- **@frontend.implementation** — UI components, pages, hooks, state management

### Phase 2.5: Component Documentation

- **@frontend.storybook** — Storybook stories for all new/modified UI components (stories with all variants, states, and responsive views)

### Phase 3: Quality Gates (all mandatory)

- **@quality.code-review** — Code review (APPROVED required)
- **@security.application** — Security audit (PASS required for security-relevant code)
- **@frontend.accessibility** — Accessibility audit (PASS required for UI code)
- **@frontend.browsertesting** — Browser verification (PASS required for nav-driven or app-shell UI work)

### Phase 4: Legal (if applicable)

- **@platform.pce** — Privacy/TOS update if new data collection

## Full-Stack Checklist

### Backend

- [ ] Firestore data model with TypeScript types
- [ ] Zod validation schemas
- [ ] Cloud Functions with auth + authorization + validation
- [ ] Firestore security rules
- [ ] Backend tests (emulator)

### Frontend

- [ ] React components following design system
- [ ] TanStack Query hooks for data fetching
- [ ] Form with react-hook-form + Zod
- [ ] Loading, error, empty states
- [ ] Responsive layout verified at 320px (mobile), 768px (tablet), and 1280px (desktop)
- [ ] Mobile interactions operable (touch targets, no hover-only behaviors)
- [ ] Frontend tests (RTL + Vitest)
- [ ] Storybook stories for all new components (all variants and states)
- [ ] Figma components and assembled Figma views updated for all new or materially changed routes, pages, or app-shell surfaces
- [ ] Figma iconography matches the app icon library; never use emojis or emoticons as UI icons
- [ ] For nav-driven UI work: Main Navigation Coverage Matrix completed for every primary destination
- [ ] For running-app-to-Figma work: browser-verified route/state inventory exists and `generate_figma_design` captured each reachable route/state before any `use_figma` cleanup

### Quality

- [ ] All tests passing
- [ ] Code review: APPROVED
- [ ] Security audit: PASS
- [ ] Accessibility audit: PASS
- [ ] For nav-driven UI work: Browser test PASS for main navigation coverage
- [ ] Documentation updated

## Instructions

1. Gather feature requirements
2. Run SpecKit pipeline if complex (spec → plan → tasks)
3. Audit design system (frontend.design-system)
4. Validate UX flow (design.ux-engineer)
5. Implement backend (engineering.implementation) and frontend (frontend.implementation) — in parallel if different files
6. For nav-driven or app-shell UI work, define the Main Navigation Coverage Matrix before final QA
7. If the goal is to faithfully mirror a running localhost app or live web app in Figma, run frontend.browsertesting to produce route/state evidence, then require frontend.design-system to capture with `generate_figma_design` before any `use_figma` refinement
8. If localhost or Figma MCP is unavailable for that capture workflow, return BLOCKED instead of fabricating placeholder screens
9. Run all quality gates
10. Fix any FAIL findings and re-audit
11. Present completion summary with commit message

## User Input

The feature I want to build: {{input}}
