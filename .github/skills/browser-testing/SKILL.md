---
name: Browser Agent Testing
description: >
  Automated UI testing methodology using VS Code's integrated browser agent tools.
  Covers form validation, responsive layout verification, authentication flow testing,
  interactive functionality testing, accessibility audits, and end-to-end user journeys.
agents:
  ["frontend.browsertesting", "frontend.implementation", "quality.code-review"]
tags:
  [
    browser-testing,
    ui-testing,
    e2e,
    responsive,
    forms,
    accessibility,
    playwright,
    automation,
  ]
---

# Browser Agent Testing

A systematic methodology for testing web applications using VS Code's integrated browser agent tools. The agent opens the app in a real browser, interacts with it, takes screenshots, and reports findings — all without manual intervention.

## Prerequisites

1. **VS Code** with GitHub Copilot
2. **Browser tools enabled**: Set `workbench.browser.enableChatTools` to `true` in VS Code settings
3. **Application running locally** on `localhost` (e.g., via `pnpm dev`, `npm run dev`)

## Available Browser Tools

| Tool                | Purpose                                    | Usage Pattern                                               |
| ------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| `openBrowserPage`   | Open a URL in the integrated browser       | Always the first step — opens the app                       |
| `navigatePage`      | Navigate to a different URL                | Moving between routes during testing                        |
| `readPage`          | Read page content and DOM structure        | Verify content, find elements, check structure              |
| `screenshotPage`    | Capture screenshot at current viewport     | Visual verification, responsive testing evidence            |
| `clickElement`      | Click buttons, links, interactive elements | Form submission, navigation, interactions                   |
| `hoverElement`      | Hover over elements                        | Tooltips, dropdown menus, hover states                      |
| `dragElement`       | Drag elements on the page                  | Drag-and-drop interface testing                             |
| `typeInPage`        | Type text into input fields                | Form testing, search functionality                          |
| `handleDialog`      | Interact with browser dialogs              | Alert, confirm, and prompt dialog handling                  |
| `runPlaywrightCode` | Execute custom Playwright automation       | Complex scenarios, viewport resizing, multi-step automation |

## Testing Scenarios

### 1. Form Validation Testing

Test all forms in the application to verify validation rules, error messages, and successful submission.

**Systematic approach:**

```text
1. Navigate to the form page
2. Submit with all required fields empty
   → Verify: error messages appear for each required field
   → Verify: error messages describe the issue clearly
   → Verify: focus moves to the first invalid field
3. Enter invalid data one field at a time
   → Email: "not-an-email" → verify email format error
   → Password: "ab" → verify minimum length error
   → Phone: "abc" → verify format error
4. Enter valid data in all fields and submit
   → Verify: success message or redirect occurs
   → Verify: no console errors
5. Check accessibility of form errors
   → Verify: aria-invalid="true" on invalid fields
   → Verify: error messages linked via aria-describedby
   → Verify: required fields have aria-required="true"
```

**Common validation patterns to test:**

- Required field validation (empty submission)
- Email format validation
- Password strength rules
- Phone/number format validation
- Date range validation
- File upload type/size restrictions
- Character limits (min/max length)
- Cross-field validation (password confirmation)

### 2. Responsive Layout Verification

Test the application at multiple viewport sizes to verify responsive behavior.

**Breakpoint checklist:**

| Width  | Device Category                  | Key Checks                                                            |
| ------ | -------------------------------- | --------------------------------------------------------------------- |
| 320px  | Mobile (small)                   | Content stacks vertically, no horizontal scroll, touch targets ≥ 44px |
| 375px  | Mobile (standard)                | Same as 320px, common iPhone size                                     |
| 768px  | Tablet                           | Navigation may collapse, grid layouts adjust, sidebars may hide       |
| 1024px | Tablet landscape / small desktop | Full navigation may appear, multi-column layouts                      |
| 1440px | Desktop                          | Full layout, maximum content width, all features visible              |

**Using `runPlaywrightCode` for viewport resizing:**

```javascript
// Set viewport to mobile width
await page.setViewportSize({ width: 320, height: 568 });
// Wait for layout to settle
await page.waitForTimeout(500);
```

**What to verify at each breakpoint:**

- Navigation: hamburger menu appears/disappears correctly
- Content: text wraps, images resize, no overflow
- Scrolling: only vertical scrolling (no horizontal)
- Text: remains readable (not too small, not cut off)
- Interactive elements: buttons/links are large enough to tap on mobile
- Modals/overlays: fit within the viewport
- Tables: scroll or reflow for narrow screens

### 3. Authentication Flow Testing

Test all authentication-related user flows end-to-end.

**Login flow:**

```text
1. Navigate to /login
2. Submit empty form → verify "required" errors
3. Enter invalid email → verify format error
4. Enter valid email + wrong password → verify auth error message
   → Verify: error does NOT reveal whether the email exists
5. Enter valid credentials → verify redirect to dashboard/home
6. Verify: user info appears in UI (name, avatar, etc.)
```

**Logout flow:**

```text
1. Click logout button/link
2. Verify: redirect to login page or landing page
3. Try to access a protected route → verify redirect to login
```

**Registration flow:**

```text
1. Navigate to /signup or /register
2. Submit empty form → verify errors
3. Enter existing email → verify "already exists" error
4. Fill all fields correctly → verify account creation + redirect
```

**Password reset flow:**

```text
1. Click "Forgot password" link
2. Enter email → verify confirmation message
3. Verify: no information leakage (same message for existing/non-existing emails)
```

### 4. Interactive Functionality Testing

Test all interactive UI elements for correct behavior and state management.

**Navigation testing:**

```text
1. Click each navigation item → verify correct route loads
2. Verify: active state highlights the current route
3. Verify: browser URL updates correctly
4. Test browser back/forward buttons
```

**Modal/dialog testing:**

```text
1. Open modal via trigger button → verify modal appears
2. Verify: focus moves to the modal
3. Press Escape → verify modal closes
4. Click backdrop → verify modal closes (if expected)
5. Verify: focus returns to the trigger element after close
```

**Dropdown/combobox testing:**

```text
1. Click dropdown trigger → verify options appear
2. Select an option → verify value updates
3. Verify: keyboard navigation works (Up/Down arrows, Enter to select)
4. Click outside → verify dropdown closes
```

**Toggle/switch testing:**

```text
1. Click toggle → verify state changes
2. Verify: visual state matches data state
3. Verify: associated content/behavior updates
```

**Tab/tabbed interface testing:**

```text
1. Click each tab → verify correct panel shows
2. Verify: only one panel visible at a time
3. Verify: keyboard navigation (Left/Right arrows)
```

### 5. Accessibility Audits (Browser-Based)

Use the browser tools to verify accessibility in the live rendered application.

**Structure and semantics:**

```text
1. Read page → verify landmarks: header, nav, main, footer
2. Check heading hierarchy: one h1, no skipped levels
3. Verify: descriptive <title> tag
4. Check: all lists use <ul>/<ol>/<li>, not styled divs
```

**Keyboard navigation:**

```text
1. Tab through all interactive elements
   → Verify: logical tab order (left-to-right, top-to-bottom)
   → Verify: no elements are skipped
   → Verify: no keyboard traps (can always Tab away)
2. Verify: visible focus indicator on each focused element
3. Test: Escape closes modals/dropdowns/menus
4. Test: Enter/Space activates buttons and links
5. Verify: skip link present as first focusable element
```

**Images and graphics:**

```text
1. Read page → find all <img> elements
2. Verify: informative images have meaningful alt text
3. Verify: decorative images have alt="" or aria-hidden="true"
4. Verify: SVG icons have appropriate accessible names
```

**Color and contrast:**

```text
1. Screenshot the page
2. Check text contrast against backgrounds (4.5:1 for normal, 3:1 for large)
3. Verify: information is not conveyed by color alone
4. Check: focus indicators have 3:1 contrast against adjacent colors
```

**Forms (accessibility-specific):**

```text
1. Verify: every input has a visible, persistent label
2. Verify: labels are programmatically associated (for="id")
3. Verify: required fields indicated visually AND with aria-required
4. Verify: error messages linked via aria-describedby
5. Verify: invalid fields have aria-invalid="true"
```

### 6. End-to-End User Journeys

Walk through complete user flows as a real user would.

**Primary user journey template:**

```text
1. Land on the entry point (marketing page or login)
2. Navigate to sign up / log in
3. Complete onboarding (if applicable)
4. Perform the primary user action:
   - Create new content/item
   - Edit existing content
   - View/browse content
5. Perform a secondary action:
   - Search/filter
   - Export/share
   - Update settings
6. Log out
7. Verify: no dead ends, broken states, or lost data
```

**What to watch for:**

- Loading states: do they appear during async operations?
- Empty states: what does the user see with no data?
- Error recovery: if something fails, can the user retry?
- Navigation breadcrumbs: can the user always find their way back?
- Data persistence: do changes survive page navigation?

## Report Format

Every testing session produces a structured report:

```
frontend.browsertesting BROWSER TEST REPORT
Status: PASS | FAIL | NEEDS_REMEDIATION
Scope: [pages/routes tested]

SUMMARY:
- Scenarios executed: [count]
- Passed: [count]
- Failed: [count]
- Warnings: [count]

FINDINGS:
- ID: BT-001
- Severity: CRITICAL | HIGH | MEDIUM | LOW
- Category: [category]
- Page/Route: [URL]
- Description: [what was found]
- Expected: [expected behavior]
- Actual: [actual behavior]
- Recommendation: [how to fix]
```

## Integration with Other Agents

- **frontend.implementation** fixes issues found by this agent
- **frontend.accessibility** performs deeper WCAG audits when browser testing flags a11y concerns
- **quality.code-review** may invoke this agent to verify implementations in the live browser
- **conductor.powder** orchestrates this agent as a gate after implementation phases

## Notes

- Browser agent tools are experimental in VS Code — behavior may change in future releases
- Pages opened by the agent run in private, isolated sessions (no shared cookies/storage)
- For authentication testing, the agent may need test credentials provided in the prompt
- Always start the dev server before invoking this agent
