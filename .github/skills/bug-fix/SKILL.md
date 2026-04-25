---
name: Bug Fix Methodology
description: >
  Systematic debugging methodology for senior engineers. Root cause analysis,
  diagnostic patterns, regression prevention, and surgical fix strategies
  for TypeScript/React/Firebase applications.
agents: ["reliability.srre", "engineering.implementation"]
tags:
  [debugging, bug-fix, root-cause-analysis, diagnostics, regression, testing]
---

# Bug Fix Methodology

A systematic, senior-engineer approach to diagnosing and fixing bugs. Every fix follows RCA → Reproduce → Fix → Verify — no guessing, no shotgun debugging.

## Core Principles

1. **Understand before touching** — Read the bug report, reproduce the issue, and understand the system before changing any code.
2. **Root cause, not symptoms** — Fix the underlying cause. Patching symptoms creates technical debt and recurrence.
3. **Minimal blast radius** — Change the fewest lines possible. Every changed line is a potential regression.
4. **Prove it's fixed** — Write a failing test that reproduces the bug BEFORE writing the fix. The test must fail without the fix and pass with it.
5. **Prove nothing else broke** — Run the full test suite after every fix. If any unrelated test fails, investigate before proceeding.

## Diagnostic Framework

### Step 1: Reproduce

Before any investigation, reproduce the bug reliably:

```text
REPRODUCTION CHECKLIST:
□ Can I trigger the bug consistently?
□ What are the exact steps/inputs?
□ What is the expected behavior?
□ What is the actual behavior?
□ What environment? (browser, Node version, OS, emulator vs production)
□ Is it intermittent? If so, what conditions increase frequency?
```

If you cannot reproduce, gather more information before proceeding. Never fix what you cannot see.

### Step 2: Isolate

Narrow down the problem space systematically:

#### Binary Search Strategy

For bugs in a pipeline or flow (A → B → C → D → E):

1. Check the midpoint (C). Is the data correct here?
2. If correct at C: bug is in D or E. Check D.
3. If incorrect at C: bug is in A, B, or C. Check B.
4. Continue halving until you find the exact failure point.

#### Layer Isolation

For full-stack bugs, isolate which layer is at fault:

```text
LAYER CHECKLIST:
□ Is the data correct in Firestore? → Data layer issue
□ Is the API/Function returning correct data? → Backend logic issue
□ Is React Query receiving correct data? → Data fetching issue
□ Is the component receiving correct props? → State management issue
□ Is the component rendering correctly? → UI/rendering issue
□ Is the styling correct? → CSS/Tailwind issue
```

#### Dependency Isolation

Check if the bug is in your code or a dependency:

```text
□ Does the issue exist with dependencies at previous versions?
□ Does a minimal reproduction (no app code) trigger the same bug?
□ Are there known issues in the dependency's GitHub issues?
```

### Step 3: Root Cause Analysis (RCA)

Once isolated, determine the root cause:

#### The 5 Whys

Ask "why" repeatedly until you reach the systemic cause:

```text
Bug: User sees stale data after mutation
Why 1: React Query cache wasn't invalidated → cache stale
Why 2: invalidateQueries used wrong query key → key mismatch
Why 3: Query key was hardcoded instead of using the key factory → no single source of truth
Why 4: No query key convention exists in the project → missing pattern
Root Cause: Missing query key factory pattern
Fix: Create query key factory + update all hooks + add lint rule
```

#### Common Root Cause Categories

| Category               | Symptoms                                  | Investigation                                                       |
| ---------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| **Race condition**     | Intermittent failures, timing-dependent   | Check async flows, Promise.all vs sequential, useEffect cleanup     |
| **Stale closure**      | Old values in callbacks/effects           | Check useCallback/useMemo deps, effect dependency arrays            |
| **Type mismatch**      | Runtime errors despite TS compilation     | Check `as` casts, `any` usage, external data boundaries             |
| **Missing null check** | "Cannot read property of undefined"       | Trace data flow backward from crash site                            |
| **State mutation**     | Unexpected re-renders, stale UI           | Check for direct array/object mutation instead of immutable updates |
| **Cache invalidation** | Stale data after writes                   | Check React Query invalidation, Firestore listener cleanup          |
| **Auth/permission**    | 403s, missing data, security rule denials | Check Firestore rules, Cloud Functions auth, tenant scoping                |
| **Environment delta**  | Works locally, fails in production        | Check env vars, emulator vs production config, CORS                 |

### Step 4: Write the Failing Test

**MANDATORY**: Before writing any fix, write a test that:

1. Reproduces the exact bug scenario
2. Asserts the expected (correct) behavior
3. **Fails** with the current code (proving the bug exists)

```typescript
// Example: Test that proves the bug
describe("useUpdateUser", () => {
  it("should invalidate user query cache after mutation", async () => {
    // Arrange: Set up initial cached data
    // Act: Trigger the mutation
    // Assert: Verify cache was invalidated and fresh data loaded
    // This test FAILS before the fix (cache stays stale)
    // This test PASSES after the fix
  });
});
```

### Step 5: Apply the Surgical Fix

Fix rules:

- **Change the minimum number of lines** to resolve the root cause
- **Do not refactor** during a bug fix. Refactoring is a separate task.
- **Do not fix adjacent issues** you discover. Log them as separate tasks.
- **Match existing code style** exactly — a bug fix should be invisible in the diff except for the fix itself
- **Add a comment only if the fix is non-obvious** — explain WHY, not WHAT

### Step 6: Verify

```text
VERIFICATION CHECKLIST:
□ The new test passes with the fix applied
□ The new test fails when the fix is reverted (proves the test is valid)
□ All existing tests still pass (no regressions)
□ TypeScript compilation succeeds with no new errors
□ Linting passes with no new warnings
□ The original reproduction steps no longer trigger the bug
```

### Step 7: Document

Every bug fix should produce:

```text
## Bug Fix Report
**Bug**: [One-line description]
**Root Cause**: [What was actually wrong and why]
**Fix**: [What was changed and why this fixes it]
**Tests Added**: [Test file(s) and what they verify]
**Regression Risk**: [Low/Medium/High — what could this fix affect?]
**Related Issues**: [Any adjacent problems discovered but NOT fixed]
```

## Anti-Patterns (NEVER DO)

| Anti-Pattern                                                     | Why It's Bad                                           | Do This Instead                 |
| ---------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------- |
| **Shotgun debugging** — changing random things until it works    | You don't understand the fix, it may mask the real bug | Follow the diagnostic framework |
| **Fix and pray** — no test, no reproduction                      | Bug will recur, no regression protection               | Write failing test FIRST        |
| **Big bang fix** — refactoring + fix + new features in one PR    | Impossible to review, high regression risk             | Fix only. Refactor separately.  |
| **Suppressing errors** — try/catch that swallows, `!` assertions | Hides bugs, makes future debugging harder              | Handle errors explicitly        |
| **Commenting out code** — "just in case we need it"              | Dead code confusion, misleading future readers         | Delete it. Git has history.     |
| **Copy-paste fix** — duplicating a fix across multiple sites     | DRY violation, future fixes miss copies                | Extract shared logic, fix once  |

## Backend-Specific Debugging

### Firestore Issues

```text
□ Check security rules in local dev tools (rules playground)
□ Verify document path matches expected tenant scoping
□ Check for missing indexes (local dev tool logs show index creation URLs)
□ Verify Firestore listener cleanup in useEffect return
□ Check batch/transaction atomicity for multi-document writes
```

### Cloud Functions Issues

```text
□ Check function logs (local dev tools or cloud console)
□ Verify auth context is present and correct
□ Check for cold start timing issues
□ Verify environment variables are set
□ Check CORS configuration for HTTP functions
```

### Auth Issues

```text
□ Check Firebase Auth local dev state
□ Verify token refresh / persistence settings
□ Check custom claims propagation timing
□ Verify auth state listener cleanup
```

## React-Specific Debugging

### Component Issues

```text
□ Check React DevTools for unexpected re-renders
□ Verify key props on list items (stale keys cause wrong renders)
□ Check useEffect dependency arrays (missing deps = stale closures)
□ Verify controlled vs uncontrolled input consistency
□ Check Suspense boundaries and error boundaries
```

### State Management Issues

```text
□ Zustand: Check subscription selectors (re-render on every state change?)
□ React Query: Check staleTime, cacheTime, refetchOnWindowFocus settings
□ React Query: Verify query key uniqueness and invalidation targets
□ Forms: Check react-hook-form mode (onChange vs onSubmit) and Zod schema
```

## Severity Classification

Use this to prioritize and communicate:

| Severity          | Definition                                                          | Response Time               |
| ----------------- | ------------------------------------------------------------------- | --------------------------- |
| **P0 — Critical** | App crash, data loss, security breach, all users affected           | Immediate. Drop everything. |
| **P1 — High**     | Major feature broken, significant users affected, workaround exists | Same day                    |
| **P2 — Medium**   | Feature degraded, edge case, minor UX issue                         | This sprint                 |
| **P3 — Low**      | Cosmetic, typo, minor inconvenience                                 | Backlog                     |
