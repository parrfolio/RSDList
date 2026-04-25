---
description: "Build a multi-step wizard/stepper with validation, back/next, and progress"
agent: "conductor.powder"
---

# Build Multi-Step Wizard

You are creating a multi-step wizard/stepper form with validation and progress tracking.

## Context

Use @conductor.powder to orchestrate:

1. **@design.ux-engineer** — Validate wizard standards and flow compliance
2. **@frontend.implementation** — Implement the wizard
3. **@frontend.accessibility** — Accessibility audit

## Wizard Standards (from design.ux-engineer)

### Structure

- **Progress indicator**: Steps shown at top (step number + label)
- **Current step highlight**: Active step visually distinct
- **Step validation**: Each step must validate before allowing "Next"
- **Back button**: Always available (except step 1)
- **Save progress**: Auto-save to localStorage or server on step change
- **Summary step**: Final review step before submission

### Navigation

- **Next**: Validates current step, then advances
- **Back**: Returns to previous step (data preserved)
- **Step clicking**: Can click completed steps to go back (not ahead)
- **Cancel**: Prompts confirmation dialog if data entered

### Validation

- Per-step Zod schemas
- Inline errors on the current step only
- Step validation gate (can't proceed with errors)
- Cross-step validation on final submit

### States

- **Loading**: Skeleton while step data loads
- **Error**: Per-step error display
- **Success**: Confirmation page after submission
- **Abandoned**: Handle browser close/navigate away (prompt to save)

## Accessibility

- Steps are an ordered list (`<ol>`)
- Current step announced: `aria-current="step"`
- Completed steps: `aria-label="Step 1: Complete"`
- Form validation follows form accessibility rules
- Focus moves to step content when navigating

## Instructions

1. Define the wizard steps and their Zod validation schemas
2. Validate wizard flow standards (design.ux-engineer)
3. Write tests for step navigation and validation
4. Implement the wizard component with progress indicator
5. Add auto-save and data persistence
6. Implement summary/review step
7. Verify accessibility (frontend.accessibility)

## User Input

{{input}}
