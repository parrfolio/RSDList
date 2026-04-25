---
description: "Run the SpecKit plan stage through Powder's orchestration loop"
agent: "conductor.powder"
---

# SpecKit Plan

Use `@conductor.powder` as the user-facing entrypoint for this manual SpecKit stage.

## Instructions

1. Load the active task capsule from `plans/powder-active-task-plan.md`.
2. Delegate the planning work to `@speckit.plan`.
3. Record the generated planning artifacts and next recommended stage in the active task capsule.
4. Return the plan summary and next step.
