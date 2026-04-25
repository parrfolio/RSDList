---
description: "Convert a design (Figma frame, screenshot, or mock) into implementation-ready code with design system alignment"
agent: "conductor.powder"
---

# Design to Code (Design → React)

You are converting a design reference (Figma frame, screenshot, or mock image) into production React code aligned with the design system.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** with design-system skill — Extract Figma design details and map to existing components
2. **@design.visual-designer** with product-designer + design-system skills — Decompose the design into a pixel-precise Visual Implementation Spec with exact values, component mappings, and token mappings
3. **@frontend.implementation** with design-system skill — Implement the design following design.visual-designer's Visual Implementation Spec
4. **@frontend.accessibility** — Accessibility audit of the implementation

## Process

### Step 1: Design Analysis (frontend.design-system + conductor.powder)

**If Figma URL is provided:**

- Extract component structure from Figma via the official Figma MCP (`get_design_context`, `get_metadata`)
- Identify which Figma components map to existing code components
- Extract design tokens (colors, typography, spacing)
- Identify any NEW patterns not in the design system
- Produce a Reuse Plan

**If screenshot/image is provided (no Figma URL):**

- frontend.design-system audits the codebase for existing components and tokens (no Figma extraction)
- **conductor.powder produces a Visual Description** — a structured text analysis of the image capturing: layout structure, color palette (hex values), typography (fonts, sizes, weights), spacing patterns, visible components, interactive states, visual effects (shadows, radii, borders), and screen dimensions
- This Visual Description is passed to design.visual-designer in Step 2 since `runSubagent` cannot forward images
- frontend.design-system still produces a Reuse Plan from its codebase audit

### Step 2: Visual Spec Production (design.visual-designer)

- Receive frontend.design-system's Reuse Plan and either the Figma URL (Mode A) or conductor.powder's Visual Description (Mode C)
- Decompose the design into a design.visual-designer VISUAL SPEC with exact values for every visual property
- Map each mock element to existing components from the Reuse Plan
- Map all colors, spacing, typography, shadows, radii to design tokens (CSS custom properties)
- Flag any missing tokens or components that need to be created
- Inventory all interactive states shown or implied in the design
- Document responsive behavior at each breakpoint
- Produce implementation notes for frontend.implementation (gotchas, priority, tricky areas)

### Step 3: Implementation (frontend.implementation)

- Follow design.visual-designer's design.visual-designer VISUAL SPEC as the authoritative implementation reference
- Implement using the Reuse Plan (existing components first)
- Apply design tokens (CSS variables, Tailwind classes)
- Follow "clean authority" aesthetic

#### Design Fidelity Requirements

The design is the authoritative visual specification — implement it exactly:

- **Layout structure** — Replicate the design's flex, grid, or positioning approach. Preserve nesting depth, element ordering, and structural hierarchy as shown in Figma.
- **Spacing** — Match margins, padding, and gaps to the specific values from the design. Do not round, approximate, or substitute "close enough" token values.
- **Typography** — Match font family, size, weight, line-height, letter-spacing, and text-transform for every text element.
- **Colors** — Use design tokens to achieve the design's exact colors. If a token does not exist for a color shown in the design, flag it.
- **Sizing** — Match widths, heights, min/max constraints, and aspect ratios exactly as specified in the design.
- **Visual effects** — Reproduce border-radius, box-shadows, opacity, and any decorative treatments precisely.
- **Interactive states** — Implement ALL states shown in Figma: hover, focus, active, disabled, loading, error, empty, and selected. If a state is shown, it must be built.
- **Responsive behavior** — If the Figma design shows multiple breakpoints, implement each one. Do not implement only the desktop version.
- **No deviations** — Do not "interpret" or "improve" the design. Do not simplify layouts, substitute components, or adjust spacing for convenience.

**Before completing**: Compare each section of the implementation against the Figma design reference. Verify layout, spacing, typography, colors, sizing, effects, states, and responsive behavior match.

### Step 4: Verification (frontend.accessibility)

- WCAG 2.2 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Contrast ratios

## Rules

- NEVER create new components when existing ones can be reused
- NEVER use hardcoded colors — always design tokens
- ALWAYS implement dark mode variants
- ALWAYS add proper ARIA attributes
- If Figma design has accessibility issues, FIX them in code (don't replicate bad design)

## User Input

The Figma design to implement: {{input}}
