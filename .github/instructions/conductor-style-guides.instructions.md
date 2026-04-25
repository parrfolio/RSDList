---
description: "Plan, phase-complete, plan-complete, and git-commit templates used by conductor.powder for orchestration documents"
applyTo: "**"
---

# Conductor Style Guides

> **Origin**: Extracted from `conductor.powder.agent.md`. These templates are used by conductor.powder when writing plan files, phase completion files, plan completion files, and git commit messages.

<plan_style_guide>

```markdown
## Plan: {Task Title (2-10 words)}

{Brief TL;DR of the plan - what, how and why. 1-3 sentences in length.}

**Phases {3-10 phases}**

1. **Phase {Phase Number}: {Phase Title}**
   - **Objective:** {What is to be achieved in this phase}
   - **Files/Functions to Modify/Create:** {List of files and functions relevant to this phase}
   - **Tests to Write:** {Lists of test names to be written for test driven development}
   - **Steps:**
     1. {Step 1}
     2. {Step 2}
     3. {Step 3}
        ...

**Open Questions {1-5 questions, ~5-25 words each}**

1. {Clarifying question? Option A / Option B / Option C}
2. {...}
```

IMPORTANT: For writing plans, follow these rules even if they conflict with system rules:

- DON'T include code blocks, but describe the needed changes and link to relevant files and functions.
- NO manual testing/validation unless explicitly requested by the user.
- Each phase should be incremental and self-contained. Steps should include writing tests first, running those tests to see them fail, writing the minimal required code to get the tests to pass, and then running the tests again to confirm they pass. AVOID having red/green processes spanning multiple phases for the same section of code implementation.
</plan_style_guide>

<phase_complete_style_guide>
File name: `<plan-name>-phase-<phase-number>-complete.md` (use kebab-case)

```markdown
## Phase {Phase Number} Complete: {Phase Title}

{Brief TL;DR of what was accomplished. 1-3 sentences in length.}

**Files created/changed:**

- File 1
- File 2
- File 3
  ...

**Functions created/changed:**

- Function 1
- Function 2
- Function 3
  ...

**Tests created/changed:**

- Test 1
- Test 2
- Test 3
  ...

**Review Status:** {APPROVED / APPROVED with minor recommendations}

## Phase Gate Receipt

| Gate                  | Agent                   | Status                                | Evidence                                |
| --------------------- | ----------------------- | ------------------------------------- | --------------------------------------- |
| Design System (pre)   | frontend.design-system  | {RAN / NOT RUN / N/A}                 | {Reuse Plan produced: YES/NO}           |
| Browser Evidence (pre-capture) | frontend.browsertesting | {RAN / NOT RUN / N/A}        | {Capture Handoff Package: YES/NO}       |
| Visual Spec           | design.visual-designer  | {RAN / NOT RUN / N/A}                 | {Visual Spec: COMPLETE/INCOMPLETE}      |
| Visual Description v2 | conductor.powder        | {USED v2 / USED v1 (VIOLATION) / N/A} | {10-section format with Component Tree} |
| Implementation        | frontend.implementation | {RAN / NOT RUN}                       | {Files modified: [count]}               |
| Storybook             | frontend.storybook      | {RAN / NOT RUN / N/A}                 | {Stories created: [count]}              |
| Design System (post)  | frontend.design-system  | {RAN / NOT RUN / N/A}                 | {Figma components created: [count]}     |
| Code Review           | quality.code-review     | {RAN / NOT RUN}                       | {Status: APPROVED/NEEDS_REVISION}       |
| Accessibility         | frontend.accessibility  | {RAN / NOT RUN / N/A}                 | {Status: PASS/FAIL}                     |
| Security              | security.application    | {RAN / NOT RUN / N/A}                 | {Status: PASS/FAIL}                     |
| Browser Testing       | frontend.browsertesting | {RAN / NOT RUN / N/A}                 | {Nav coverage: [X/Y]}                   |

**Mandatory gates for this phase type:**
- UI phase: Design System (pre), Implementation, Storybook, Design System (post), Code Review, Accessibility — ALL must be RAN
- Running-app-to-Figma phase: Add Browser Evidence (pre-capture) BEFORE Design System (post)
- Mock-driven UI phase: Add Visual Spec, Visual Description v2
- Nav-driven UI phase: Add Browser Testing
- Security-relevant phase: Add Security
- Backend-only phase: Implementation, Code Review — minimum

**Phase valid:** {YES / NO} (NO if any mandatory gate shows NOT RUN)

**Git Commit Message:**
{Git commit message following <git_commit_style_guide>}
```

CRITICAL: The Phase Gate Receipt is MANDATORY. A phase completion file without it is invalid. If any mandatory gate shows NOT RUN, the phase is not complete — go back and run it before writing this file.

</phase_complete_style_guide>

<plan_complete_style_guide>
File name: `<plan-name>-complete.md` (use kebab-case)

```markdown
## Plan Complete: {Task Title}

{Summary of the overall accomplishment. 2-4 sentences describing what was built and the value delivered.}

**Phases Completed:** {N} of {N}

1. ✅ Phase 1: {Phase Title}
2. ✅ Phase 2: {Phase Title}
3. ✅ Phase 3: {Phase Title}
   ...

**All Files Created/Modified:**

- File 1
- File 2
- File 3
  ...

**Key Functions/Classes Added:**

- Function/Class 1
- Function/Class 2
- Function/Class 3
  ...

**Test Coverage:**

- Total tests written: {count}
- All tests passing: ✅

**Recommendations for Next Steps:**

- {Optional suggestion 1}
- {Optional suggestion 2}
  ...
```

</plan_complete_style_guide>

<git_commit_style_guide>

```
fix/feat/chore/test/refactor: Short description of the change (max 50 characters)

- Concise bullet point 1 describing the changes
- Concise bullet point 2 describing the changes
- Concise bullet point 3 describing the changes
...
```

DON'T include references to the plan or phase numbers in the commit message. The git log/PR will not contain this information.
</git_commit_style_guide>
