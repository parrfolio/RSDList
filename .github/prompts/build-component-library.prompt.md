---
description: "Build a reusable component library with Storybook, tokens, and documentation"
agent: "conductor.powder"
---

# Build Component Library

You are creating a reusable UI component library with proper documentation and testing.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** — Define component inventory and design tokens
2. **@design.visual-designer** — Decompose any provided design reference into Visual Implementation Specs with exact values
3. **@frontend.implementation** — Implement components with TDD, following design.visual-designer's Visual Specs
4. **@frontend.accessibility** — Accessibility audit each component
5. **@frontend.design-system** — Create matching Figma components via the official Figma MCP for every code component
6. **@frontend.storybook** — Write Storybook stories for every component (replaces ad-hoc Storybook delegation)

## Component Library Standards

Based on the design-system skill:

- **Base**: shadcn/ui + Tailwind CSS v4 + React
- **Aesthetic**: "Clean authority" — generous whitespace, restrained accent, flat with depth hints
- **Tokens**: CSS custom properties for colors, spacing, typography, shadows, radii
- **States**: Every component handles loading, disabled, error, active, focus, hover
- **Accessibility**: WCAG 2.2 AA compliance on every component
- **Testing**: Vitest + React Testing Library for each component
- **Documentation**: Storybook stories with controls and accessibility addon

## Anti-Patterns (NEVER do these)

- No gradients on buttons
- No emojis in UI elements
- No floating labels (labels must be visible and persistent)
- No `bg-white` for invertible surfaces (use semantic tokens)
- No hardcoded colors (use design tokens)

## Instructions

1. Define the component inventory (frontend.design-system audit)
2. Create design token CSS variables (colors, typography, spacing, shadows)
3. For each component:
   - Write tests first
   - Implement with proper TypeScript types and ARIA attributes
   - Create Storybook story with all variants
   - Every component MUST have a corresponding Storybook story (via @frontend.storybook) AND a matching Figma component (via @frontend.design-system)
   - Verify accessibility (frontend.accessibility)
4. Create component documentation (usage, props, examples)

## User Input

{{input}}
