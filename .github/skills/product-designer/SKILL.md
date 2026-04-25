---
name: product-designer
description: >
  Expert product design covering UI/UX design, design systems, prototyping,
  and design thinking. Produces design artifacts (wireframes, flows, token
  systems, component specs) — NOT production code. Use when the user needs
  component specifications, interaction flows, wireframes, or design token
  proposals.
version: 2.0.0
category: product-design
tags: [design, ux, ui, figma, prototyping, design-systems, component-specs]
agents:
  [
    "frontend.implementation",
    "design.ux-engineer",
    "frontend.design-system",
    "design.visual-designer",
  ]
---

## Product Designer

Design artifact creation for digital products. This skill produces structured
design deliverables — it does NOT generate production code.

## Scope Rules

**This skill covers:** wireframes, user flows, design token proposals,
component specifications, interaction patterns, prototype planning.

**This skill does NOT cover:**

- Production code → defer to frontend.implementation or implementation agents
- User research, personas, journey maps → use **ux-researcher-designer**
- Figma file manipulation → use the **official Figma MCP** (`figma/get_design_context`, `figma/get_screenshot`, etc.)
- Specific token values (colors, spacing, type scale) → defer to **design-system**

## Design Token Mandate

**NEVER** invent new color values, spacing scales, or typography sizes.
ALL token values MUST come from the project's **design-system** skill.

- Font: DM Sans (per design-system)
- Brand accent: #5900FF (per design-system)
- Component library: shadcn/ui (per design-system)
- CSS framework: Tailwind v4 with @theme (per design-system)

If a design deliverable requires a token that does not exist in design-system:

1. **MUST** flag it explicitly: "Proposed token: `--color-warning-muted` — not in current design-system"
2. **MUST** provide the proposed value with rationale
3. **MUST NOT** silently use an ad-hoc value

## Deliverable Formats

### Wireframes

- **Low-fi** → ASCII art in markdown. State: "Fidelity: Low"
- **Mid/High-fi** → Produce via official Figma MCP. State fidelity level

### Component Specifications

Every component spec MUST include ALL of the following sections:

**Usage** — When and why to use this component.

**Variants** — Each visual/behavioral variant with description.

**States** — Default, hover, active, focus, disabled, loading (minimum).

**Anatomy** — Named sub-elements (label, icon, container, etc.).

**Do's and Don'ts:**

- Do's: 3+ concrete usage guidelines
- Don'ts: 3+ concrete misuse warnings

**Accessibility (NON-NEGOTIABLE):**

- Contrast ratios (text ≥ 4.5:1, large text ≥ 3:1)
- Keyboard behavior (tab order, arrow keys if composite)
- ARIA roles and properties
- Focus management (visible focus, no traps)
- Touch targets ≥ 44x44px
- Follow a11y.instructions.md

### Design Token Proposals

- MUST match project's existing token structure (Tailwind v4 @theme format)
- MUST reference design-system as authority
- MUST be importable — no orphan values

## Prototype Fidelity Levels

| Fidelity | Purpose              | Tool              | Timeframe  |
| -------- | -------------------- | ----------------- | ---------- |
| Low-fi   | Flow validation      | ASCII / markdown  | Minutes    |
| Mid-fi   | Usability testing    | Figma (via pilot) | Hours–Days |
| High-fi  | Dev handoff, UA test | Figma (via pilot) | Days       |

ALWAYS state the fidelity level at the top of any wireframe or prototype
deliverable.

## Usability Test Planning

When creating a test plan, MUST include:

- Objectives (what you're validating)
- Participant criteria (count, segments, inclusion/exclusion)
- Task list with success criteria per task
- Metrics: task completion rate, time on task, error rate, SUS score
- Materials checklist: prototype link, consent form, compensation

For full research methodology, test scripts, and synthesis → defer to
**ux-researcher-designer**.

## Anti-Patterns

| Anti-Pattern                                 | Why It's Wrong                  | Do This Instead                        |
| -------------------------------------------- | ------------------------------- | -------------------------------------- |
| Jumping to high-fi before problem definition | Wastes effort on wrong solution | Start with problem statement + low-fi  |
| Inventing a color palette                    | Conflicts with design-system    | Use existing tokens; propose additions |
| Styled text descriptions as "design"         | Not a structured deliverable    | Produce wireframes, specs, or flows    |
| Referencing scripts that don't exist         | Breaks agent trust              | Only reference real, verified tools    |
| Component spec without accessibility         | Violates a11y.instructions.md   | Accessibility section is mandatory     |
| Skipping states (hover, focus, disabled)     | Incomplete spec                 | Document ALL interactive states        |

## Integration Points

| Direction     | Agent / Skill           | What Flows                                |
| ------------- | ----------------------- | ----------------------------------------- |
| Receives from | ux-researcher-designer  | Research findings, personas, journey maps |
| Receives from | value-realization       | Product viability assessment              |
| Feeds into    | frontend.implementation | Component specs for implementation        |
| Feeds into    | official Figma MCP      | Wireframes/prototypes for Figma execution |
| Defers to     | design-system           | ALL specific token values                 |
| Defers to     | a11y.instructions.md    | Accessibility requirements                |

## Component Documentation Template

Use this structure for every component spec:

```markdown
## [Component Name]

[One-line purpose statement.]

### Usage

- [When to use]
- [When NOT to use — suggest alternative]

### Variants

| Variant   | Description | Use Case           |
| --------- | ----------- | ------------------ |
| Primary   | ...         | Main actions       |
| Secondary | ...         | Supporting actions |

### States

Default, Hover, Active, Focus, Disabled, Loading

### Anatomy

- Container
- Label
- Icon (optional)
- [Additional sub-elements]

### Do's

- [Concrete guideline]
- [Concrete guideline]
- [Concrete guideline]

### Don'ts

- [Concrete anti-pattern]
- [Concrete anti-pattern]
- [Concrete anti-pattern]

### Accessibility

- **Contrast**: [ratios]
- **Keyboard**: [tab/arrow behavior]
- **ARIA**: [roles, labels, properties]
- **Focus**: [management approach]
- **Touch target**: ≥ 44x44px
```
