---
description: "Design fidelity rules ensuring implementations match provided design mocks, Figma frames, and visual references exactly"
applyTo: "**/*.tsx, **/*.jsx, **/*.css, **/*.scss, **/*.html"
---

# Design Fidelity

Rules for ensuring UI implementations match provided design mocks, Figma frames, screenshots, and visual references with pixel-level precision.

## Core Principle

When a design mock, Figma frame, screenshot, or visual reference is provided, it is the **authoritative visual specification**. Implementations MUST match the design exactly. The design is not a suggestion, a starting point, or a rough guide — it is the contract.

## Compose from Design System, Theme to Match

The design mock defines WHAT the UI looks like. The design system defines HOW it's built. These are not in conflict — they work together:

1. **Use existing design system components** (shadcn/ui + Radix, project component library) as the building blocks for every element in the mock
2. **Apply theme overrides** (CSS custom properties, Tailwind utilities, or variant props) to make the design system components match the mock's specific visual treatment
3. **NEVER invent new component structures** when an existing design system component can be themed to match
4. **NEVER build from raw HTML/div soup** when a semantic design system component exists (Card, Button, Badge, Input, etc.)
5. **Flag genuine gaps** — if the mock contains an element that truly has no design system component match, flag it as NEEDS NEW COMPONENT rather than silently improvising

**Example of correct approach:**

- Mock shows a card with dark background, 12px radius, and custom shadow
- **DO:** Use `<Card>` from the design system, override background via `className` or CSS custom property, set `rounded-xl` and custom shadow
- **DON'T:** Build a `<div className="custom-dark-card">` from scratch

This principle applies at every level of the agent chain: conductor.powder's Visual Description, design.visual-designer's Visual Spec, and frontend.implementation's code.

## What "Match Exactly" Means

Every aspect of the provided design must be faithfully reproduced in code. This includes:

- **Layout structure** — Replicate the design's flex, grid, or positioning approach. Preserve nesting depth, element ordering, and structural hierarchy exactly as shown.
- **Spacing** — Match margins, padding, and gaps to the specific pixel or rem values visible in the design. Do not round, approximate, or substitute "close enough" values.
- **Typography** — Match font family, font size, font weight, line-height, letter-spacing, and text-transform for every text element. If the design uses a specific weight (e.g., 600), do not substitute another (e.g., 700).
- **Colors** — Match background colors, text colors, border colors, and shadow colors. Use design system tokens to achieve the design's exact colors. If a token does not exist for a color shown in the design, flag it.
- **Sizing** — Match widths, heights, min/max constraints, and aspect ratios. If the design shows a 48px avatar, implement a 48px avatar — not 40px or 56px.
- **Border radius, box shadows, opacity, and visual effects** — Reproduce these values precisely. A design with `border-radius: 12px` must not be implemented as `border-radius: 8px`.
- **Alignment and visual hierarchy** — Match text alignment (left, center, right), element ordering, and emphasis levels (bold headings, muted captions, accent highlights).
- **Interactive states** — Implement ALL states shown in the design: hover, focus, active, disabled, loading, error, empty, and selected. If a state is shown, it must be built.
- **Responsive layouts** — If the design shows multiple breakpoints, implement each one. Do not implement only the desktop version and hope mobile "works out."

## Design vs. Design System Token Conflicts

When a design mock specifies a value that differs from a design system token default:

1. **Flag the conflict explicitly** — Document the discrepancy (e.g., "Design shows 24px gap; `--spacing-md` is 16px").
2. **Prefer the design's specific value** — For the component or screen in question, use the value shown in the design.
3. **Recommend a token update if systematic** — If the design consistently uses a different value across multiple screens, recommend updating the token to match the design intent.
4. **NEVER silently deviate** — Do not quietly swap the design's value for a token default. The design is the spec; the token is a tool to achieve it.

## What Is NOT Allowed

- Do NOT "interpret" or "improve" the design — implement it as-is
- Do NOT simplify layouts (e.g., replacing a multi-column grid with a single column because it is easier to build)
- Do NOT substitute components (e.g., using a different button variant, card style, or icon than what the design shows)
- Do NOT adjust spacing or sizing for "cleanliness" or "consistency" without explicit approval from the designer or user
- Do NOT ignore elements in the design that appear decorative — implement them (decorative dividers, background patterns, accent shapes, illustrations)
- Do NOT add elements not present in the design without flagging the addition
- Do NOT reorder sections, cards, or navigation items differently from the design

## Visual Verification Checklist

Before considering any UI implementation complete, verify each item against the design reference:

- [ ] **Layout structure** — Flex/grid/positioning matches; nesting and ordering are correct
- [ ] **Spacing** — Margins, padding, and gaps match the design values
- [ ] **Typography** — Font family, size, weight, line-height, letter-spacing, and text-transform match
- [ ] **Colors** — Backgrounds, text, borders, and shadows match (mapped to design tokens where possible)
- [ ] **Sizing** — Widths, heights, min/max constraints, and aspect ratios match
- [ ] **Border radius, shadows, and effects** — Visual treatments match exactly
- [ ] **Interactive states** — All states shown in the design are implemented and verified
- [ ] **Responsive behavior** — All breakpoints shown in the design are implemented
- [ ] **Visual hierarchy** — Emphasis, alignment, and element ordering match the design
- [ ] **No additions or omissions** — Nothing was added or removed that the design does not show

## When No Design Is Provided

These fidelity rules activate only when a visual reference IS provided. When no design mock, Figma frame, or screenshot accompanies the task:

- Follow design system tokens and their documented defaults
- Reuse existing patterns and component configurations from the codebase
- Apply component library defaults (themed variants, standard spacing)
- Maintain consistency with previously approved screens

## Flagging Discrepancies

If a design cannot be implemented exactly, the agent MUST:

1. **Flag the specific discrepancy** — Identify precisely what cannot be matched (e.g., "The design uses a font not available in the project" or "The design shows a 5-column grid that breaks below 400px").
2. **Explain why it cannot be matched** — Provide the technical reason (missing asset, browser limitation, accessibility conflict, performance concern).
3. **Propose the closest achievable alternative** — Offer a concrete solution that minimizes visual deviation.
4. **Wait for approval** — Do NOT proceed with the alternative until the user or designer confirms it is acceptable.
