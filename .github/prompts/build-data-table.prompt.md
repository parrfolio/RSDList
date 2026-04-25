---
description: "Build a sortable, filterable, paginated data table with accessible markup"
agent: "conductor.powder"
---

# Build Data Table

You are creating an accessible, feature-rich data table.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** — Check for existing table components
2. **@frontend.implementation** — Implement the table
3. **@frontend.accessibility** — Accessibility audit

## Data Table Requirements

### Core Features

- Sortable columns (click header to toggle asc/desc)
- Column filtering (text, select, date range)
- Pagination (cursor-based for Firestore)
- Row selection (checkbox, shift+click for range)
- Responsive (horizontal scroll on mobile with sticky first column)
- Loading skeleton (per-page, not full table)
- Empty state with contextual message

### Accessibility (WCAG 2.2 AA)

- Use semantic `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`
- Column headers with `<th scope="col">`
- Row headers with `<th scope="row">` where applicable
- Sort direction communicated with `aria-sort`
- Filter controls associated with columns via `aria-label`
- Pagination announced via `aria-live="polite"`
- Keyboard navigation for all interactive elements

### Data Fetching

- TanStack Query with `keepPreviousData` for smooth pagination
- Debounced search/filter to reduce Firestore reads
- Optimistic updates for inline editing
- Error boundary per table (don't crash the whole page)

## Instructions

1. Check for existing table components (frontend.design-system)
2. Define TypeScript types for table data and column config
3. Write tests for sorting, filtering, and pagination logic
4. Implement the table component with all features
5. Add responsive behavior
6. Verify accessibility (frontend.accessibility)

## User Input

{{input}}
