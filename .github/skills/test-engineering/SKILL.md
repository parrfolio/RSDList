---
name: test-engineering
description: Deep knowledge for spec-driven test generation, coverage analysis, mocking strategies, and Vitest patterns.
agents: ["quality.test-architecture", "engineering.implementation"]
---

# Test Engineering Skill

> Deep knowledge for spec-driven test generation, coverage analysis, mocking strategies, and Vitest patterns.

## When to Apply This Skill

- Writing tests from specifications (Test-First mode)
- Auditing test coverage against requirements (Coverage Audit mode)
- Designing mocking strategies for external dependencies
- Structuring test suites for maintainability and speed
- Writing integration and E2E tests alongside unit tests

---

## 1. Acceptance Criteria → Test Case Mapping

### EARS Notation Translation

Every EARS requirement maps directly to test cases. This is the core of spec-driven testing.

#### Ubiquitous Requirements

```
Spec:    THE SYSTEM SHALL display a loading indicator during data fetch
Test:    it('displays loading indicator during data fetch')
```

#### Event-Driven Requirements

```
Spec:    WHEN the user clicks "Submit" THE SYSTEM SHALL validate all form fields
Tests:
  - it('validates all form fields when user clicks Submit')
  - it('shows validation errors when fields are invalid on Submit')
  - it('submits form data when all fields are valid on Submit')
```

#### State-Driven Requirements

```
Spec:    WHILE the user is authenticated THE SYSTEM SHALL show the dashboard
Tests:
  - it('shows dashboard while user is authenticated')
  - it('does not show dashboard when user is not authenticated')
  - it('transitions to dashboard when authentication succeeds')
```

#### Unwanted Behavior Requirements

```
Spec:    IF the API returns a 500 error THEN THE SYSTEM SHALL show an error message and retry
Tests:
  - it('shows error message when API returns 500')
  - it('retries the request when API returns 500')
  - it('succeeds on retry after transient 500 error')
  - it('shows persistent error after max retries exceeded')
```

#### Complex Requirements (Combined)

```
Spec:    WHILE authenticated, WHEN the session expires, THE SYSTEM SHALL redirect to login
Tests:
  - it('redirects to login when session expires while authenticated')
  - it('does not redirect when session is still valid')
  - it('clears user state on session expiry redirect')
```

### Coverage Matrix Template

After mapping, produce a coverage matrix:

| Requirement ID | EARS Type    | Test File            | Test Case(s)                        | Status     |
| -------------- | ------------ | -------------------- | ----------------------------------- | ---------- |
| REQ-001        | Event-driven | `login.test.ts`      | validates fields on Submit          | ✅ Covered |
| REQ-002        | State-driven | `dashboard.test.ts`  | shows dashboard while authenticated | ✅ Covered |
| REQ-003        | Unwanted     | `api-client.test.ts` | retries on 500 error                | ⚠️ Partial |
| REQ-004        | Ubiquitous   | —                    | —                                   | ❌ Missing |

---

## 2. Test Structure Patterns

### Unit Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Group by unit under test
describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(mockDeps);
  });

  // Group by method or behavior
  describe("login", () => {
    // Group by scenario
    describe("with valid credentials", () => {
      it("returns an authenticated user", async () => {
        // Arrange
        const credentials = { email: "user@example.com", password: "valid" };

        // Act
        const result = await service.login(credentials);

        // Assert
        expect(result.isAuthenticated).toBe(true);
        expect(result.user.email).toBe("user@example.com");
      });

      it("stores the session token", async () => {
        const credentials = { email: "user@example.com", password: "valid" };
        await service.login(credentials);
        expect(mockTokenStore.save).toHaveBeenCalledWith(expect.any(String));
      });
    });

    describe("with invalid credentials", () => {
      it("throws an AuthenticationError", async () => {
        const credentials = { email: "user@example.com", password: "wrong" };
        await expect(service.login(credentials)).rejects.toThrow(
          AuthenticationError,
        );
      });

      it("does not store a session token", async () => {
        const credentials = { email: "user@example.com", password: "wrong" };
        try {
          await service.login(credentials);
        } catch {}
        expect(mockTokenStore.save).not.toHaveBeenCalled();
      });
    });
  });
});
```

### React Component Test Structure

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onForgotPassword: vi.fn(),
  };

  function renderLoginForm(overrides = {}) {
    return render(<LoginForm {...defaultProps} {...overrides} />);
  }

  describe('rendering', () => {
    it('renders email and password fields', () => {
      renderLoginForm();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders a submit button', () => {
      renderLoginForm();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('shows error when email is empty on submit', async () => {
      renderLoginForm();
      await fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  describe('submission', () => {
    it('calls onSubmit with form data when valid', async () => {
      const onSubmit = vi.fn();
      renderLoginForm({ onSubmit });

      await fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'user@example.com' },
      });
      await fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' },
      });
      await fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(onSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });

  describe('accessibility', () => {
    it('associates labels with inputs', () => {
      renderLoginForm();
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('marks invalid fields with aria-invalid', async () => {
      renderLoginForm();
      await fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
```

### Integration Test Structure

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Auth Flow Integration", () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it("completes full login → dashboard → logout flow", async () => {
    // Login
    const loginResponse = await server.post("/api/auth/login", {
      email: "user@example.com",
      password: "valid",
    });
    expect(loginResponse.status).toBe(200);
    const { token } = loginResponse.body;

    // Access protected resource
    const dashboardResponse = await server.get("/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(dashboardResponse.status).toBe(200);

    // Logout
    const logoutResponse = await server.post("/api/auth/logout", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(logoutResponse.status).toBe(200);

    // Verify token is invalidated
    const retryResponse = await server.get("/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(retryResponse.status).toBe(401);
  });
});
```

---

## 3. Mocking Strategies

### When to Mock

| Dependency Type      | Mock? | Strategy                                      |
| -------------------- | ----- | --------------------------------------------- |
| External APIs        | Yes   | `vi.fn()` or MSW for HTTP                     |
| Database             | Yes   | In-memory adapter or `vi.fn()` on repository  |
| File system          | Yes   | `vi.fn()` on fs operations                    |
| Timers/Date          | Yes   | `vi.useFakeTimers()`                          |
| Internal pure funcs  | No    | Use the real implementation                   |
| Internal stateful    | Maybe | Mock only if setup is prohibitively expensive |
| React context/stores | Maybe | Prefer wrapping in test providers             |

### Mock Patterns

#### Service Dependencies

```typescript
// Create typed mocks that match the interface
function createMockUserRepository(): UserRepository {
  return {
    findById: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };
}

// Use in tests
const mockRepo = createMockUserRepository();
mockRepo.findById.mockResolvedValue(testUser);
const service = new UserService(mockRepo);
```

#### API Calls with MSW

```typescript
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const server = setupServer(
  http.get("/api/users/:id", ({ params }) => {
    return HttpResponse.json({ id: params.id, name: "Test User" });
  }),
  http.post("/api/users", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "1", ...body }, { status: 201 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

#### Timers and Dates

```typescript
describe("session timeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("expires session after 30 minutes of inactivity", () => {
    const session = createSession();
    expect(session.isActive).toBe(true);

    vi.advanceTimersByTime(30 * 60 * 1000); // 30 minutes

    expect(session.isActive).toBe(false);
  });
});
```

---

## 4. Coverage Analysis

### Running Coverage

```bash
# Generate coverage report
npx vitest run --coverage

# Coverage with specific thresholds
npx vitest run --coverage --coverage.thresholds.lines=80 --coverage.thresholds.functions=80 --coverage.thresholds.branches=75
```

### Interpreting Coverage Gaps

When auditing coverage, look for these patterns:

1. **Uncovered branches**: `if/else` paths not exercised — write tests for the missing branch
2. **Uncovered functions**: Exported functions never called in tests — add direct unit tests
3. **Uncovered lines in error handling**: `catch` blocks, error returns — add error path tests
4. **Low branch coverage in switch/case**: Missing cases — add test per case value

### Coverage Report Template

```markdown
## Test Coverage Report

### Summary

- **Lines**: 85% (target: 80%) ✅
- **Functions**: 82% (target: 80%) ✅
- **Branches**: 71% (target: 75%) ❌

### Gaps Identified

| File              | Uncovered Area               | Reason                  | Priority |
| ----------------- | ---------------------------- | ----------------------- | -------- |
| `auth/login.ts`   | Lines 45-52 (error handling) | Missing error path test | High     |
| `utils/format.ts` | Branch at line 23            | Null input not tested   | Medium   |

### Recommendations

1. Add error path tests for auth/login.ts (estimated: 2 test cases)
2. Add null-input boundary test for utils/format.ts
```

---

## 5. Test Naming Conventions

### Pattern: `[unit] [behavior] when [condition]`

```typescript
// Good — reads as a specification
it("returns authenticated user when credentials are valid");
it("throws AuthenticationError when password is incorrect");
it("redirects to login when session expires");
it("shows loading spinner while data is fetching");
it("disables submit button when form is invalid");

// Bad — vague, implementation-focused
it("works correctly");
it("handles the error case");
it("test login");
it("should call the function");
```

### Describe Block Naming

```typescript
describe("AuthService"); // Unit under test
describe("login"); // Method or behavior
describe("with valid creds"); // Scenario/condition
it("returns user"); // Expected outcome
```

---

## 6. Test Data Patterns

### Factory Functions

```typescript
// Create reusable test data factories
function createTestUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    role: "member",
    createdAt: new Date("2024-01-01"),
    ...overrides,
  };
}

// Usage in tests
const admin = createTestUser({ role: "admin" });
const newUser = createTestUser({ id: "user-2", name: "New User" });
```

### Builders for Complex Objects

```typescript
class TestOrderBuilder {
  private order: Partial<Order> = {
    id: "order-1",
    items: [],
    status: "pending",
  };

  withItems(items: OrderItem[]) {
    this.order.items = items;
    return this;
  }

  withStatus(status: OrderStatus) {
    this.order.status = status;
    return this;
  }

  build(): Order {
    return this.order as Order;
  }
}

// Usage
const completedOrder = new TestOrderBuilder()
  .withItems([{ productId: "p1", quantity: 2 }])
  .withStatus("completed")
  .build();
```

---

## 7. Accessibility Testing in Test Suites

When testing UI components, always include accessibility assertions:

```typescript
describe('accessibility', () => {
  it('has no automatically detectable a11y violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard navigation', async () => {
    render(<Component />);
    const button = screen.getByRole('button');
    button.focus();
    expect(document.activeElement).toBe(button);

    await fireEvent.keyDown(button, { key: 'Enter' });
    // Assert expected keyboard behavior
  });

  it('has correct ARIA attributes', () => {
    render(<Component isOpen={true} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
```

---

## 8. Test-First Workflow Checklist

When operating in Test-First mode, follow this checklist:

1. [ ] Read all spec artifacts (spec.md, plan.md, tasks.md, requirements.md, design.md)
2. [ ] Extract every acceptance criterion and requirement
3. [ ] Map each requirement to one or more test cases using EARS translation
4. [ ] Create test files colocated with the expected source file locations
5. [ ] Write all test cases with clear arrange/act/assert structure
6. [ ] Use factory functions for test data (don't inline complex objects)
7. [ ] Mock external boundaries only (APIs, DB, filesystem, timers)
8. [ ] Run the test suite — verify all tests FAIL (red phase)
9. [ ] Verify failures are due to missing implementations, NOT syntax errors
10. [ ] Produce coverage matrix mapping requirements → test cases
11. [ ] Report: files created, test count, coverage map, recommendations

## 9. Coverage Audit Workflow Checklist

When operating in Coverage Audit mode, follow this checklist:

1. [ ] Read all spec artifacts AND implemented source files
2. [ ] Run existing test suite with coverage enabled
3. [ ] Capture coverage report (lines, functions, branches)
4. [ ] Compare spec requirements vs tested paths
5. [ ] Identify untested acceptance criteria
6. [ ] Identify missing edge cases (nulls, empty, boundaries, errors)
7. [ ] Identify untested integration points
8. [ ] For UI components: check for accessibility test coverage
9. [ ] Write test cases for all identified gaps
10. [ ] Run full suite — verify all tests PASS (green)
11. [ ] Produce coverage before/after comparison
12. [ ] Report: gaps found, tests added, coverage delta, recommendations
