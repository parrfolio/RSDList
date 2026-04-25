# Snow Patrol Constitution

## Core Principles

### Delegation Over Direct Action

The conductor orchestrates; subagents execute. No agent operates outside its role. Code is written by implementation agents, reviewed by review agents, and audited by gate agents. The conductor never writes code.

### Mandatory Quality Gates

No code ships without passing applicable gates. Security audit (security.application) for auth/data/functions. Accessibility audit (frontend.accessibility) for UI changes. Code review (quality.code-review) for all changes. Gates cannot be bypassed — a FAIL blocks the commit path until remediated.

### Specification-Driven Development

Features flow through a structured pipeline: specify → clarify → plan → tasks → implement. SpecKit artifacts (spec.md, plan.md, tasks.md) are the source of truth. When they exist, agents use them — they don't create parallel plans.

### Protected Framework Files

Agent definitions, instructions, skills, prompts, hooks, and docs are protected. No agent may delete, move, or overwrite them. Scaffolding commands must target subdirectories, never the project root. Enforced deterministically by Copilot Hooks.

### Context Conservation

Agents actively manage context windows. Heavy file reading is delegated to exploration/research agents. Instructions and skills are injected only when relevant (scoped by file type and agent role). Memory is tiered: instant context (~300 lines), working memory (on-demand), deep knowledge (discovered).

### Parallel-First Execution

Independent work is parallelized. Research agents run simultaneously across subsystems. Backend and frontend implementation run in parallel when touching different files. Review and gate agents run concurrently. Sequential execution is the exception, not the default.

### Incremental Delivery

Every phase is self-contained and independently deliverable. Each phase produces working, tested code. The user approves and commits after each phase. No phase depends on uncommitted work from another phase.

## Technical Standards

- Test-driven development: tests first, then minimal code to pass
- Conventional commits for all git messages
- Instructions applied by file type via applyTo globs
- Skills injected into subagent prompts by agents: frontmatter matching
- Deterministic enforcement via Copilot Hooks (shell scripts, not LLM compliance)

## Development Workflow

Plan → Implement → Review → Gates → Commit → Repeat

## Governance

- conductor.powder owns the orchestration loop
- delivery.tpm owns the SpecKit planning pipeline
- Gate agents (security.application, frontend.accessibility) have veto power
- The user has final approval at every commit point
- Framework files are immutable during normal operation

**Version**: 1.0 | **Ratified**: 2026-03-05 | **Last Amended**: 2026-03-05
