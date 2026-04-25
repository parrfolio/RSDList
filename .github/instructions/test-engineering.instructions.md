---
description: "Test file structure, naming conventions, assertion patterns, and Vitest best practices for test engineering"
applyTo: "**/*.test.ts, **/*.spec.ts, **/*.test.tsx, **/*.spec.tsx"
---

# Test Engineering Standards

Rules and conventions for writing tests. These apply to all test files (`*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx`).

## Test File Location

- **Unit tests**: Colocate with source files — `feature.ts` → `feature.test.ts` in the same directory
- **Integration tests**: Colocate with source — `feature.integration.test.ts`
- **E2E tests**: Dedicated `__tests__/e2e/` directory at project root

## File Naming

| Type        | Pattern                           | Example                          |
| ----------- | --------------------------------- | -------------------------------- |
| Unit        | `{source-name}.test.ts`          | `login.test.ts`                  |
| Unit (React)| `{ComponentName}.test.tsx`       | `LoginForm.test.tsx`             |
| Integration | `{feature}.integration.test.ts`  | `auth.integration.test.ts`       |
| E2E         | `{flow-name}.spec.ts`            | `auth-flow.spec.ts`              |

## Imports

Always import test utilities explicitly from Vitest:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
```

For React component tests:

```typescript
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
```

## Describe/It Nesting

Use a consistent 3-level nesting pattern:

```typescript
describe('UnitUnderTest', () => {           // Level 1: What is being tested
  describe('methodOrBehavior', () => {      // Level 2: Which method/behavior
    describe('when [condition]', () => {    // Level 3: Under what conditions
      it('[expected outcome]', () => {});   // Assertion: What should happen
    });
  });
});
```

**Rules:**

- Maximum nesting depth: 3 `describe` levels + `it`
- `describe` blocks group related scenarios — never contain assertions directly
- `it` blocks contain exactly one logical assertion (multiple `expect` calls for a single behavior are acceptable)

## Test Naming

Test names must read as specifications:

```typescript
// Good — descriptive, reads as a spec
it('returns authenticated user when credentials are valid')
it('throws AuthenticationError when password is incorrect')
it('shows loading spinner while data is fetching')
it('disables submit button when form has validation errors')

// Bad — vague, implementation-focused
it('works')
it('handles error')
it('test login')
it('should call the function')
```

**Pattern**: `[action/state] when [condition]` or `[expected outcome] when [trigger]`

## Arrange-Act-Assert

Every test follows AAA with visual separation:

```typescript
it('returns user profile when authenticated', async () => {
  // Arrange
  const token = createTestToken({ userId: 'user-1' });
  mockApi.getProfile.mockResolvedValue(testUser);

  // Act
  const result = await getProfile(token);

  // Assert
  expect(result).toEqual(testUser);
  expect(mockApi.getProfile).toHaveBeenCalledWith('user-1');
});
```

**Rules:**

- Always include `// Arrange`, `// Act`, `// Assert` comments
- Arrange: Set up inputs, mocks, and preconditions
- Act: Execute the single operation being tested
- Assert: Verify the outcome — prefer specific matchers over generic ones

## Setup and Teardown

```typescript
describe('FeatureUnderTest', () => {
  // Shared setup for all tests in this describe block
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Cleanup after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // One-time setup (database connections, servers)
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  // One-time cleanup
  afterAll(async () => {
    await teardownTestEnvironment();
  });
});
```

**Rules:**

- Always call `vi.clearAllMocks()` in `beforeEach` — prevent mock state leaking between tests
- Use `beforeAll`/`afterAll` only for expensive shared resources (servers, database connections)
- Never rely on test execution order — each test must set up its own state
- Clean up side effects (timers, DOM, global state) in `afterEach`

## Mock Patterns

### Function Mocks

```typescript
const mockFn = vi.fn();
mockFn.mockReturnValue('value');           // Synchronous
mockFn.mockResolvedValue('value');         // Async (resolves)
mockFn.mockRejectedValue(new Error());    // Async (rejects)
mockFn.mockImplementation((arg) => arg);  // Custom logic
```

### Module Mocks

```typescript
vi.mock('./api-client', () => ({
  fetchUser: vi.fn(),
  updateUser: vi.fn(),
}));
```

### Timer Mocks

```typescript
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('calls callback after delay', () => {
  const callback = vi.fn();
  scheduleCallback(callback, 5000);

  vi.advanceTimersByTime(5000);

  expect(callback).toHaveBeenCalledOnce();
});
```

### Spy on Existing Methods

```typescript
const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
// ... test that triggers console.error ...
expect(spy).toHaveBeenCalledWith(expect.stringContaining('error message'));
spy.mockRestore();
```

## Assertion Patterns

### Prefer Specific Matchers

```typescript
// Good — specific matchers
expect(result).toBe(true);
expect(array).toHaveLength(3);
expect(object).toEqual({ id: '1', name: 'Test' });
expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
expect(fn).toHaveBeenCalledOnce();
expect(value).toBeNull();
expect(value).toBeDefined();

// Avoid — generic matchers when specific ones exist
expect(result === true).toBe(true);      // Use toBe(true)
expect(array.length).toBe(3);            // Use toHaveLength(3)
expect(fn.mock.calls.length).toBe(1);    // Use toHaveBeenCalledOnce()
```

### Error Assertions

```typescript
// Synchronous errors
expect(() => riskyFunction()).toThrow('expected message');
expect(() => riskyFunction()).toThrow(CustomError);

// Async errors
await expect(asyncRiskyFunction()).rejects.toThrow('expected message');
await expect(asyncRiskyFunction()).rejects.toThrow(CustomError);
```

### Partial Matching

```typescript
expect(result).toEqual(expect.objectContaining({
  id: '1',
  status: 'active',
}));

expect(array).toEqual(expect.arrayContaining([
  expect.objectContaining({ id: '1' }),
]));
```

## React Testing Library Queries

### Query Priority (most accessible first)

1. `getByRole` — best for accessible components
2. `getByLabelText` — form inputs
3. `getByPlaceholderText` — when no label exists
4. `getByText` — non-interactive text content
5. `getByDisplayValue` — current input values
6. `getByAltText` — images
7. `getByTitle` — title attributes
8. `getByTestId` — last resort only

```typescript
// Preferred — queries by accessible role
screen.getByRole('button', { name: /submit/i })
screen.getByRole('heading', { level: 1 })
screen.getByRole('textbox', { name: /email/i })

// Avoid — queries by test-id (breaks accessibility intent)
screen.getByTestId('submit-button')
```

## Test Data

### Use Factory Functions

```typescript
function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'member',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}
```

**Rules:**

- Define factories for all domain models used in tests
- Factories return valid default objects — override only what the test cares about
- Never use random data in unit tests — deterministic inputs produce deterministic outputs
- Place shared factories in a `__tests__/helpers/` or `test-utils/` directory

## What NOT to Do

- **Don't test implementation details**: Test behavior, not internal method calls
- **Don't use `any` in test code**: Tests should be typed as strictly as production code
- **Don't share mutable state between tests**: Each test is independent
- **Don't write tests that pass when the feature is broken**: A test must fail when the behavior regresses
- **Don't use `console.log` for assertions**: Use `expect()` — logs aren't verifiable
- **Don't skip tests without a tracking issue**: `it.skip` must include a comment with a reason and issue link
