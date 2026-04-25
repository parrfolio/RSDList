---
name: conductor-gates
description: >
  Full domain gate orchestration details used by conductor.powder —
  security, legal, billing, design-system, design-fidelity, accessibility,
  browser-testing, storybook, integration-maintenance, and documentation gates.
  Contains required evidence, cross-agent coordination, and trigger conditions.
  Extracted from conductor.powder.agent.md to reduce conductor context size.
agents:
  - conductor.powder
---

# Conductor Gate Orchestration

> **Origin**: Extracted from `conductor.powder.agent.md`. conductor.powder references this skill for full gate details. Compact gate checklists with test-anchored phrases remain in conductor.powder.agent.md.

## Security orchestration (security.application)

Powder must invoke security.application for any work that touches:

- Firestore data model or security rules
- Cloud Functions (callable or HTTP)
- Auth flows, onboarding, invites, roles, permissions, admin capabilities
- Multi-tenant scoping (tenantId/workspaceId) or membership docs
- Exports/imports/search/AI endpoints, or any high-cost endpoint
- Storage uploads or Storage rules

### Security gate

- If security.application returns FAIL, or reports any CRITICAL/HIGH finding, Powder must STOP the merge/release path.
- Powder must create remediation tasks, assign them (typically engineering.implementation), and rerun security.application until PASS.

### Required evidence for "Done"

Powder cannot mark a security-relevant task as done unless security.application provides:

- Firestore rules tests proving cross-tenant/cross-user denial
- Cloud Functions tests proving auth + authorization + validation (+ rate limiting where required)
- Verification commands executed (or blocking failures listed)
- Append-only audit logs protected by rules

## Legal docs orchestration (platform.pce)

Powder must invoke platform.pce for any work that touches:

- Production launch preparation or go-live readiness
- New data collection, analytics, tracking, or cookie usage
- AI features (LLMs, embeddings, model training, agentic actions)
- New third-party processors or subprocessors (Stripe, OpenAI, analytics, etc.)
- User content handling, uploads, or exports
- Auth changes (SSO/SAML, new identity providers, account deletion)
- Regional expansion (EU/UK, Canada, Brazil, US state privacy laws)
- Changes to payments, subscriptions, or billing

### Legal gate

- If platform.pce returns NEEDS INPUT, Powder must gather the missing information before proceeding.
- If platform.pce flags HIGH RISK items, Powder must note them for counsel review and not mark the task as done until acknowledged.

### Required evidence for "Done" (legal)

Powder cannot mark a legal-relevant task as done unless platform.pce provides:

- Updated `legal/terms-of-service.md`, `legal/privacy-policy.md`, and `legal/cookie-policy.md`
- Assumptions and placeholders explicitly listed
- Compliance/risk checklist with counsel-review items flagged
- Final status of DRAFT READY

## Billing orchestration (billing.stripe)

Powder must invoke billing.stripe for any work that touches:

- Stripe integration (subscriptions, checkout, billing portal, invoices)
- Pricing tiers, trials, upgrades/downgrades, cancellations
- Webhook-driven billing state (Firestore billing documents)
- Entitlements and feature gating based on plan/subscription status
- Payment methods, dunning, coupons, taxes
- Multi-tenant billing (tenant-scoped Stripe customers)

### Billing gate

- If billing.stripe returns NEEDS INPUT, Powder must gather the missing information (pricing model, trial rules, tax requirements) before proceeding.
- billing.stripe produces backend architecture and UX handoff specs only — it does NOT build UI. Powder must delegate UI work to frontend.implementation or design.ux-engineer using billing.stripe's handoff requirements.

### Required evidence for "Done" (billing)

Powder cannot mark a billing task as done unless billing.stripe provides:

- Stripe objects plan (Products, Prices, Portal config)
- Firestore billing data model (tenant-scoped)
- Cloud Functions API surface with auth rules
- Webhook event map with handlers
- Entitlements model with enforcement points
- UX handoff requirements for UI agents
- Test plan (Stripe test mode + emulator tests)
- Final status of READY

### Cross-agent coordination (billing)

Billing work typically requires multiple agents:

- **billing.stripe** → backend billing architecture, webhooks, entitlements
- **security.application** → security review of billing Functions, webhook signature verification, billing data rules
- **platform.pce** → payment/subscription clauses in TOS, billing data in Privacy Policy
- **frontend.implementation / design.ux-engineer** → checkout UI, billing portal, plan selection, upgrade flows

Powder must coordinate these agents when billing is introduced or changed.

## Design system orchestration (frontend.design-system)

Powder must invoke frontend.design-system for any work that touches:

- New UI features, pages, widgets, or components
- Frontend implementation tasks before delegating to frontend.implementation or design.ux-engineer
- Visual redesigns, theming changes, or design token updates
- Component library additions or modifications
- Any feature that involves building or modifying user interface elements

### Design system gate

- frontend.design-system must be invoked BEFORE frontend.implementation or design.ux-engineer for UI work
- Its Reuse Plan output must be passed to frontend.implementation and design.ux-engineer as required context
- frontend.design-system must also use the official Figma MCP (`use_figma`, `generate_figma_design`) to **create** Figma components, tokens, and variants — not just audit them
- If the task is to mirror, reproduce, capture, or faithfully represent a running localhost app or live web app in Figma, Powder must route through browser-verified evidence first, then frontend.design-system must use `generate_figma_design` as the authoritative first capture step for each reachable route/state
- This pre-capture browser evidence step is separate from the final frontend.browsertesting QA gate that runs after implementation when browser QA is required
- For these live capture tasks, `use_figma` is allowed only after capture for cleanup, token sync, component organization, variants, and structural edits
- If localhost is unavailable, the route/state inventory cannot be verified, or the Figma MCP is disconnected, Powder must treat the task as BLOCKED rather than allowing reconstructed placeholder screens
- When new components are built in code, frontend.design-system must create matching Figma components using `use_figma`
- Design tokens defined in CSS custom properties must be synced to Figma using `use_figma`
- If the output includes NEEDS NEW PATTERN, Powder must get user approval before proceeding with new pattern creation
- If the output includes FAIL (design drift or inconsistency), Powder must create remediation tasks before proceeding
- After frontend.implementation completes UI implementation, frontend.storybook MUST be invoked to write Storybook stories for all new/modified components
- Storybook is not optional — every UI component must have stories before the phase can be marked complete
- Missing frontend.design-system output is a hard workflow failure for UI work — the phase CANNOT proceed. `--auto` does not change this. If frontend.design-system was not invoked, STOP and invoke it now.

### Required evidence for "Done" (design system)

Powder cannot mark a UI-relevant task as done unless frontend.design-system has provided:

- Component inventory (Figma + code) relevant to the feature
- Reuse Plan with specific component file paths
- Cross-reference map showing Figma-to-code alignment
- Evidence that required Figma components, variants, and synced tokens were created or updated when the phase established or changed the design system
- Consistency warnings addressed or acknowledged
- Final status of PASS, or NEEDS NEW PATTERN with approval obtained

### Storybook gate

- frontend.storybook must be invoked after every UI implementation phase that creates or modifies UI components
- If Storybook is not configured, frontend.storybook must set it up before story coverage work continues
- Missing frontend.storybook output is a hard workflow failure for UI work — the phase CANNOT proceed. `--auto` does not change this. If frontend.storybook was not invoked, STOP and invoke it now.

### Required evidence for "Done" (storybook)

Powder cannot mark a UI-relevant task as done unless frontend.storybook has provided:

- Storybook setup confirmation when the project previously lacked Storybook
- Stories for all new or modified UI components relevant to the phase
- Coverage summary listing the components documented in Storybook
- Build or verification status for the Storybook work

### Cross-agent coordination (UI features)

UI feature work typically requires these agents in order:

- **frontend.design-system** → component inventory, reuse plan, token audit + Figma component creation (via the official Figma MCP)
- **design.visual-designer** → mock decomposition, Visual Implementation Spec production (using frontend.design-system reuse plan + design mock)
- **design.ux-engineer** → CRUD completeness, flow compliance, Storybook-first check (using DSE reuse plan)
- **frontend.implementation** → implementation (using DSE reuse plan + UX compliance plan)
- **frontend.storybook** → Storybook stories for all new/modified components (MANDATORY for UI phases)
- **quality.code-review** → review for correctness and design system adherence
- **frontend.accessibility** → accessibility audit of implemented UI (PASS/FAIL)

Powder must coordinate these agents in sequence for any UI feature work.

## Design fidelity orchestration (design.visual-designer)

Powder must invoke design.visual-designer for any work that involves:

- Design mocks, Figma frames, or screenshots that need to be translated into code
- Visual verification of implemented UI against a design reference
- Component-to-mock mapping when building new screens or features
- Design token gap analysis (mock values vs existing tokens)

### Design fidelity gate

- design.visual-designer must be invoked AFTER frontend.design-system and BEFORE design.ux-engineer for mock-driven UI work
- design.visual-designer receives frontend.design-system's Reuse Plan as input and produces a design.visual-designer VISUAL SPEC as output
- The design.visual-designer VISUAL SPEC must be passed to frontend.implementation as the authoritative implementation reference
- For any app shell, dashboard suite, or nav-driven product surface, Powder must require a Main Navigation Coverage Matrix before implementation begins. The matrix must list every primary navigation item, target route, screen purpose, primary KPI/module, and current implementation status.
- If design.visual-designer flags NEEDS NEW COMPONENT or missing tokens, Powder must route these to frontend.design-system for resolution before frontend.implementation implements
- After frontend.implementation completes implementation, design.visual-designer can be re-invoked in QA mode to verify visual fidelity
- If design.visual-designer QA returns FAIL with CRITICAL deviations, Powder must create remediation tasks for frontend.implementation before proceeding

### Required evidence for "Done" (design fidelity)

Powder cannot mark a mock-driven UI task as done unless design.visual-designer has provided:

- design.visual-designer VISUAL SPEC with Status: COMPLETE
- Component Map with all mock elements mapped to code components
- Token Map with all values mapped (or gaps flagged and resolved)
- All interactive states inventoried
- For nav-driven work: a Main Navigation Coverage Matrix that marks every primary nav destination as implemented, explicitly approved as deferred, or blocked with rationale
- If QA was performed: design.visual-designer QA: PASS

### When to invoke design.visual-designer

- **Mock-driven work (mandatory)**: Any time a design mock, Figma frame, or visual reference is provided with a task
- **After frontend.design-system**: design.visual-designer receives the Reuse Plan and adds visual precision
- **After frontend.implementation (QA mode)**: Re-invoke design.visual-designer to compare implementation against mock
- **During planning**: design.visual-designer can estimate visual complexity and flag missing design system coverage
- **NOT needed**: When there is no design reference (pure functional/backend work, or UI work following existing patterns without a new mock)

## Accessibility orchestration (frontend.accessibility)

Powder must invoke frontend.accessibility for any work that touches:

- New UI components, pages, views, or interactive widgets
- Form implementations (labels, validation, error handling)
- Navigation changes (routing, menus, breadcrumbs, skip links)
- Modal, dialog, popover, or overlay implementations
- Custom interactive widgets (tabs, comboboxes, carousels, date pickers)
- Drag-and-drop or gesture-based interactions
- Media content (images, video, audio, charts, data visualizations)
- Theming, color, or contrast changes

### Accessibility gate

- frontend.accessibility is invoked AFTER quality.code-review review and BEFORE commit for UI-relevant phases
- If frontend.accessibility returns FAIL (any CRITICAL or HIGH findings), Powder must STOP the commit path
- Powder must create remediation tasks, assign them to frontend.implementation or engineering.implementation, and re-invoke frontend.accessibility until PASS
- frontend.accessibility may also be invoked in parallel with quality.code-review when the phase is purely UI work

### Required evidence for "Done" (accessibility)

Powder cannot mark a UI-relevant task as done unless frontend.accessibility has provided:

- frontend.accessibility A11Y REPORT with Status: PASS
- Keyboard navigation verified
- Semantic structure and ARIA usage validated
- Contrast and focus management checked
- WCAG success criteria references for any findings
- Automated check results (axe/pa11y) when applicable

### When to invoke frontend.accessibility

- **During planning (via delivery.tpm/architecture.context)**: frontend.accessibility can assess a11y requirements for a feature spec
- **After implementation (gate)**: frontend.accessibility audits the implemented UI code — MANDATORY for UI phases
- **During review (via quality.code-review)**: quality.code-review may delegate a11y-specific review to frontend.accessibility
- **During frontend work (via frontend.implementation)**: frontend.implementation may invoke frontend.accessibility to verify her work before reporting back

## Browser agent testing orchestration (frontend.browsertesting)

Powder must invoke frontend.browsertesting for any work that involves:

- Verifying that the running application behaves correctly in a real browser
- Testing form validation, error messages, and successful submission flows
- Verifying responsive layout behavior across viewport sizes (320px, 768px, 1024px, 1440px)
- Testing authentication flows (login, logout, signup, password reset)
- Verifying interactive UI elements (modals, dropdowns, tabs, drag-and-drop)
- Browser-based accessibility audits (alt text, heading hierarchy, keyboard nav, contrast, focus)
- End-to-end user journey verification
- App shells, dashboards, or navigation systems where every primary nav destination must be reachable and materially distinct

### Pre-capture browser evidence gate

- For any running-app-to-Figma request, frontend.browsertesting must run BEFORE frontend.design-system starts live capture
- For any running-app-to-Figma request, browser testing is also the evidence collection phase
- The required output is a Capture Handoff Package containing the canonical route/state inventory, screenshots, and reachable/non-placeholder confirmation before frontend.design-system starts live capture
- If the Capture Handoff Package is missing, incomplete, or shows unreachable/placeholder destinations, Powder must treat live capture as BLOCKED and must not invoke frontend.design-system capture yet
- This evidence-collection step does NOT replace the final browser QA gate after implementation

### Browser testing gate

- frontend.browsertesting is invoked AFTER quality.code-review review and security/accessibility gates, typically as the final browser QA verification before commit
- If frontend.browsertesting returns FAIL (any CRITICAL or HIGH findings), Powder must STOP the commit path
- Powder must create remediation tasks, assign them to frontend.implementation, and re-invoke frontend.browsertesting until PASS
- frontend.browsertesting can run in parallel with frontend.accessibility when both are needed — they examine different dimensions (live behavior vs code-level a11y)
- For nav-driven UI work, browser testing is mandatory before Powder can mark the task complete. The browser test must click every primary navigation item and confirm each destination is reachable, non-placeholder, and materially distinct from the others.

### Prerequisites

- The application must be running locally (e.g., `pnpm dev`)
- VS Code browser agent tools must be enabled (`workbench.browser.enableChatTools: true`)
- If the application requires authentication, provide test credentials in the prompt

### Required evidence for "Done" (browser testing)

Powder cannot mark a UI-relevant task as done unless frontend.browsertesting has provided:

- frontend.browsertesting BROWSER TEST REPORT with Status: PASS
- All relevant scenarios executed (forms, responsive, auth, interactivity, accessibility, user journey)
- Screenshots captured for responsive layout verification
- No CRITICAL or HIGH findings unresolved
- For nav-driven UI work: explicit PASS on main navigation coverage with each primary nav destination exercised in the browser
- For running-app-to-Figma work: a pre-capture Capture Handoff Package with canonical route/state inventory, screenshots, and capture order for `generate_figma_design`

### When to invoke frontend.browsertesting

- **Before frontend.design-system live capture**: For any running-app-to-Figma request, collect the Capture Handoff Package first
- **After Step 9 (Polish)**: As a final quality gate across the full application
- **After UI implementation phases**: To run the final browser QA gate and verify that implemented features work correctly in the browser
- **After frontend.implementation fixes**: To re-verify that fixes resolve the reported issues
- **On user request**: When the user asks for browser testing, UI verification, or live app testing
- **Mandatory for app-shell/dashboard requests**: When the work includes a sidebar, top navigation, multiple dashboard destinations, or explicit instructions to mock all main navigation screens
- **NOT needed**: For backend-only changes, documentation, or non-UI work

## Integration maintenance orchestration (platform.system-maintenance)

Powder must invoke platform.system-maintenance whenever:

- A new skill is added to `.github/skills/<name>/SKILL.md`
- A new instruction is added to `.github/instructions/<name>.instructions.md`
- A new prompt is added to `.github/prompts/<name>.prompt.md`
- A new subagent is added to `.github/agents/<name>.agent.md`
- An existing skill or instruction frontmatter is modified
- A full audit of agent wiring consistency is requested

### Integration gate

- If platform.system-maintenance returns FAIL, Powder must review the issues and either fix them (by re-invoking platform.system-maintenance with corrections) or escalate to the user.
- If platform.system-maintenance returns NEEDS_REVIEW, Powder must present the recommendations to the user for confirmation before proceeding.
- platform.system-maintenance can run in parallel with other non-dependent subagents.

### Required evidence for "Done" (integration)

Powder cannot mark an artifact integration task as done unless platform.system-maintenance provides:

- platform.system-maintenance INTEGRATION REPORT with Status: PASS
- All layers of the awareness chain updated and validated
- No duplicate entries across any files
- agent-registry.json updated

### When to invoke platform.system-maintenance

- **After any subagent creates a new skill/instruction/prompt**: platform.system-maintenance validates the integration automatically
- **After Powder creates a new subagent**: platform.system-maintenance ensures the new agent is properly wired into the system
- **On user request**: "audit agents", "check agent wiring", "verify integration"
- **Periodically**: Powder may invoke platform.system-maintenance in full audit mode to catch drift

## Documentation orchestration (documentation.technical-writer)

Powder must invoke documentation.technical-writer for any work that:

- Adds a new agent (`.agent.md` file)
- Adds or modifies a skill (`SKILL.md`)
- Adds or modifies a prompt (`.prompt.md`)
- Adds or modifies an instruction (`.instructions.md`)
- Adds or modifies an MCP server configuration
- Changes agent orchestration flows or pipeline sequences
- Adds significant new capabilities that users need to know about

### Documentation gate

- documentation.technical-writer must scan ALL files in `docs/` to check if any documentation references the affected artifact type (agent pipelines, orchestration tables, agent lists, workflow descriptions)
- If docs mention the affected area but are now stale/incomplete, documentation.technical-writer updates them
- If no docs reference is needed (e.g., internal-only change with no user-facing impact), documentation.technical-writer reports "No docs update needed" with rationale
- The documentation check happens BEFORE the commit phase (Phase 2C), after quality.code-review review
- If documentation.technical-writer finds stale documentation unrelated to the current change, it should flag it but NOT block the commit
- documentation.technical-writer can run in parallel with security.application and frontend.accessibility gates when all are applicable

### Required evidence for "Done" (documentation)

Powder cannot mark a task that adds/modifies artifacts as done unless documentation.technical-writer has confirmed:

- Files in `docs/` checked (list which files were scanned)
- Files updated (if any), with summary of changes
- Rationale for no-update decisions (when no changes were needed)

### When to invoke documentation.technical-writer (documentation gate)

- **After any phase that adds/modifies agents, skills, prompts, instructions, or MCP configs**: documentation.technical-writer verifies `docs/` are current
- **After platform.system-maintenance integration**: documentation.technical-writer checks if platform.system-maintenance's changes require user-facing doc updates
- **Before Phase 2C commit step**: Mandatory for artifact-changing phases
- **NOT needed**: For pure code implementation phases that don't add or modify system artifacts
