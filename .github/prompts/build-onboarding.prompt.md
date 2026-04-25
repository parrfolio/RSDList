---
description: "Design and build user onboarding flow with progressive disclosure"
agent: "conductor.powder"
---

# Build Onboarding Flow

You are creating a user onboarding experience that guides new users to their first "aha moment."

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.context** with value-realization skill — Research the value proposition and "aha moment"
2. **@design.ux-engineer** — Validate onboarding flow and CRUD completeness
3. **@frontend.implementation** — Implement onboarding UI
4. **@frontend.accessibility** — Accessibility audit

## Onboarding Principles

### Value Realization Focus

- Get users to their FIRST VALUE as fast as possible
- Every step should either deliver value or clearly lead to value
- Remove any step that doesn't contribute to reaching the "aha moment"
- Show progress toward the goal (not just completion percentage)

### Progressive Disclosure

- Don't overwhelm: show only what's needed NOW
- Defer advanced settings to later
- Use sensible defaults
- Let users skip optional steps (but track what was skipped)

### Onboarding Patterns

1. **Welcome screen**: Brief value proposition, single CTA
2. **Account setup**: Name, avatar, preferences (minimal)
3. **Workspace creation**: Tenant/organization setup
4. **First action**: Guided first task that delivers value
5. **Checklist**: Remaining setup tasks (dismissible)

## Data Requirements

- Onboarding progress stored in Firestore (per-user)
- `onboardingComplete: boolean` flag in user profile
- Track which steps were completed vs skipped
- A/B capability: different flows for different user segments

## Instructions

1. Research the product's value proposition (architecture.context + value-realization skill)
2. Identify the "aha moment" — what action makes users realize value?
3. Design the shortest path from signup to aha moment
4. Validate flow standards (design.ux-engineer)
5. Implement each onboarding step
6. Add progress tracking and skip handling
7. Verify accessibility (frontend.accessibility)

## User Input

{{input}}
