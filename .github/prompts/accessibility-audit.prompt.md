---
description: "Run WCAG 2.1/2.2 accessibility audit on UI components or pages"
agent: "conductor.powder"
---

# Accessibility Audit

You are performing a WCAG 2.1/2.2 accessibility audit.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.accessibility** — Accessibility audit (PASS/FAIL gate)
2. **@frontend.implementation** — Implement accessibility fixes

## Audit Checklist (WCAG 2.2 AA)

### Structure & Semantics

- Landmarks: `header`, `nav`, `main`, `footer` used correctly
- Heading hierarchy: no skipped levels, one `h1` per page
- Descriptive `<title>` tag

### Keyboard & Focus

- All interactive elements keyboard operable
- Visible focus indicators (3:1 contrast minimum)
- No keyboard traps
- Tab order follows reading order
- Skip link as first focusable element
- Hidden content not focusable

### Forms

- Every input has a visible, persistent label
- Required fields: visual indicator + `aria-required="true"`
- Errors: `aria-invalid="true"` + `aria-describedby` for messages
- On error: focus first invalid field

### Color & Contrast

- Text: 4.5:1 minimum (3:1 for large text)
- Focus indicators: 3:1 vs adjacent colors
- Information not conveyed by color alone
- Forced colors mode support

### Reflow

- Content usable at 320px width without horizontal scroll
- Content usable at 200% zoom

### Images & Media

- Informative images have meaningful `alt` text
- Decorative images hidden (`alt=""` or `aria-hidden="true"`)
- SVGs use `role="img"` with `aria-label`

## Instructions

1. Invoke @frontend.accessibility to audit the specified files/components
2. If FAIL (CRITICAL or HIGH findings):
   - Create remediation tasks with WCAG success criteria references
   - Invoke @frontend.implementation to fix
   - Re-invoke @frontend.accessibility until PASS
3. Present the final audit report

## User Input

What to audit: {{input}}
