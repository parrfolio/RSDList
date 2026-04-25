---
description: "Identify and refactor technical debt, code smells, and quality issues"
agent: "conductor.powder"
---

# Refactor & Technical Debt

You are identifying and addressing technical debt in the codebase.

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.exploration** — Explore codebase for debt patterns
2. **@architecture.context** — Research impact and prioritize
3. **@engineering.implementation/@frontend.implementation** — Implement refactoring
4. **@quality.code-review** — Review refactored code

## Technical Debt Categories

### Code Smells

- Long functions (>50 lines)
- Deep nesting (>2 levels)
- Duplicated code
- God components/modules
- Magic numbers/strings
- Dead code
- `any` type usage
- Missing error handling

### Architecture Debt

- Circular dependencies
- Tight coupling between modules
- Missing abstraction layers
- Inconsistent patterns across codebase
- Missing or outdated types

### Test Debt

- Missing test coverage
- Fragile/flaky tests
- Tests testing implementation instead of behavior
- Missing edge case tests

### Documentation Debt

- Outdated README
- Missing API documentation
- Stale code comments
- Missing architecture docs

## Refactoring Rules

- NEVER refactor without existing tests (write tests first if missing)
- Refactor in small, testable increments
- Keep tests green at every step
- Follow Object Calisthenics for domain code:
  1. One indentation level per method
  2. No `else` keyword
  3. Wrap primitives
  4. First-class collections
  5. One dot per line
  6. No abbreviations
  7. Keep entities small
  8. Max 2 instance variables
  9. No getters/setters in domain classes

## Instructions

1. Explore codebase for technical debt (architecture.exploration)
2. Prioritize by impact and effort
3. Write tests for untested code before refactoring
4. Implement refactoring in small increments
5. Verify all tests pass after each change
6. Review refactored code (quality.code-review)

## User Input

{{input}}
