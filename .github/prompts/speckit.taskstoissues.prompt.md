---
description: "Run the SpecKit tasks-to-issues stage through Powder's orchestration loop"
agent: "conductor.powder"
---

# SpecKit Tasks To Issues

Use `@conductor.powder` as the user-facing entrypoint for this manual SpecKit stage.

## Instructions

1. Load the current feature context from `plans/powder-active-task-plan.md`.
2. Delegate issue conversion to `@speckit.taskstoissues`.
3. Record the created issue set and recommended follow-up in the active task capsule.
4. Return the conversion summary.
