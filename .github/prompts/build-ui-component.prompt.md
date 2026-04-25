---
description: "Build a new UI component following design system patterns with TDD"
agent: "conductor.powder"
---

# Build UI Component

You are creating a new React UI component following the project design system and TDD practices.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** audits the design system first — checks for existing components to reuse
2. **@design.visual-designer** decomposes any provided mock into a Visual Implementation Spec with exact values and component mappings
3. **@frontend.implementation** implements the component following design.visual-designer's Visual Spec and frontend.design-system's Reuse Plan
4. **@quality.code-review** reviews the code
5. **@frontend.accessibility** audits accessibility (WCAG 2.1/2.2 AA)

## Design System Rules

- Built on **shadcn/ui** + **Tailwind CSS v4** + **React**
- Brand color: `#5900FF` (purple accent)
- Typography: DM Sans, 7-level scale
- "Clean authority" aesthetic — generous whitespace, restrained accent, flat with depth hints
- NO gradients on buttons, NO emojis in UI, NO floating labels
- Use `currentColor` for SVG icons (Lucide React)
- All interactive elements must be keyboard accessible

## Instructions

1. Check if a similar component already exists (frontend.design-system audit)
2. Write component tests first (Vitest + React Testing Library)
3. Implement the component with:
   - TypeScript strict types
   - Proper ARIA attributes
   - Responsive design (mobile-first)
   - Loading, empty, and error states
   - Dark mode support
4. Verify accessibility (frontend.accessibility gate)
5. @frontend.storybook writes a Storybook story with all variants, states, and interactive controls (Storybook is mandatory — if not configured, set it up first)
6. @frontend.design-system creates a matching Figma component via the official Figma MCP (`use_figma`)

## User Input

The component I need: {{input}}
