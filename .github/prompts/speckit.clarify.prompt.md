---
description: "Run the SpecKit clarify stage through Powder's orchestration loop"
agent: "conductor.powder"
---

# SpecKit Clarify

Use `@conductor.powder` as the user-facing entrypoint for this manual SpecKit stage.

## Instructions

1. Load the current feature context from `plans/powder-active-task-plan.md` if present.
2. Delegate the clarification work to `@speckit.clarify`.
3. Record the clarified decisions and the next recommended stage in the active task capsule.
4. Return any remaining questions or the next step.
