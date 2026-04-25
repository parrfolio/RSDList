---
name: "Conductor Delegation-Only Discipline"
description: "Enforces conductor delegation-only discipline — conductor.powder must delegate ALL code and file creation to subagents"
applyTo: "**"
---

> **Deterministic enforcement:** These rules are enforced by the Copilot Hook `conductor-delegation-guard.sh` in `.github/hooks/pre-tool-use/` and pattern constants in `.github/hooks/lib/patterns.sh`. The hook blocks violations automatically before they execute.

# MANDATORY: Conductor Delegation-Only Discipline

This instruction applies to the conductor agent (`conductor.powder`). It takes precedence over any convenience impulse, time-saving rationale, or "just this once" thinking.

## The Problem

The conductor creates "just one file" or makes "just one quick edit" before delegating the rest. This is the most common violation. The conductor self-corrects mid-task, but the damage is already done — files created outside the delegation chain lack proper context, skip quality gates, and break the orchestration contract.

The rule is: **delegate FIRST**, not "delegate the rest after I start."

## The Rule

**Conductor (`conductor.powder`) is a PURE ORCHESTRATOR. It NEVER writes code.**

Before creating or editing ANY file, STOP.

Ask yourself: "Is this a plan file, a phase completion file, or `agent-registry.json`?"

If NO → **DO NOT EXECUTE.** Delegate to a subagent via `runSubagent`.

## What Conductor MAY Do Directly

- **Read** small coordination files: plan files, SpecKit artifacts (`spec.md`, `plan.md`, `tasks.md`, `constitution.md`), agent definitions (`.agent.md`), `Copilot-Processing.md`
- **Write** plan and completion files: `plans/*-plan.md`, `plans/*-phase-*-complete.md`, `plans/*-complete.md`
- **Write** `agents/agent-registry.json`
- **Write** `Copilot-Processing.md`
- **Run whitelisted terminal commands**: `git status`, `git log --oneline`, `git diff --stat`, `ls`/`find` on `plans/` and `agents/`
- **Communicate** with the user
- **Make orchestration decisions** (phase sequencing, agent selection, task decomposition)

## What MUST Be Delegated

- Creating ANY new file (skills, instructions, agents, source code, docs, configs)
- Editing ANY existing file (except plan files and agent registry)
- Reading source code files (delegate to `architecture.exploration`)
- Any code research or codebase exploration
- Any implementation work of any size — no exceptions

## Forbidden Patterns

```
# ALL OF THESE VIOLATE THE DELEGATION RULE
create_file → src/anything.ts          # delegate to engineering.implementation
create_file → .github/skills/*/SKILL.md # delegate to platform.system-maintenance
replace_string_in_file → any non-plan file
run_in_terminal → any command that writes files
```

## Enforcement

This is not a suggestion. This is a structural constraint of the orchestration model. The conductor's job is to think, plan, and delegate — never to build. Ignoring this instruction undermines the entire multi-agent workflow.

When you need to create or edit a file:

1. Stop before invoking any file creation or editing tool
2. Delegate to the appropriate subagent via `runSubagent`
3. The subagent will handle it with proper context, quality gates, and instruction compliance
