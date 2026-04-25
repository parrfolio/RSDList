---
description: "Run automated browser agent testing on the running application to verify UI behavior, forms, layouts, auth flows, and accessibility"
agent: "conductor.powder"
---

# Browser Agent Testing

You are performing automated browser agent testing on a running web application.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.browsertesting** — Automated browser testing (PASS/FAIL gate)
2. **@frontend.implementation** — Fix issues found during testing
3. **@frontend.accessibility** — Deep a11y audit if browser testing flags concerns

When the browser test will feed a running-app-to-Figma workflow, the browser report must also become the capture handoff artifact for frontend.design-system.

For any app shell, dashboard suite, or nav-driven product surface, require explicit PASS on main navigation coverage before marking the work complete.

## Prerequisites

- Application running locally on `localhost`
- VS Code browser tools enabled (`workbench.browser.enableChatTools: true`)
- Browser tools enabled in Copilot Chat tools picker
- If the app is unavailable, return BLOCKED rather than inventing route coverage or screenshots

## Testing Scenarios

### Form Validation

- Submit with empty required fields → verify error messages
- Enter invalid data → verify validation rules fire
- Fill correctly and submit → verify success behavior
- Check error messages are accessible (aria-invalid, aria-describedby)

### Responsive Layouts

- Screenshot at 320px, 768px, 1024px, 1440px
- Verify content reflows without horizontal scrolling
- Verify navigation collapses/expands correctly
- Verify no elements overflow or overlap

### Authentication Flows

- Login with empty credentials → verify error handling
- Invalid email format → verify client-side validation
- Valid credentials → verify successful redirect
- Logout → verify session ends and redirects

### Interactive Functionality

- Click through all navigation items → verify routing
- Confirm each primary navigation destination is reachable, non-placeholder, and materially distinct
- Open/close modals, dropdowns, popovers
- Verify state updates on toggle, select, tab interactions
- Test drag-and-drop and gesture interactions

### Accessibility (Browser-Based)

- Check images for alt text
- Verify heading hierarchy (no skipped levels)
- Tab through interactive elements → verify keyboard navigation
- Check visible focus indicators
- Verify color contrast at key text/background boundaries

### Main Navigation Coverage

- Inventory every primary nav item in the app shell
- Click each primary nav item and verify it opens the expected destination
- Confirm destinations are not generic duplicates of one another
- Capture findings for placeholder, blank, or repeated screens
- For live app to Figma work, produce a canonical route/state inventory with screenshots and mark each destination as capture-ready, blocked, or placeholder

### End-to-End User Journey

- Walk through the primary user flow from entry to completion
- Verify no dead ends, broken states, or missing content
- Check loading states, empty states, and error recovery

## Gate

All testing scenarios relevant to the application pass. No CRITICAL or HIGH findings unresolved. For nav-driven work, main navigation coverage must explicitly PASS. For live app to Figma workflows, the result must include canonical route/state inventory and screenshots suitable for `generate_figma_design` capture. Issues found are fixed by @frontend.implementation and re-verified.

## User Input

The application to test: {{input}}
