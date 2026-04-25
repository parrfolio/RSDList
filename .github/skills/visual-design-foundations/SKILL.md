---
name: visual-design-foundations
description: Apply typography, color theory, spacing systems, and iconography principles to create cohesive visual designs. Use when establishing design tokens, building style guides, or improving visual hierarchy and consistency.
agents:
  [
    "design.visual-designer",
    "frontend.implementation",
    "frontend.design-system",
    "design.ux-engineer",
  ]
---

# Visual Design Foundations

Principles of visual design — rhythm, hierarchy, contrast, proximity, and alignment — for building cohesive, accessible interfaces. Defers to **design-system** for all specific token values (colors, type scale, spacing, fonts).

## When to Use This Skill

- Applying visual hierarchy and rhythm to layouts
- Evaluating or improving typographic hierarchy
- Auditing color contrast and accessibility
- Designing icon systems and visual assets
- Assessing spacing consistency and alignment
- Reviewing designs for visual coherence

## Constraints

- **NEVER** define ad-hoc color values. Use design-system tokens exclusively.
- **NEVER** specify fonts — defer to design-system for the project font stack.
- **NEVER** use `tailwind.config.js` or v3 configuration syntax. Tailwind v4 uses CSS-first `@theme`.
- Typography hierarchy **MUST** maintain minimum 1.2× scale ratio between adjacent heading levels.
- Spacing **MUST** use the project's spacing scale (multiples of 4px / 0.25rem). No arbitrary pixel values.
- Color usage **MUST** meet WCAG 2.2 AA contrast minimums (see table below).
- Interactive states (hover, focus, active, disabled) **MUST** maintain contrast requirements.
- **ALWAYS** use semantic token names (`bg-primary`, `text-muted-foreground`) rather than raw values.

## Core Principles

### Hierarchy

Establish clear visual importance through size, weight, color, and position.

- Use size and weight differences — not just color — to distinguish heading levels
- Limit emphasis: if everything is bold, nothing is bold
- Group related content visually; separate unrelated content with whitespace

### Rhythm and Repetition

Consistent spacing and sizing create predictable patterns that reduce cognitive load.

- Use a constrained spacing scale — never invent arbitrary values
- Maintain consistent vertical rhythm between sections
- Repeat visual patterns (card layouts, list items) to establish expectations

### Contrast

Differences in color, size, weight, or whitespace draw attention and create emphasis.

- Pair high-contrast elements (headings) with low-contrast elements (body text) for balance
- Reserve maximum contrast for primary actions and critical information
- Test designs in grayscale to verify hierarchy works without color

### Proximity

Elements placed near each other are perceived as related. Distance implies separation.

- Keep labels adjacent to their fields
- Use tighter spacing within groups, wider spacing between groups
- Whitespace is a design element — use it intentionally

### Alignment

Consistent alignment creates order and reduces visual noise.

- Align elements to a grid — avoid centering everything
- Left-align body text for readability (LTR languages)
- Maintain consistent alignment across repeated patterns (cards, list rows)

## Typography Principles

### Scale Ratio

Adjacent heading levels MUST differ by at least 1.2× to create clear hierarchy. Common ratios:

| Ratio | Name             | Use Case                |
| ----- | ---------------- | ----------------------- |
| 1.200 | Minor Third      | Compact UIs, dashboards |
| 1.250 | Major Third      | General purpose         |
| 1.333 | Perfect Fourth   | Content-heavy sites     |
| 1.414 | Augmented Fourth | Expressive marketing    |

### Line Height Guidelines

| Text Type | Line Height | Rationale                    |
| --------- | ----------- | ---------------------------- |
| Headings  | 1.1–1.3     | Tight leading for large text |
| Body text | 1.5–1.7     | Readable line spacing        |
| UI labels | 1.2–1.4     | Compact but legible          |

### Font Pairing Principles

- **Contrast**: Pair a serif with a sans-serif, or geometric with humanist
- **Limit families**: Two typefaces maximum (one heading, one body)
- **Weight range**: Use 2–3 weights per family to avoid visual clutter
- **x-height**: Pair fonts with similar x-heights for optical harmony

### Responsive Typography

```css
/* Fluid typography using clamp() — scales smoothly between breakpoints */
h1 {
  font-size: clamp(2rem, 5vw + 1rem, 3.5rem);
  line-height: 1.1;
}

p {
  font-size: clamp(1rem, 2vw + 0.5rem, 1.125rem);
  line-height: 1.6;
  max-width: 65ch; /* Optimal reading width */
}
```

## Color Theory

### Contrast Requirements (WCAG 2.2)

| Element                         | Minimum Ratio | Level |
| ------------------------------- | ------------- | ----- |
| Body text                       | 4.5:1         | AA    |
| Large text (18px+ / 14px+ bold) | 3:1           | AA    |
| UI components and borders       | 3:1           | AA    |
| Enhanced body text              | 7:1           | AAA   |

### Principles

- Build palettes from a single hue, then add semantic variations (success, warning, error)
- Test every foreground/background pair — do not assume a palette is accessible
- Dark mode is not inverted light mode; re-evaluate contrast for every token pair
- Do not rely on color alone to convey meaning; always pair with text, icons, or patterns

## Spacing Principles

- Use a **4px / 0.25rem base unit** — all spacing values MUST be multiples of this base
- Tighter spacing within components, wider spacing between components
- Section gaps should be noticeably larger than element gaps (2×–4× minimum)
- Consistent padding within similar component types (all cards, all form fields)

## Iconography

### Sizing System

Icons MUST use a constrained size scale aligned to the spacing system:

| Size | Pixels | Use Case                         |
| ---- | ------ | -------------------------------- |
| xs   | 12px   | Inline indicators                |
| sm   | 16px   | Form field icons, badges         |
| md   | 20px   | Default UI icons                 |
| lg   | 24px   | Navigation, primary actions      |
| xl   | 32px   | Feature highlights, empty states |

### Icon Principles

- Use `currentColor` for fills and strokes — icons inherit text color automatically
- Decorative icons MUST use `aria-hidden="true"`
- Informative icons MUST have an accessible label (`aria-label` or adjacent text)
- Maintain consistent stroke width across the icon set
- Align icon optical weight with adjacent text weight

## Best Practices

1. **Establish constraints** — limit choices to maintain consistency
2. **Document decisions** — create a living style guide
3. **Test accessibility** — verify contrast, sizing, touch targets
4. **Use semantic tokens** — name by purpose, not appearance
5. **Design mobile-first** — start with constraints, add complexity
6. **Maintain vertical rhythm** — consistent spacing creates harmony

## Common Issues

- **Inconsistent spacing** — not using a defined scale
- **Poor contrast** — failing WCAG requirements
- **Font overload** — too many families or weights
- **Magic numbers** — arbitrary values instead of tokens
- **Missing states** — forgetting hover, focus, disabled
- **No dark mode plan** — retrofitting is harder than planning

## Resources

- [Type Scale Calculator](https://typescale.com/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Radix Colors](https://www.radix-ui.com/colors)
- [Material Design Color System](https://m3.material.io/styles/color/overview)
