---
description: "Run the SpecKit analyze stage through Powder's orchestration loop"
agent: "conductor.powder"
---

# SpecKit Analyze

Use `@conductor.powder` as the user-facing entrypoint for this manual SpecKit stage.

## Instructions

1. Load the current feature context from `plans/powder-active-task-plan.md`.
2. Delegate the consistency check to `@speckit.analyze`.
3. Record key findings and the next recommended action in the active task capsule.
4. Return the analysis summary.
