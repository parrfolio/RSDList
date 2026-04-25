---
description: "Review code changes for correctness, quality, test coverage, and best practices"
agent: "conductor.powder"
---

# Code Review

You are performing a structured code review.

## Context

Use @conductor.powder to orchestrate:

1. **@quality.code-review** — Code review (APPROVED / NEEDS_REVISION / FAILED)
2. **@security.application** — Security review (if security-relevant code)
3. **@frontend.accessibility** — Accessibility review (if UI code)

## Review Criteria

### Correctness

- Does the code do what it's supposed to?
- Are edge cases handled?
- Are error conditions properly managed?
- Does it match the acceptance criteria?

### Code Quality

- TypeScript strict compliance (no `any`, no `null`)
- Functions over classes (unless domain objects)
- Guard clauses / early returns (no `else` blocks)
- Single responsibility per function/component
- Meaningful names (no abbreviations)

### Testing

- Tests exist for all new functionality
- Tests cover happy path, errors, and edge cases
- Tests are independent and isolated
- Good test names describing behavior

### Security (if applicable)

- Input validation (Zod schemas)
- Auth/authorization checks
- No hardcoded secrets
- Tenant isolation maintained

### Accessibility (if UI)

- Semantic HTML used
- ARIA attributes correct
- Keyboard navigable
- Contrast requirements met

## Review Output Format

```
Status: APPROVED / NEEDS_REVISION / FAILED

Summary: [brief overview]

Strengths:
- [what was done well]

Issues:
- [CRITICAL/MAJOR/MINOR] [description] [file:line]

Recommendations:
- [suggested improvements]
```

## Instructions

1. Invoke @quality.code-review with the files to review and acceptance criteria
2. If security-relevant: also invoke @security.application in parallel
3. If UI code: also invoke @frontend.accessibility in parallel
4. Present consolidated review results

## User Input

What to review: {{input}}
