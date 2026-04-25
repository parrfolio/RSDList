---
description: "Write tests for a feature using TDD with Vitest and React Testing Library"
agent: "conductor.powder"
---

# Write Tests (TDD)

You are writing tests following strict TDD practices.

## Context

Use @conductor.powder to orchestrate:

- **@engineering.implementation** — Backend tests (Cloud Functions, data models, utilities)
- **@frontend.implementation** — Frontend tests (components, hooks, pages)

## Testing Stack

- **Vitest** — Test runner and assertions
- **React Testing Library** — Component testing (user-centric)
- **Firebase local dev tools** — Firestore rules, Cloud Functions, Auth testing
- **MSW (Mock Service Worker)** — API mocking for frontend tests

## TDD Workflow (Strict)

1. **RED**: Write a failing test that describes the expected behavior
2. **GREEN**: Write the minimum code to make the test pass
3. **REFACTOR**: Clean up while keeping tests green
4. Repeat for each behavior

## Testing Rules

- NEVER change production code just to make it testable
- Test behavior, not implementation details
- Use `screen.getByRole()` over `getByTestId()` for UI tests
- Test error states and edge cases, not just happy paths
- Each test should be independent and isolated
- Name tests descriptively: `it('should reject access when user is not a member')`
- Mock external dependencies at the boundary (Firestore, Stripe, etc.)

## Test Categories

| Type        | Tool               | What to Test                                |
| ----------- | ------------------ | ------------------------------------------- |
| Unit        | Vitest             | Pure functions, utilities, Zod schemas      |
| Component   | RTL + Vitest       | Rendering, interactions, state changes      |
| Integration | Firebase local dev tools | Security rules, Cloud Functions, data flows |
| Hook        | renderHook         | Custom hooks, TanStack Query hooks          |

## Instructions

1. Identify the feature/module to test
2. Write test cases for:
   - Happy path scenarios
   - Error/failure scenarios
   - Edge cases
   - Boundary conditions
3. Follow TDD: write tests → see them fail → implement → tests pass
4. Verify coverage meets project requirements

## User Input

What I need tests for: {{input}}
