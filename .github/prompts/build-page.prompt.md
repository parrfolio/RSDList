---
description: "Create a new page/route with layout, data loading, and error handling"
agent: "conductor.powder"
---

# Build a New Page

You are creating a new page/route in the React application.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** — Audit design system for reusable components
2. **@design.ux-engineer** — Validate CRUD completeness and flow standards
3. **@frontend.implementation** — Implement the page
4. **@frontend.accessibility** — Accessibility audit

## Page Requirements

Every page must include:

- **Route definition** with proper path and metadata
- **Loading state** (skeleton/spinner)
- **Error boundary** with user-friendly error display
- **Empty state** when no data
- **Permission check** (if behind auth)
- **Responsive layout** (320px minimum, no horizontal scroll)
- **Semantic HTML** landmarks (`main`, `nav`, `header`, `footer`)
- **Page title** (`<title>` tag, format: "Page - Section - App")
- **Skip link** to main content
- **Breadcrumbs** (if nested navigation)

## Instructions

1. Define the route with loader and error boundary
2. Audit existing components (frontend.design-system)
3. Implement page layout with proper landmarks
4. Add data fetching with TanStack Query
5. Implement all required states (loading, error, empty, success)
6. Add proper SEO meta tags
7. Verify CRUD completeness (design.ux-engineer)
8. Verify accessibility (frontend.accessibility)

## User Input

The page I need: {{input}}
