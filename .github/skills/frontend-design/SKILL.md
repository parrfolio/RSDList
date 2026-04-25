---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
agents:
  [
    "design.visual-designer",
    "frontend.implementation",
    "frontend.marketing-site",
    "design.ux-engineer",
  ]
---

## Authority Hierarchy

For specific token values (colors, fonts, spacing, shadows), the **design-system** skill is the single source of truth. This skill defines frontend AESTHETICS philosophy — not specific values.

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:

- **Typography**: The project’s font stack is defined in the design-system skill and is non-negotiable. Creative font expression applies only when design-system explicitly allows font variation (e.g., marketing pages with designer approval). Within the approved font stack, focus on hierarchy, weight contrast, and rhythm to create distinctive typography.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (predictable gradients, washed-out pastels), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character. Note: the project brand color from design-system is always acceptable — avoid cliches in HOW you use colors, not which brand colors you use.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different typographic expressions, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

## Non-Negotiable Constraints

These constraints are mandatory for ALL frontend work, regardless of aesthetic direction:

- **MUST** use shadcn/ui as the component foundation — customize styling, don’t replace components
- **MUST** check design-system tokens before defining any visual value (colors, fonts, spacing, shadows)
- **MUST** use the project’s approved font stack from design-system — typographic creativity is expressed through hierarchy, weight, and rhythm, not font selection
- **NEVER** generate generic placeholder content (“Lorem ipsum”, stock photo descriptions) — create contextually appropriate content
- **NEVER** invent colors for primary, secondary, or neutral palettes — these come from design-system
- Color creativity is expressed through ACCENT and DECORATIVE elements only — primary/secondary/neutral colors come from design-system
- Background effects (gradients, textures, patterns) must harmonize with design-system color tokens
- Component structure comes from shadcn/ui; aesthetic personality comes from how you style and compose those components

## Design-System Token Priority

When building any interface, resolve values in this order:

1. **design-system tokens** — always check first for colors, fonts, spacing, shadows, border-radius
2. **shadcn/ui defaults** — use component defaults that align with design-system
3. **Creative expression** — only for accent colors, decorative elements, animations, and layout composition

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
