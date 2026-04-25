---
description: "Fix accessibility issues identified in an audit or reported by users"
agent: "conductor.powder"
---

# Fix Accessibility Issues

You are remediating accessibility issues to achieve WCAG 2.2 AA compliance.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.implementation** — Implement accessibility fixes
2. **@frontend.accessibility** — Verify fixes pass (re-audit)

## Common Fix Patterns

### Missing Labels

```tsx
// Before (inaccessible)
<input type="text" placeholder="Search..." />

// After (accessible)
<label htmlFor="search">Search</label>
<input id="search" type="text" placeholder="Search..." />
```

### Missing Focus Indicators

```css
/* Ensure visible focus */
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

### Missing Skip Link

```tsx
<a href="#maincontent" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### Color Contrast Fixes

- Use design tokens (never hardcoded colors)
- Text on backgrounds: minimum 4.5:1 ratio
- Avoid alpha/opacity on text (contrast becomes background-dependent)

### ARIA Patterns

- Use native HTML elements first (button, not div with onClick)
- `aria-expanded` for collapsible sections
- `aria-live="polite"` for dynamic content updates
- `aria-describedby` for help text and error messages

## Instructions

1. Review the accessibility findings (from @frontend.accessibility audit or user report)
2. Prioritize by severity: CRITICAL → HIGH → MEDIUM → LOW
3. Fix each issue following WCAG success criteria
4. Use native HTML elements over ARIA whenever possible
5. Verify with @frontend.accessibility after all fixes

## User Input

The accessibility issues to fix: {{input}}
