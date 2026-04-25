# Context & Memory Architecture Guide

How Snow Patrol manages AI context across sessions, reduces context window consumption, and maintains project knowledge.

## The Problem

AI coding assistants lose all context when the context window resets. Each new session starts from zero — the AI must re-discover the project, re-read files, and re-learn conventions. This wastes context window space and slows down work.

## The Solution: Tiered Memory

Snow Patrol uses three layers of memory, each optimized for different access patterns:

### Layer 1: Instant Context (loaded automatically)

These files are injected into every AI session without any action required:

| File                              | Purpose                                                            | Size Target     |
| --------------------------------- | ------------------------------------------------------------------ | --------------- |
| `.github/copilot.instructions.md` | Project identity, stack, structure, code style                     | < 100 lines     |
| `.github/PROJECT_CONTEXT.md`      | Current state, what's next, key decisions                          | < 100 lines     |
| `/memories/repo/*.md`             | Persistent workspace memory (conventions, architecture, decisions) | < 50 lines each |

**Total instant context**: ~300 lines (~6KB) — enough to orient the AI without consuming significant context window.

### Layer 2: Working Memory (loaded on demand)

These files are loaded when the AI works on matching file types:

| Source                                   | Trigger               | Example                                                    |
| ---------------------------------------- | --------------------- | ---------------------------------------------------------- |
| `.github/instructions/*.instructions.md` | `applyTo:` glob match | Editing `.tsx` loads `a11y`, `reactjs`, `tailwind-v4-vite` |
| `.github/skills/*/SKILL.md`              | Agent delegation      | conductor.powder injects skill into subagent prompt        |
| `specs/*/tasks.md`                       | SpecKit workflow      | Loaded when implementing features                          |

Only 2 instructions load globally (`no-heredoc`, `protected-framework-files`). All others are scoped to specific file types.

### Powder Active Task Capsule

For conductor-led feature work, Powder maintains a rolling task capsule at:

- `plans/powder-active-task-plan.md`

This file is NOT part of the global instant context. It is a conductor-owned working artifact that records the current goal, execution mode (`normal` or `auto`), iteration number, launch set, gate outcomes, open blockers, and next action.

Why it exists:

- Preserve task continuity across iterations without bloating every prompt
- Keep long-running feature work resumable after session resets
- Separate stable project context from noisy task-by-task execution details

The active task capsule should be rewritten and compacted each iteration, not appended forever.

Recommended sections for the capsule:

- Identity: goal, feature/story, execution mode, termination reason
- Iteration: iteration number, loop state, current phase, last completed action, next action
- Launch set: `parallel`, `sequential`, and `deferred`
- Findings: accepted findings and unresolved blockers
- Gates: code review, security, accessibility, browser, Storybook, docs
- Resume notes: relevant plan paths, working files, or handoff summary

### Layer 3: Deep Knowledge (discovered when needed)

| Source                            | When Used                                            |
| --------------------------------- | ---------------------------------------------------- |
| `agents/agent-registry.json`      | Agent discovery (34 agents with full metadata)       |
| `.specify/memory/constitution.md` | SpecKit workflow (project principles and governance) |
| `docs/*.md`                       | Reference documentation                              |

## Session Handoff

### How It Works

1. **Session ends** → `session-summary.sh` writes a checkpoint to `last-session-summary.md` with:
   - Branch, task progress, modified files, tool stats
   - "Next Session Should" action items

2. **Session starts** → `context-loader.sh` discovers project context and appends:
   - Previous session checkpoint (if exists)
   - `.github/PROJECT_CONTEXT.md` contents
   - `plans/powder-active-task-plan.md` contents when Powder has active loop state

3. **AI wakes up** knowing: what project this is, what happened last session, what to do next.

### Maintaining PROJECT_CONTEXT.md vs Powder task state

Use the two files differently:

- `.github/PROJECT_CONTEXT.md` — stable project orientation, key decisions, and near-term priorities
- `plans/powder-active-task-plan.md` — rolling task state for the current orchestrated feature loop

Powder should update the active task plan before ending a planning or implementation cycle. `.github/PROJECT_CONTEXT.md` should change only when project-level direction or priorities materially change.

## Repository Memory (`/memories/repo/`)

Persistent files that load automatically in every VS Code workspace session:

| File               | Contents                                                   |
| ------------------ | ---------------------------------------------------------- |
| `project-state.md` | Project identity, architecture summary, key conventions    |
| `conventions.md`   | Commit format, branch naming, code style, testing approach |
| `architecture.md`  | Conductor-subagent pattern, hooks, SpecKit pipeline        |
| `decisions-log.md` | Technology and architectural decisions with rationale      |
| `active-work.md`   | Current branch, spec directory, phase progress             |

### When to Update

- **conventions.md** — When coding standards or workflows change
- **architecture.md** — When architectural patterns change
- **decisions-log.md** — When making significant technology or design decisions
- **active-work.md** — When switching branches or completing milestones
- **project-state.md** — When project identity or key conventions change

## Context Window Impact

Before this system, every session loaded ~16KB of instructions regardless of what files were being edited. After:

| Scenario            | Before                   | After           | Reduction |
| ------------------- | ------------------------ | --------------- | --------- |
| Editing `.ts` file  | ~16KB (all instructions) | ~6KB (scoped)   | ~62%      |
| Editing `.md` file  | ~16KB (all instructions) | ~3KB (scoped)   | ~81%      |
| Editing `.agent.md` | ~16KB (all instructions) | ~4KB (scoped)   | ~75%      |
| Master index        | ~5KB (209 lines)         | ~2KB (87 lines) | ~58%      |

## Quick Reference

- **Wake-up file**: `.github/PROJECT_CONTEXT.md`
- **Rolling task capsule**: `plans/powder-active-task-plan.md`
- **Master index**: `.github/copilot.instructions.md`
- **Persistent memory**: `/memories/repo/`
- **Session checkpoint**: `.github/hooks/logs/last-session-summary.md`
- **Context log**: `.github/hooks/logs/session-context.log`
- **Constitution**: `.specify/memory/constitution.md`
