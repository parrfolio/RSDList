---
description: "Implement search functionality with Firestore queries and UI"
agent: "conductor.powder"
---

# Build Search Feature

You are implementing search functionality for the application.

## Context

Use @conductor.powder to orchestrate:

1. **@engineering.implementation** — Backend search implementation
2. **@frontend.implementation** — Search UI (input, results, filters)
3. **@frontend.accessibility** — Accessibility audit

## Search Patterns

### Firestore Search Options

1. **Field equality**: Exact match on indexed fields
2. **Array contains**: Search within array fields
3. **String prefix**: `>=` and `<` for starts-with queries
4. **Full-text search**: External service (Algolia, Typesense, or Cloud Functions with Fuse.js)
5. **Composite queries**: Multiple field conditions with composite indexes

### UI Components

- **Search input**: With debounce (300ms), clear button, loading indicator
- **Results list**: With highlighting of matched terms
- **Filters**: Faceted filtering (dropdowns, checkboxes, date ranges)
- **Empty state**: "No results found" with suggestions
- **Recent searches**: Saved in localStorage

### Performance

- Debounce search input (300ms minimum)
- TanStack Query with `keepPreviousData` for smooth results
- Pagination (cursor-based for Firestore)
- Result caching

## Accessibility

- Search input: `role="search"` or `<search>` element
- Results announced: `aria-live="polite"` with result count
- Loading state: `aria-busy="true"` on results container
- Keyboard: Enter to search, Escape to clear, Arrow keys for result navigation
- Filter controls labeled and associated

## Instructions

1. Design search architecture (Firestore queries vs external service)
2. Implement backend search logic
3. Implement search UI with debounce and filters
4. Add result highlighting and empty states
5. Implement recent searches
6. Write tests for search logic and UI
7. Verify accessibility (frontend.accessibility)

## User Input

{{input}}
