---
description: "Run the SpecKit checklist stage through Powder's orchestration loop"
agent: "conductor.powder"
---

# SpecKit Checklist

Use `@conductor.powder` as the user-facing entrypoint for this manual SpecKit stage.

## Instructions

1. Load the current feature context from `plans/powder-active-task-plan.md`.
2. Delegate checklist generation to `@speckit.checklist`.
3. Record checklist status and recommended follow-up in the active task capsule.
4. Return the checklist summary.
