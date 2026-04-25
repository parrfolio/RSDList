---
description: "Build a dashboard layout with data visualization, stats, and widgets"
agent: "conductor.powder"
---

# Build a Dashboard

You are creating a dashboard with data visualization, statistics, and interactive widgets.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** — Component reuse audit
2. **@design.ux-engineer** — CRUD completeness and flow standards
3. **@frontend.implementation** — Frontend implementation
4. **@engineering.implementation** — Backend data endpoints (if needed)
5. **@frontend.accessibility** — Accessibility audit
6. **@frontend.browsertesting** — Browser verification of dashboard and navigation coverage

## Dashboard Patterns

- **Layout**: Sidebar + main content area using CSS Grid/Flexbox
- **Stats cards**: Key metrics with trend indicators
- **Charts**: Use accessible, color-blind friendly palettes
- **Tables**: Sortable, filterable with proper `<th>` headers
- **Loading**: Skeleton screens per widget (not a single spinner)
- **Empty states**: Helpful messaging when no data
- **Responsive**: Stack widgets on mobile (320px minimum)
- **Real-time**: TanStack Query with polling or Firestore real-time features

## Instructions

1. Audit existing components (frontend.design-system)
2. Define data requirements and create TanStack Query hooks
3. Build layout grid with responsive breakpoints
4. Implement individual widgets with independent loading/error states
5. Add data visualization with accessible colors
6. Ensure all data tables use semantic `<table>` with `<th>` headers
7. Verify CRUD completeness and flow standards
8. For dashboard suites or nav-driven work, produce a Main Navigation Coverage Matrix covering each primary nav destination and its unique purpose
9. Verify accessibility
10. Run browser testing to click every primary nav destination and confirm each dashboard/screen is reachable and materially distinct

## User Input

The dashboard I need: {{input}}
