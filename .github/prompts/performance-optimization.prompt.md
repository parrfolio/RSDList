---
description: "Analyze and improve application performance (frontend and backend)"
agent: "conductor.powder"
---

# Performance Optimization

You are analyzing and optimizing application performance.

Append `--auto` to the user request when you want Powder to keep applying non-blocking optimization feedback without stopping between advisory reviews. Powder records the optimization loop in `plans/powder-active-task-plan.md`.

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.exploration** — Explore codebase for performance-sensitive areas
2. **@architecture.context** — Research optimization strategies
3. **@engineering.implementation** — Implement backend optimizations
4. **@frontend.implementation** — Implement frontend optimizations
5. **@quality.code-review** — Review changes for correctness

## Frontend Performance

### React Optimization

- `React.memo()` for expensive pure components
- `useMemo()` / `useCallback()` for expensive computations and stable references
- Code splitting with `React.lazy()` + `Suspense`
- Virtual scrolling for large lists
- Image optimization (lazy loading, responsive images, WebP)
- Bundle size analysis and tree shaking

### Network Optimization

- TanStack Query caching and deduplication
- Firestore query optimization (indexes, query limits)
- Prefetching for anticipated navigation
- Service worker for offline/caching

### Rendering Optimization

- Avoid layout thrashing (batch DOM reads/writes)
- Animate only `transform` and `opacity`
- Use `content-visibility: auto` for off-screen content
- Debounce/throttle event handlers

## Backend Performance

### Firestore Optimization

- Composite indexes for complex queries
- Denormalize data to reduce query counts
- Use collection group queries sparingly
- Batch writes for related updates
- Pagination with cursor-based queries

### Cloud Functions Optimization

- Cold start reduction (minimize dependencies, use lazy loading)
- Connection pooling for external services
- Efficient data serialization
- Parallel execution where possible

## Instructions

1. Identify performance bottlenecks (architecture.exploration exploration + profiling data)
2. Prioritize by user impact (perceived speed matters most)
3. Implement optimizations with before/after metrics
4. Write tests to prevent performance regressions
5. Review changes (quality.code-review)
6. Document optimizations and their impact

## User Input

{{input}}
