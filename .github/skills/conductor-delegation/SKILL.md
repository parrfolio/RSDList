---
name: conductor-delegation
description: >
  Per-agent delegation recipes used by conductor.powder. Contains the
  subagent_instructions cookbook with invocation protocols, skill injection
  requirements, and expected outputs for all 25+ subagents. Extracted from
  conductor.powder.agent.md to reduce conductor context size.
agents:
  - conductor.powder
---

# Conductor Delegation Recipes

> **Origin**: Extracted from `conductor.powder.agent.md`. conductor.powder references this skill for per-agent invocation details. The Subagent Invocation Protocol and Agent Spec Injection Pattern remain in conductor.powder.agent.md.

<subagent_instructions>
**CRITICAL: Powder is a PURE ORCHESTRATOR**

- Powder NEVER writes code, reads source files, or makes direct changes
- Powder ONLY delegates, orchestrates, communicates with user, and writes plan/completion files
- ALWAYS launch subagents in parallel when tasks are independent — sequential launches are a bug
- When in doubt, delegate. There is no task too small to delegate.

## Agent spec file map (reference)

| Agent                          | Spec File                                                |
| ------------------------------ | -------------------------------------------------------- |
| architecture.context           | `.github/agents/architecture.context.agent.md`           |
| architecture.engineer          | `.github/agents/architecture.engineer.agent.md`          |
| architecture.exploration       | `.github/agents/architecture.exploration.agent.md`       |
| billing.stripe                 | `.github/agents/billing.stripe.agent.md`                 |
| delivery.tpm                   | `.github/agents/delivery.tpm.agent.md`                   |
| design.ux-engineer             | `.github/agents/design.ux-engineer.agent.md`             |
| design.visual-designer         | `.github/agents/design.visual-designer.agent.md`         |
| documentation.technical-writer | `.github/agents/documentation.technical-writer.agent.md` |
| engineering.implementation     | `.github/agents/engineering.implementation.agent.md`     |
| frontend.accessibility         | `.github/agents/frontend.accessibility.agent.md`         |
| frontend.design-system         | `.github/agents/frontend.design-system.agent.md`         |
| frontend.implementation        | `.github/agents/frontend.implementation.agent.md`        |
| frontend.browsertesting        | `.github/agents/frontend.browsertesting.agent.md`        |
| frontend.marketing-site        | `.github/agents/frontend.marketing-site.agent.md`        |
| frontend.storybook             | `.github/agents/frontend.storybook.agent.md`             |
| platform.agent-foundry         | `.github/agents/platform.agent-foundry.agent.md`         |
| platform.git                   | `.github/agents/platform.git.agent.md`                   |
| platform.pce                   | `.github/agents/platform.pce.agent.md`                   |
| platform.system-maintenance    | `.github/agents/platform.system-maintenance.agent.md`    |
| quality.code-review            | `.github/agents/quality.code-review.agent.md`            |
| quality.test-architecture      | `.github/agents/quality.test-architecture.agent.md`      |
| reasoning.critical-thinking    | `.github/agents/reasoning.critical-thinking.agent.md`    |
| reliability.srre               | `.github/agents/reliability.srre.agent.md`               |
| compliance.phases-checker      | `.github/agents/compliance.phases-checker.agent.md`      |
| data.synthetic                 | `.github/agents/data.synthetic.agent.md`                 |
| security.application           | `.github/agents/security.application.agent.md`           |
| speckit.analyze                | `.github/agents/speckit.analyze.agent.md`                |
| speckit.checklist              | `.github/agents/speckit.checklist.agent.md`              |
| speckit.clarify                | `.github/agents/speckit.clarify.agent.md`                |
| speckit.constitution           | `.github/agents/speckit.constitution.agent.md`           |
| speckit.implement              | `.github/agents/speckit.implement.agent.md`              |
| speckit.plan                   | `.github/agents/speckit.plan.agent.md`                   |
| speckit.specify                | `.github/agents/speckit.specify.agent.md`                |
| speckit.tasks                  | `.github/agents/speckit.tasks.agent.md`                  |
| speckit.taskstoissues          | `.github/agents/speckit.taskstoissues.agent.md`          |

**MANDATORY: Skill Injection**
Before every subagent invocation, check `.github/skills/*/SKILL.md` frontmatter for skills that list the target subagent in their `agents:` array. Include matching skill file paths in the subagent's prompt with instructions to `read_file` them before starting work. See "Skill Discovery & Injection Protocol" in conductor.powder.agent.md.

## Per-Agent Invocation Recipes

**architecture.context**:

- Provide the user's request and any relevant context
- Instruct to gather comprehensive context and return structured findings
- Tell them NOT to write plans, only research and return findings

**engineering.implementation**:

- Provide the specific phase number, objective, files/functions, and test requirements
- Instruct to follow strict TDD: tests first (failing), minimal code, tests pass, lint/format
- Tell them to work autonomously and only ask user for input on critical implementation decisions
- Remind them NOT to proceed to next phase or write completion files (Conductor handles this)

**quality.code-review**:

- Provide the phase objective, acceptance criteria, and modified files
- Instruct to verify implementation correctness, test coverage, and code quality
- Tell them to return structured review: Status (APPROVED/NEEDS_REVISION/FAILED), Summary, Issues, Recommendations
- Remind them NOT to implement fixes, only review

**architecture.exploration**:

- Provide a crisp exploration goal (what you need to locate/understand)
- Instruct it to be read-only (no edits/commands/web)
- Require strict output: <analysis> then tool usage, final single <results> with <files>/<answer>/<next_steps>
- Use its <files> list to decide what architecture.context should read in depth, and what engineering.implementation should modify

**frontend.implementation**:

- Use #runSubagent to invoke for frontend/UI implementation tasks
- Provide the specific phase, UI components/features to implement, and styling requirements
- Instruct to follow TDD for frontend (component tests first, then implementation)
- Tell them to focus on accessibility, responsive design, and project's styling patterns
- Remind them to report back with what was implemented and tests passing

**platform.pce**:

- Use #runSubagent to invoke for legal document drafting (TOS, Privacy Policy, Cookie Policy)
- Provide: app name, company info, data categories collected, tracking/cookie stack, AI usage, subprocessors, and target jurisdictions
- If info is unavailable, instruct platform.pce to use safe defaults and list assumptions explicitly
- platform.pce will scan the codebase (auth, analytics, AI integrations, env files) for discovery before drafting
- Expect structured output: assumptions, draft documents, compliance/risk checklist, and final status (DRAFT READY or NEEDS INPUT)
- If NEEDS INPUT is returned, gather the missing info and re-invoke
- If HIGH RISK items are flagged, surface them to the user for counsel review before marking done
- Remind platform.pce NOT to implement code — it only produces legal markdown documents

**billing.stripe**:

- Use #runSubagent to invoke for Stripe billing integration tasks
- Provide: pricing model (tiers, trial length, monthly/annual), B2C vs B2B, multi-tenant requirements, tax needs, and any existing billing code
- billing.stripe designs the backend architecture: Stripe objects, Firestore billing model, Cloud Functions, webhooks, entitlements
- billing.stripe does NOT build UI — it produces UX handoff specs that Powder must route to frontend.implementation or design.ux-engineer
- Expect structured output: Stripe objects plan, Firestore model, Cloud Functions API, webhook map, entitlements, UX handoff, test plan, and final status (READY or NEEDS INPUT)
- If NEEDS INPUT is returned, gather the missing info and re-invoke
- After billing.stripe completes, invoke security.application to security-review the billing Functions and webhook handlers
- After billing.stripe completes, invoke platform.pce to update TOS/Privacy Policy with payment and billing clauses

**frontend.design-system**:

- Use #runSubagent to invoke BEFORE any frontend/UI implementation work
- Provide: the feature description, which UI elements are needed, and any Figma references or mockups
- frontend.design-system audits both Figma (via the official Figma MCP) and the codebase to produce a component inventory and reuse plan
- It does NOT implement code — it only audits and recommends
- However, frontend.design-system DOES create and update Figma components, tokens, and variants via the official Figma MCP — this is NOT code, it's design artifact creation
- When a design foundation is being established or new components are being built, instruct frontend.design-system to use `use_figma` and `generate_figma_design` to populate Figma
- If the source of truth is a running localhost app or live web app and the user wants the real UI in Figma, Powder MUST provide browser-verified route/state evidence and instruct frontend.design-system to use `generate_figma_design` first for each reachable route/state. `use_figma` comes after capture only.
- If the app is unavailable or the Figma MCP is disconnected for this workflow, return BLOCKED and stop. Do NOT let frontend.design-system reconstruct finished screens from code, memory, or generic placeholders.
- Expect structured output: Figma Inventory, Code Inventory, Cross-Reference Map, Reuse Plan, New Pattern Assessment, Consistency Warnings, and final status (PASS / FAIL / NEEDS NEW PATTERN)
- If NEEDS NEW PATTERN is returned, get user approval before creating new components
- If FAIL is returned (design drift/inconsistency), create remediation tasks before proceeding
- Pass the Reuse Plan output to frontend.implementation and design.ux-engineer as context for their work
- The DSE Reuse Plan should include specific file paths for every component and token to reuse

**design.visual-designer**:

- Use #runSubagent to invoke for mock decomposition and Visual Implementation Spec production
- Provide: the design mock/Figma frame reference, frontend.design-system's Reuse Plan output, feature description, and target breakpoints
- design.visual-designer decomposes design mocks into structured design.visual-designer VISUAL SPEC documents that frontend.implementation follows pixel-for-pixel
- design.visual-designer does NOT write code — it produces visual specifications only
- Always inject both skills: `.github/skills/product-designer/SKILL.md` and `.github/skills/design-system/SKILL.md`
- Always inject: `.github/instructions/design-fidelity.instructions.md`
- **CRITICAL — Image Relay Protocol (v2 Visual Description MANDATORY)**: `runSubagent` can only pass text — images/screenshots attached to Powder's chat are NOT forwarded to design.visual-designer. When the user provides images/screenshots (not a Figma URL), Powder MUST:
  1. Analyze the images herself before calling design.visual-designer
  2. Produce a **v2 Visual Description** using the full 10-section format (Component Tree, Theme Overrides, Typography Inventory, Spacing, Visual Effects, Colors with hex, Interactive States, Responsive Hints, Content & Data, NEEDS NEW COMPONENT). See `.github/instructions/visual-description-protocol.instructions.md`.
  3. **Verify against the Quality Checklist** before sending — every element mapped to a design system component, all colors in hex, all spacing in pixels, sample content from the mock included.
  4. Include this v2 Visual Description in design.visual-designer's `runSubagent` prompt
  5. design.visual-designer will use this description as its primary input (Mode C)
  - **Exception**: If a Figma URL is available, pass it directly — design.visual-designer can extract values via the official Figma MCP (Mode A) and no Visual Description is needed
  - **Running app exception to the exception**: If the task is to faithfully mirror a running localhost app or live web app in Figma, do NOT default to Mode C. Route through frontend.browsertesting for browser evidence and frontend.design-system for `generate_figma_design` capture. frontend.design-system owns the live capture and Figma write path in this workflow. Mode C is for screenshots and mocks, not as a substitute for blocked live capture.
  - **The old 10-bullet format is RETIRED.** Do NOT write Visual Descriptions that look like `- Overall layout: ...` / `- Color palette observed: ...`
- Expect structured output: design.visual-designer VISUAL SPEC with Layout Structure, Component Map, Token Map, Typography Spec, Spacing Spec, Visual Effects, Interactive States, Responsive Behavior, Missing Tokens/New Patterns, and Implementation Notes
- If design.visual-designer flags NEEDS NEW COMPONENT: route to frontend.design-system for component creation before proceeding to frontend.implementation
- If design.visual-designer flags missing tokens: route to frontend.design-system for token creation
- design.visual-designer can be re-invoked in QA mode after frontend.implementation implementation — provide the original mock + implemented file paths
- In QA mode, expect: design.visual-designer QA: PASS or design.visual-designer QA: FAIL with specific deviations categorized as CRITICAL/MINOR/ACCEPTABLE
- If QA returns FAIL with CRITICAL deviations: create remediation tasks for frontend.implementation and re-invoke design.visual-designer QA after fixes
- Can invoke architecture.exploration for codebase exploration to find existing components and tokens
- Can run in parallel with design.ux-engineer when design.visual-designer produces visual specs and design.ux-engineer checks flow compliance (they examine different dimensions of the same mock)

**frontend.accessibility**:

- Use #runSubagent to invoke for accessibility audits of UI code
- Provide: files/components to audit, feature description, specific a11y concerns (or "full audit")
- frontend.accessibility audits for WCAG 2.1/2.2 conformance: semantics, keyboard, ARIA, contrast, focus, forms, media
- Expect structured output: frontend.accessibility A11Y REPORT with Status (PASS/FAIL/NEEDS_REMEDIATION), Findings (CRITICAL/HIGH/MEDIUM/LOW), WCAG References, Verification checklist, and Recommendations
- If FAIL is returned (CRITICAL or HIGH findings): STOP commit path, create remediation tasks for frontend.implementation, then re-invoke frontend.accessibility
- When invoking as a gate (after quality.code-review review): instruct frontend.accessibility to be read-only — audit only, no edits
- When frontend.implementation invokes frontend.accessibility mid-implementation: frontend.accessibility may suggest or apply fixes
- Can run in parallel with security.application when a phase touches both UI and security-relevant code
- Remind frontend.accessibility of the project's UI stack (React, Tailwind, Shadcn/ui, Radix) for framework-specific guidance

**platform.system-maintenance**:

- Use #runSubagent to invoke for agent system integration and maintenance tasks
- Provide: the file path of the new/modified artifact (skill, instruction, prompt, or agent)
- For full audits: instruct platform.system-maintenance to run in "full audit" mode — it will scan all artifacts and cross-reference against all integration points
- platform.system-maintenance edits agent configuration files only: `.agent.md`, `copilot.instructions.md`, `agent-registry.json`
- Expect structured output: platform.system-maintenance INTEGRATION REPORT with Status (PASS/FAIL/NEEDS_REVIEW), Changes Applied table, Validation Checklist, Issues, and Recommendations
- If FAIL is returned: review issues and re-invoke platform.system-maintenance with corrections or escalate to user
- If NEEDS_REVIEW is returned: present recommendations to user for confirmation
- platform.system-maintenance is idempotent — safe to re-invoke on the same artifact
- Can run in parallel with other subagents that don't touch agent configuration files

**documentation.technical-writer**:

- Use #runSubagent to invoke for all technical documentation tasks
- Provide: what to document, which files/features to cover, target audience, and output location
- documentation.technical-writer reads code via architecture.exploration when needed to understand what to document — he never guesses API behavior
- For large documentation tasks: can run in parallel with engineering.implementation/frontend.implementation when docs accompany implementation
- documentation.technical-writer writes markdown files and inline JSDoc/TSDoc only — never modifies application logic
- No security.application or frontend.accessibility gate required for documentation.technical-writer' output (markdown documentation)
- quality.code-review review is sufficient for documentation quality
- **Mandatory documentation gate**: documentation.technical-writer is also invoked automatically when any phase adds or modifies system artifacts (agents, skills, prompts, instructions, MCP configs). In this mode, documentation.technical-writer scans `docs/` for stale references and updates them. See "Documentation orchestration (documentation.technical-writer)" section in `.github/skills/conductor-gates/SKILL.md`.
- Expect output: list of files created/modified, coverage summary, open questions, recommendations

**frontend.storybook**:

- Use #runSubagent to invoke for all Storybook-related tasks: setup, story writing, coverage audits, config maintenance
- Provide: which components need stories, whether Storybook needs setup, desired coverage scope, plus frontend.design-system's Reuse Plan, Cross-Reference Map, Storybook Handoff Package, and any Figma components created or updated for the phase
- For new projects without Storybook: invoke frontend.storybook with a setup task first — she runs `npx storybook@latest init`
- frontend.storybook writes story files (`.stories.tsx`), MDX docs, and Storybook config only — never modifies component source code
- Can run in parallel with frontend.implementation (frontend.implementation builds components, frontend.storybook documents them)
- Storybook is MANDATORY for all UI components — frontend.storybook must be invoked for every UI phase, not just on request
- Powder must invoke frontend.storybook after every frontend.implementation implementation phase that creates or modifies UI components
- Powder must pass frontend.design-system's authoritative component inventory to frontend.storybook so Storybook coverage matches the design-system and Figma inventory, not just the implementation summary
- If Storybook is not yet configured in the project, frontend.storybook must set it up first before writing stories
- Often invoked after frontend.design-system (design system audit) to ensure new components have stories
- frontend.accessibility gate RECOMMENDED after frontend.storybook's work — stories render UI and accessibility matters
- No security.application gate required — Storybook is a dev tool, not a production security surface
- quality.code-review review sufficient for story code quality
- frontend.storybook can invoke architecture.exploration for codebase exploration to find all exported components
- Expect output: files created/modified, coverage summary (components/stories/percentage), build status, recommendations

**quality.test-architecture**:

- Use #runSubagent to invoke for all test engineering tasks: spec-driven test generation and coverage auditing
- **Two operating modes** — specify which mode in the task prompt:
  - **Test-First**: Reads SpecKit artifacts (spec.md, plan.md, tasks.md) and requirements → generates failing test suites BEFORE implementation begins. Best used during DESIGN→IMPLEMENT transition.
  - **Coverage Audit**: Reads code + specs → runs existing tests → identifies untested paths → writes missing tests. Best used during VALIDATE phase.
- Provide: spec file paths, source file paths (for Coverage Audit), which acceptance criteria to cover, desired coverage scope
- quality.test-architecture writes test files only (`.test.ts`, `.spec.ts`, `.test.tsx`, `.spec.tsx`) — never modifies application source code
- Classic TDD pair: invoke quality.test-architecture (Test-First) in parallel with engineering.implementation (implementation) — quality.test-architecture writes the failing tests, engineering.implementation makes them pass
- Can also pair with frontend.implementation: quality.test-architecture writes component tests, frontend.implementation builds the components
- frontend.accessibility gate RECOMMENDED after quality.test-architecture' work on UI component tests — accessibility assertions matter
- No security.application gate required — test code is not a production security surface
- quality.code-review review sufficient for test code quality
- quality.test-architecture can invoke architecture.exploration for codebase exploration to find testable surfaces
- Expect output: test files created/modified, coverage map (requirements → test cases), pass/fail counts, gaps remaining, recommendations

**reliability.srre**:

- Use #runSubagent to invoke for targeted bug fixes via the Quick Fix workflow
- Provide: bug description, symptoms, affected files (from architecture.exploration exploration), severity assessment
- Always inject the bug-fix skill: `.github/skills/bug-fix/SKILL.md`
- Always inject instruction files matching the file types reliability.srre will edit
- reliability.srre follows RCA → Reproduce → Fix → Verify: diagnoses root cause, writes failing test, applies surgical fix, runs full test suite
- reliability.srre does NOT refactor, does NOT fix adjacent issues, does NOT expand scope
- If reliability.srre determines the bug requires architectural changes: he will STOP and report back — Powder must then switch to full Phase 1 Planning with engineering.implementation
- Expect output: Bug Fix Report (root cause, fix description, tests added, verification results, regression risk, related issues)
- After reliability.srre completes: invoke quality.code-review for review, then security.application/frontend.accessibility gates if the fix touches security/UI code
- Can invoke architecture.exploration internally for additional codebase exploration
- Can run in parallel with other reliability.srre instances for independent bugs affecting different files

**frontend.marketing-site**:

- Use #runSubagent to invoke for all public-facing marketing page implementation
- Provide: page type (landing, pricing, features, about), content/copy requirements, product description, and any design references
- frontend.marketing-site implements full marketing pages: hero sections, feature grids, pricing tiers, testimonials, FAQ, CTAs, social proof, pre-auth login/signup layouts
- frontend.marketing-site uses the `marketing-site` skill — ensure the skill path `.github/skills/marketing-site/SKILL.md` is included in the prompt
- Instruct to follow TDD: write component tests first, then implement, verify tests pass
- frontend.marketing-site does NOT touch app-internal UI (dashboards, settings, admin). That domain belongs to frontend.implementation.
- Can run in parallel with frontend.implementation when frontend.marketing-site builds marketing pages and frontend.implementation builds app-internal UI
- frontend.design-system gate RECOMMENDED before frontend.marketing-site: audit design tokens and ensure marketing pages align with the brand system
- frontend.accessibility gate REQUIRED after frontend.marketing-site: marketing pages are public-facing and must meet WCAG 2.2 AA
- security.application gate NOT required — marketing pages are static/presentational with no auth-sensitive logic
- quality.code-review review sufficient for code quality
- Expect output: files created/modified, sections implemented, conversion checklist verification, test results, recommendations

**design.visual-designer** (duplicate entry consolidated with first entry above):

See the design.visual-designer entry above for complete invocation recipe.

**frontend.browsertesting**:

- Use #runSubagent to invoke for automated browser testing of the running application
- Provide: application URL (e.g., `http://localhost:5173`), specific pages/routes to test, which scenarios to run (or "full test suite"), any test credentials for auth
- Always inject the browser-testing skill: `.github/skills/browser-testing/SKILL.md`
- Always inject: `.github/instructions/a11y.instructions.md` (accessibility rules apply to browser-based verification)
- frontend.browsertesting opens the app in VS Code's integrated browser and interacts with it autonomously
- frontend.browsertesting does NOT write or modify code — it only tests and reports findings
- Expect structured output: frontend.browsertesting BROWSER TEST REPORT with Status (PASS/FAIL/NEEDS_REMEDIATION), Findings (CRITICAL/HIGH/MEDIUM/LOW), Scenarios Executed, Verification Checklist
- For running-app-to-Figma capture work, require the report to include a Capture Handoff Package: canonical route/state inventory, screenshots, reachable/non-placeholder confirmation, and recommended capture order for `generate_figma_design`
- If FAIL is returned (CRITICAL or HIGH findings): STOP commit path, create remediation tasks for frontend.implementation, then re-invoke frontend.browsertesting after fixes
- If the app is unavailable or required routes/states cannot be exercised for a capture workflow, treat the result as BLOCKED rather than proceeding with guessed screens
- Can run in parallel with frontend.accessibility — browser testing verifies live behavior, a11y audits verify code-level compliance
- Can be invoked after any UI implementation phase as a live verification gate
- Prerequisites: the dev server must be running and browser tools must be enabled in VS Code
- For auth flow testing: provide test credentials or instruct the agent to test error cases only
- quality.code-review review is NOT required for frontend.browsertesting output (it produces reports, not code)

**compliance.phases-checker**:

- Use #runSubagent to invoke as the FINAL step after all implementation phases complete, but BEFORE writing the plan completion file
- Provide: plan name, total number of phases, plan directory path, attempt number (starts at 1)
- compliance.phases-checker is read-only — it NEVER modifies files, only audits them
- It independently reads all phase completion files and verifies: Phase Gate Receipt exists, no contradictions, evidence contains real artifact references, and cross-references evidence against actual workspace files
- Expect structured output: COMPLIANCE AUDIT REPORT with Status (PASS/FAIL/ESCALATED), per-phase results table, failed phases with specific failure reasons, and recommendations
- **If PASS**: Proceed to write the plan completion file (Phase 4)
- **If FAIL**: Re-execute the failed phase gates (e.g., run frontend.storybook if Storybook evidence is missing), update phase completion files, then re-invoke compliance.phases-checker with attempt number incremented
- **If ESCALATED** (attempt 3 failure): STOP immediately. Present the escalation report to the user. Do NOT write the plan completion file.
- Maximum 3 retry attempts per plan audit. Each retry must address the specific failure from the previous attempt.
- compliance.phases-checker does NOT check code quality or feature correctness — only process compliance (gates ran, evidence exists)
- No quality.code-review review required for compliance.phases-checker output (it produces audit reports, not code)

**data.synthetic**:

- Use #runSubagent to invoke for synthetic data generation tasks — factory functions, seed scripts, Storybook fixtures, and test data
- Provide: target entities/schemas, volume profile (dev/demo/staging/load-test), output locations, and any relationship constraints
- Always inject the synthetic-data skill: `.github/skills/synthetic-data/SKILL.md`
- Always inject applicable TypeScript instructions when generating `.ts` files: `typescript-5-es2022.instructions.md`, `nodejs-javascript-vitest.instructions.md`
- data.synthetic discovers schemas (TypeScript interfaces, Zod schemas, Firestore types), designs generation strategy, builds typed factories, composes seed scripts, and exports fixtures
- data.synthetic does NOT modify application source code, UI components, or schema definitions — it only generates data factories and seeds
- Expect structured output: factory files, seed scripts, fixture exports, data generation README, and completion report (entity count, relationship graph, volume profile)
- Can run in parallel with engineering.implementation or frontend.implementation when data generation is independent of feature code
- After completion, route to quality.code-review for factory code review and quality.test-architecture for factory tests
- If data.synthetic flags ambiguous schema interpretation or relationship design, it will present 2-3 options — select one and re-invoke
</subagent_instructions>
