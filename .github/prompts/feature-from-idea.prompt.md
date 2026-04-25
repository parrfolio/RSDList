---
description: "Turn a feature idea into a full specification, plan, and task list"
agent: "conductor.powder"
---

# Feature from Idea to Implementation Plan

You are converting a feature idea into a structured specification ready for implementation.

This prompt enters through Powder even though the work is performed by SpecKit specialists. Powder maintains the rolling task capsule in `plans/powder-active-task-plan.md`, and `--auto` keeps non-blocking planning findings advisory.

## Context

Follow the SpecKit pipeline:

1. `@speckit.specify` — Create the feature spec from natural language
2. `@speckit.clarify` — Identify and resolve ambiguities
3. `@speckit.plan` — Generate the technical implementation plan
4. `@speckit.tasks` — Break the plan into ordered, parallelizable tasks
5. `@speckit.analyze` — Validate consistency across all artifacts

## Instructions

1. Take the user's feature idea and run it through the SpecKit pipeline
2. Create the spec with prioritized user stories (P1/P2/P3) and Given/When/Then acceptance criteria
3. Identify edge cases and functional requirements
4. Generate the implementation plan with technical context, phases, and data models
5. Break into actionable tasks organized by user story with `[P]` parallel markers
6. Run consistency analysis before presenting

## Output

Present the final artifacts:

- `specs/<feature>/spec.md`
- `specs/<feature>/plan.md`
- `specs/<feature>/tasks.md`

## User Input

The feature I want to build: {{input}}
