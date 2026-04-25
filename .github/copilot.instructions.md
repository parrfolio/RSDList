---
description: "Project conventions, agent framework, SpecKit workflow, and code style guidelines for the project. Read this before contributing or using agents."
applyTo: "**"
---

## Project Overview

Multi-agent AI orchestration framework for GitHub Copilot. All complex work flows through conductor.powder (the conductor) who delegates to specialized subagents. Full context: `.github/PROJECT_CONTEXT.md`.

## Active Technologies

TypeScript strict, React + Vite + React Router, Tailwind CSS v4 + Shadcn/ui (Radix), lucide-react, Zustand (UI state), TanStack React Query (server state), Firebase Auth/Firestore/Functions (Node 20)/Hosting, pnpm (flat), Zod, Vitest.

## Project Structure

```text
src/                    # Application source
  components/ui/        # shadcn/ui generated components
  hooks/                # React Query hooks, auth, Zustand
  lib/                  # Firebase config, auth helpers, utils
  pages/                # Route components
  stores/               # Zustand stores
  types/                # TypeScript types + Zod schemas
specs/                  # Feature specifications (SpecKit)
agents/                 # Agent registry (agent-registry.json)
```

## Agent Framework

Conductor/subagent architecture. **35 agents** in `.github/agents/`. Full metadata: `agents/agent-registry.json`.

- `@conductor.powder` — Orchestrates all complex work. Never writes code.
- `@delivery.tpm` — Autonomous planner. Writes plans for conductor.powder.
- SpecKit agents: `@speckit.specify`, `@speckit.plan`, `@speckit.tasks`, `@speckit.implement`, `@speckit.analyze`

## UI Delivery Contract

For UI-bearing work, `--auto` means continue without waiting for user approval between phases. It does not permit compressing, reordering, or skipping phases or quality gates.

- UI phases are not complete until `frontend.design-system` runs before implementation for the reuse plan and after implementation for Figma sync.
- Post-implementation Figma sync must create or update matching Figma components, assembled user-facing view frames, variants, and tokens via the official Figma MCP when the phase establishes or changes UI patterns.
- Figma artifacts must preserve icon-library parity with the codebase. If the app uses `lucide-react`, use matching Lucide icons or clearly named Lucide placeholders. Never use emojis or emoticons as UI icons.
- UI phases are not complete until `frontend.storybook` creates or updates Storybook coverage for all new or modified components, including setup when Storybook is missing.
- If Figma sync or Storybook coverage is missing, the phase must remain open and loop for remediation rather than being marked done.
- Detailed execution rules live in `.github/agents/conductor.powder.agent.md`, `.github/agents/frontend.design-system.agent.md`, and `.github/agents/frontend.storybook.agent.md`.

## SpecKit Workflow

constitution → specify → clarify → plan → tasks → implement → analyze. Artifacts: `specs/<branch-name>/`. Constitution: `.specify/memory/constitution.md`.

## Instruction Index

File-specific rules in `.github/instructions/` — auto-applied by `applyTo` glob. Full docs: `docs/available-instructions.md`.

| Instruction                      | Applies To                                                             |
| -------------------------------- | ---------------------------------------------------------------------- |
| `conductor-discipline`           | `**`                                                                   |
| `protected-framework-files`      | `**`                                                                   |
| `no-heredoc`                     | `**`                                                                   |
| `a11y`                           | `**/*.tsx, **/*.jsx, **/*.html, **/*.css, **/*.scss`                   |
| `design-fidelity`                | `**/*.tsx, **/*.jsx, **/*.css, **/*.scss, **/*.html`                   |
| `memory-bank`                    | `**/memory-bank/**, **/Copilot-Processing.md`                          |
| `spec-driven-workflow-v1`        | `**/specs/**, **/*.prompt.md`                                          |
| `agents`                         | `**/*.agent.md`                                                        |
| `copilot-thought-logging`        | `**/Copilot-Processing.md`                                             |
| `git-workflow`                   | `**/.gitignore, **/CHANGELOG.md, **/.github/workflows/**`              |
| `context-engineering`            | `**/*.md, **/.github/**`                                               |
| `typescript-5-es2022`            | `**/*.ts`                                                              |
| `reactjs`                        | `**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css, **/*.scss`            |
| `tailwind-v4-vite`               | `vite.config.*, **/*.css, **/*.tsx, **/*.ts, **/*.jsx, **/*.js`        |
| `tanstack-start-shadcn-tailwind` | `**/*.ts, **/*.tsx, **/*.js, **/*.jsx, **/*.css, **/*.scss, **/*.json` |
| `nodejs-javascript-vitest`       | `**/*.js, **/*.mjs, **/*.cjs`                                          |
| `object-calisthenics`            | `**/*.{cs,ts,java}`                                                    |
| `test-engineering`               | `**/*.test.ts, **/*.spec.ts, **/*.test.tsx, **/*.spec.tsx`             |
| `markdown`                       | `**/*.md`                                                              |
| `prompt`                         | `**/*.prompt.md`                                                       |
| `instructions`                   | `**/*.instructions.md`                                                 |
| `agent-skills`                   | `**/SKILL.md`                                                          |
| `visual-description-protocol`    | `**`                                                                   |
| `conductor-style-guides`         | `**`                                                                   |

Skills in `.github/skills/` provide domain knowledge — injected by conductor.powder based on SKILL.md `agents:` field.

## Commands

```bash
pnpm install              # Install dependencies
pnpm dev                  # Start web + emulators + functions watch
pnpm lint                 # ESLint
pnpm typecheck            # TypeScript strict check
pnpm test                 # Vitest
```

## Code Style

- TypeScript strict — never use `any`, prefer `undefined` over `null`
- shadcn/ui patterns for UI; React Query for server state; Zustand for UI state
- Optimistic updates for mutations; Zod validation at boundaries
- Minimal comments — code should be self-explanatory
- Prefer functions over classes; always use async/await
- TDD: write tests first, see them fail, implement, see them pass
