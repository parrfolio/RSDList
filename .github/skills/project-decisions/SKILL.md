---
name: project-decisions
description: "Consolidated project-level architectural decisions, technology choices, and coding conventions. The authoritative reference for 'what we chose and why' — prevents re-litigation of settled decisions."
agents:
  [
    "engineering.implementation",
    "frontend.implementation",
    "architecture.engineer",
    "quality.test-architecture",
    "reliability.srre",
    "design.visual-designer",
    "frontend.design-system",
    "quality.code-review",
    "architecture.exploration",
    "architecture.context",
  ]
---

# Project Decisions

Settled architectural decisions, technology choices, and coding conventions for the entire project. Every agent must treat these as non-negotiable unless the user explicitly overrides.

## When to Use

- Before starting ANY implementation task — verify your approach aligns with these decisions
- When choosing between libraries, patterns, or approaches — the answer is likely already decided here
- When reviewing code — confirm it follows these settled conventions
- When onboarding a new agent or skill — this is the single source of truth for "what we chose and why"

## Technology Stack (Settled — Do Not Re-Litigate)

| Decision          | Choice                                                  | Rationale                               |
| ----------------- | ------------------------------------------------------- | --------------------------------------- |
| UI Framework      | React 19+ (functional components, hooks only)           | Ecosystem, team expertise               |
| Language          | TypeScript 5.x strict, ES2022 target, pure ESM          | Type safety, modern features            |
| Build Tool        | Vite with `@tailwindcss/vite` plugin                    | Speed, Tailwind v4 native support       |
| Styling           | Tailwind CSS v4 (CSS-first config, `@theme` directive)  | Utility-first, no JS config file        |
| Component Library | shadcn/ui exclusively                                   | Customizable, accessible, owns the code |
| UI Primitives     | Radix UI (via shadcn/ui)                                | A11y-first headless components          |
| State (UI)        | Zustand                                                 | Simple, minimal boilerplate             |
| State (Server)    | TanStack React Query                                    | Cache, mutations, optimistic updates    |
| Forms             | react-hook-form + Zod validation                        | Performance, schema-first validation    |
| Icons             | lucide-react                                            | Consistent, tree-shakeable              |
| Backend           | Firebase (Firebase Auth, Firestore, Cloud Functions, Firebase Storage, Hosting) | Serverless, real-time, managed          |
| Monorepo          | pnpm workspaces                                         | Fast, strict, disk-efficient            |
| Testing           | Vitest + React Testing Library                          | Fast, Vite-native, component testing    |
| Routing           | TanStack Start (file-based with SSR)                    | SSR, type-safe routing                  |
| PDF               | jsPDF + html2canvas                                     | Client-side generation                  |

**Routing clarification**: TanStack Start for TanStack Start projects. `architecture.engineer`'s React Router v6 reference applies to non-TanStack projects only. When in doubt, check the project's `package.json`.

## Forbidden Alternatives (NEVER Install)

| Category            | Forbidden                                         | Why                                      |
| ------------------- | ------------------------------------------------- | ---------------------------------------- |
| Component Libraries | MUI, Chakra, Mantine, Ant Design, daisyUI, HeroUI | shadcn/ui is the sole approved library   |
| CSS Frameworks      | Bootstrap, Bulma, styled-components, Emotion      | Tailwind v4 is the sole styling approach |
| Config Files        | `tailwind.config.js`, `postcss.config.js`         | Tailwind v4 uses CSS-first config only   |
| Module Systems      | CommonJS (`require`, `module.exports`)            | Pure ESM only                            |
| Class Patterns      | React class components                            | Functional components + hooks only       |

## Coding Conventions (Settled)

### TypeScript

- NEVER use `any` — prefer `unknown` + type narrowing
- Discriminated unions for state machines and real-time events
- Kebab-case filenames: `user-session.ts`, `data-service.ts`
- PascalCase for types/interfaces/classes; camelCase for everything else
- No `I` prefix on interfaces — use descriptive names
- JSDoc on public APIs with `@remarks` or `@example`
- Always use `@/` alias for imports; never relative paths

### JavaScript (Non-TS Files)

- Never use `null` — always `undefined` for optional values
- Prefer functions over classes
- Async/await mandatory; use `node:util` promisify for callbacks
- No comments unless absolutely necessary — self-explanatory code

### React

- Functional components with hooks as default
- Composition over inheritance
- Error and pending boundaries on all routes
- React Testing Library query priority: `getByRole` first, `getByTestId` last resort

### Styling

- Tailwind v4: `@import "tailwindcss"` — never old `@tailwind` directives
- `@theme` directive for design token customization
- 60-30-10 color rule: 60% primary (cool/light), 30% secondary, 10% accent
- NEVER use hot-color backgrounds (purple, magenta, red, orange, yellow, pink)
- Text: dark neutrals (`#1f2328` – `#333333`); never yellow or pink text
- Design tokens via CSS custom properties — no scattered inline hex values

### Testing

- TDD: write failing test → minimal code → pass → refactor
- Arrange-Act-Assert with comments separating each phase
- Maximum 3-level `describe` nesting
- Factory functions for test data; no random data
- Never change production code solely to make it easier to test
- `it.skip` must include a reason and issue link

### Git

- Conventional Commits: `<type>(<scope>): <description>`
- Branch naming: `<type>/<short-description>` in kebab-case
- Default merge strategy: squash merge
- Never force push to `main`; never commit directly to `main`

## Architecture Decisions

### Data Fetching Split

- **Route loaders** for SSR and initial page data (first paint)
- **React Query** for client mutations and secondary data (everything else)
- Loaders feed the shell; queries hydrate the details

### File Organization

| Path                 | Purpose                                         |
| -------------------- | ----------------------------------------------- |
| `src/components/ui/` | shadcn/ui components                            |
| `src/lib/schemas.ts` | Zod schemas                                     |
| `src/routes/`        | File-based routing (TanStack Start)             |
| `@/` alias           | All internal imports — never use relative paths |

### Object Calisthenics (Business Domain Code)

Applied to `.ts`, `.cs`, `.java` files containing business logic:

| Rule               | Constraint                                    |
| ------------------ | --------------------------------------------- |
| Indentation        | Max 1 level per method                        |
| Else keyword       | Forbidden — use early returns or polymorphism |
| Primitives         | Wrap in domain objects                        |
| Collections        | First-class collection wrappers               |
| Dot chains         | One dot per line                              |
| Abbreviations      | Forbidden in naming                           |
| Class size         | Max 50 lines                                  |
| Instance variables | Max 2 per class                               |
| Encapsulation      | No public getters/setters exposing internals  |

## Design Authority

- **design-system** skill is the single source of truth for fonts, colors, spacing, shadows, and component theming
- Font: **DM Sans** (non-negotiable)
- Brand purple: `#5900FF` (interactive/active elements only — not backgrounds)
- All other skills DEFER to design-system for specific token values

## Agent Pipeline (Reference)

**Orchestration**: conductor.powder orchestrates all work; conductor.powder NEVER writes code directly.

**UI pipeline order**: frontend.design-system → design.visual-designer → design.ux-engineer → frontend.implementation → frontend.storybook → quality.code-review → frontend.accessibility

### Mandatory Quality Gates

| Gate          | Agent                                               | Scope                                  | Requirement                          |
| ------------- | --------------------------------------------------- | -------------------------------------- | ------------------------------------ |
| Security      | security.application                                | Auth, Firestore rules, Cloud Functions | PASS required before merge           |
| Accessibility | frontend.accessibility                              | All UI code                            | WCAG 2.2 AA PASS required            |
| Storybook     | frontend.storybook                                  | Every UI implementation phase          | Stories created and verified         |
| TDD           | engineering.implementation, frontend.implementation | All implementation                     | Tests written before production code |

## Decision Changelog

When a decision in this file is overridden by the user or a new decision is made:

1. Update the relevant table row or section
2. Add a comment in the PR description noting the decision change
3. Notify conductor.powder so downstream agents pick up the change
