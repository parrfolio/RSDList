---
description: "Build an accessible, validated form with proper error handling"
agent: "conductor.powder"
---

# Build a Form

You are creating a form with validation, error handling, and accessibility.

## Context

Use @conductor.powder to orchestrate with @frontend.implementation for implementation and @frontend.accessibility for accessibility.

## Form Stack

- **react-hook-form** — Form state management
- **Zod** — Schema validation
- **shadcn/ui** — Form components (Input, Select, Textarea, Checkbox, etc.)
- **Tailwind v4** — Styling

## Form Requirements (WCAG 2.2 AA)

- Every field has a visible, persistent label (never disappearing placeholders)
- Required fields marked visually (`*`) and programmatically (`aria-required="true"`)
- Help text associated via `aria-describedby`
- Inline error messages with `aria-invalid="true"` and `aria-describedby`
- On submit error: focus the first invalid field
- Submit button is NOT disabled to prevent submission
- Form validates on submit, then on change for touched fields
- Progressive disclosure for complex forms
- Tab order follows reading order

## Instructions

1. Define Zod schema for all form fields
2. Write tests for validation rules and submission
3. Implement form with react-hook-form + Zod resolver
4. Add proper labels, help text, and error messages
5. Implement success/error states for submission
6. Handle loading state during async submission
7. Verify accessibility (frontend.accessibility gate)

## User Input

The form I need: {{input}}
