---
description: "Fix a bug using the Quick Fix workflow — diagnose root cause, write regression test, apply surgical fix, verify"
agent: "conductor.powder"
---

# Fix a Bug

You are fixing a bug using the **Quick Fix workflow**. This is an expedited path that bypasses multi-phase planning for targeted bug resolution.

Append `--auto` to the user request when you want Powder to keep moving through soft review findings after each fix iteration. Powder records quick-fix state in `plans/powder-active-task-plan.md`.

## Workflow

1. **@architecture.exploration** — Explore the codebase to locate the affected area, related files, dependencies, and existing tests
2. **@reliability.srre** with bug-fix skill — Diagnose root cause, write failing test, apply surgical fix, verify all tests pass
3. **@quality.code-review** — Review the fix for correctness, test quality, and regression risk

### Gate Agents (conditional)

- **@security.application** — If the bug is in auth, Firestore rules/policies, Cloud Functions, or security-sensitive code
- **@frontend.accessibility** — If the bug is in UI components, forms, navigation, or accessibility-related code

## Quick Fix Rules

- Skip the full planning cycle (no multi-phase plan, no plan file, no user approval pause)
- Still enforce delegation — conductor.powder NEVER writes the fix herself
- Still enforce review — quality.code-review must approve before commit
- Still enforce gates — security and a11y gates apply when relevant
- One bug per invocation — do not batch unrelated fixes

## Expected Output

reliability.srre produces a **Bug Fix Report** containing:

- Root cause analysis
- Files modified
- Tests added
- Full verification results (tests, typecheck, lint)
- Regression risk assessment
- Related issues discovered (but not fixed)

## User Input

The bug to fix: {{input}}
