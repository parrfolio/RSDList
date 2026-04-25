---
description: "Run the SpecKit tasks stage through Powder's orchestration loop"
agent: "conductor.powder"
---

# SpecKit Tasks

Use `@conductor.powder` as the user-facing entrypoint for this manual SpecKit stage.

## Instructions

1. Load the current feature context from `plans/powder-active-task-plan.md`.
2. Delegate task generation to `@speckit.tasks`.
3. Record the generated `tasks.md` path and recommended follow-up in the active task capsule.
4. Return the task summary and next step.
