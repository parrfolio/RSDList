---
description: "Powder Visual Description Protocol v2 — mandatory 10-section format for relaying design mocks to subagents when images cannot be forwarded via runSubagent"
applyTo: "**"
---

# Powder Visual Description Protocol v2

> **Origin**: Extracted from `conductor.powder.agent.md`. This protocol is MANDATORY whenever conductor.powder must relay a design mock to design.visual-designer via `runSubagent` (images cannot be forwarded).

**The core principle: COMPOSE, DON'T INVENT.** The Visual Description must describe the mock entirely in terms of existing design system components with theme overrides. Powder is a translator, not a designer.

## Prerequisites

1. Powder MUST have frontend.design-system's Reuse Plan BEFORE writing the Visual Description
2. Powder must use the Reuse Plan's component inventory as the vocabulary for describing the mock
3. Every visual element in the mock must be mapped to an existing design system component — if no match exists, flag it as `NEEDS NEW COMPONENT` with a precise description of what's missing

## Visual Description Format (v2)

```text
POWDER VISUAL DESCRIPTION:

## 1. Component Tree (map every element to design system components)

Describe the layout as a hierarchical tree where every node is an existing design system component.
Use exact component names from the Reuse Plan (e.g., "Card", "Button", "Input", "Badge").
Include variant and prop values where visible (e.g., "Button variant=outline size=sm").

Example:
  └── Page Container
      ├── Header (flex, row, justify: space-between, h: ~64px)
      │   ├── Logo/Brand [describe what is shown]
      │   └── Nav (flex, row, gap: ~8px)
      │       ├── Button variant="ghost" — "Dashboard"
      │       ├── Button variant="ghost" — "Settings"
      │       └── Avatar (32px, circular)
      └── Main Content (grid, 3 columns, gap: ~24px)
          ├── Card (shadow-sm, rounded-lg)
          │   ├── CardHeader — [title text]
          │   └── CardContent — [describe content]
          ├── Card ...
          └── Card ...

## 2. Theme Overrides (ONLY differences from design system defaults)

List ONLY the visual properties that differ from the design system's current theme.
Do NOT re-describe default values. Focus on what makes this mock unique.

- Background: [hex value if different from --background]
- Card backgrounds: [hex value if different from --card]
- Primary accent color: [hex value if different from --primary]
- Border radius pattern: [value if different from defaults]
- Shadow pattern: [value if different from defaults]
- [any other deviations from the design system theme]

## 3. Typography Inventory (exact values per text element)

| Element | Content Sample | Font | Size | Weight | Color (hex) | Line-Height |
|---------|---------------|------|------|--------|-------------|-------------|
| Page title | "Dashboard" | [font] | [px] | [weight] | [#hex] | [px] |
| Card title | "Revenue" | [font] | [px] | [weight] | [#hex] | [px] |
| Body text | "Total users..." | [font] | [px] | [weight] | [#hex] | [px] |

## 4. Spacing & Dimensions (exact pixel values)

- Page padding: [top right bottom left]
- Card padding: [value]
- Gap between cards: [value]
- Header height: [value]
- Sidebar width (if present): [value]
- Content max-width: [value]
- [other key dimensions]

## 5. Visual Effects

- Card shadows: [exact shadow value]
- Border radii: [exact values per element type]
- Borders: [color, width, style per element]
- Gradients: [describe if present]
- Opacity treatments: [describe if present]

## 6. Colors (every unique color observed)

| Color (hex) | Where Used | Design System Token Match |
|-------------|-----------|---------------------------|
| #FFFFFF | page background | --background |
| #1E293B | heading text | --foreground |
| #3B82F6 | accent buttons | --primary (or OVERRIDE) |
| [etc.] | | |

## 7. Interactive States (only if visible in mock)

- [Element]: [state shown] — [describe visual treatment]

## 8. Responsive Hints

- Viewport appears to be: [mobile/tablet/desktop, approximate width]
- [Any responsive behavior visible]

## 9. Content & Data Shown

- [List all text, numbers, labels, placeholder data visible in the mock]
- [This helps sub-agents reproduce the exact mock, not invent new content]

## 10. NEEDS NEW COMPONENT (items with no design system match)

- [Description of element] — no existing component match in Reuse Plan
- [If none: "All mock elements map to existing design system components."]
```

## Anti-Invention Rules (MANDATORY)

1. **NEVER describe a UI element generically** when a design system component exists for it. Say "Card" not "a container with a shadow." Say "Badge variant=secondary" not "a small rounded label."
2. **NEVER invent component names** that don't exist in the Reuse Plan. If you can't find a match, list it in Section 10.
3. **NEVER add UI elements** that aren't visible in the mock. If the mock has 3 cards, describe 3 cards — not 4.
4. **NEVER describe aspirational UI** ("it would look good with..."). Describe ONLY what the mock shows.
5. **NEVER substitute simpler layouts** for complex ones. If the mock shows a 3-column grid with a sidebar, describe exactly that.
6. **NEVER change colors, spacing, or typography** from what the mock shows. If the mock uses #3B82F6, report #3B82F6 — don't round to the nearest design token.
7. **Theme overrides are the ONLY creative input** — identify how the mock's visual treatment differs from the design system defaults, so sub-agents know what to customize.
8. **Include sample content from the mock** — text labels, numbers, placeholder data. Sub-agents implementing without seeing the mock need this to avoid inventing different content.

## Quality Checklist (Powder must verify before sending)

- [ ] Every visible element in the mock is mapped to a design system component in Section 1
- [ ] Component names match the Reuse Plan exactly (not generic descriptions)
- [ ] All colors have hex values (not "blue", "dark", "muted")
- [ ] All spacing has pixel values (not "generous", "tight", "standard")
- [ ] All typography has exact font/size/weight/color (not "large heading")
- [ ] Theme overrides only describe differences from defaults (not a full re-spec)
- [ ] No invented UI elements — only what's visible in the mock
- [ ] Sample content/data from the mock is included
- [ ] NEEDS NEW COMPONENT section addresses any gaps
