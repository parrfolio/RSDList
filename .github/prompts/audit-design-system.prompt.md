---
description: "Audit and sync Figma designs with codebase components and tokens"
agent: "conductor.powder"
---

# Audit Design System

You are auditing the design system to ensure Figma designs and codebase components are in sync.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** — Audit Figma + codebase component inventories
2. **@frontend.implementation** — Implement fixes for any inconsistencies
3. **@frontend.accessibility** — Accessibility audit of updated components

Before invoking @frontend.design-system, verify Figma MCP connectivity with `figma/whoami`. If it fails or the tools are not loaded, stop and ask the user to start the `figma` server from Command Palette (`Cmd+Shift+P` → `MCP: List Servers` → start `figma` → authenticate if prompted). Do not continue the audit without Figma when the audit scope includes Figma sync.

## Audit Scope

frontend.design-system produces a 7-section report:

1. **Figma Inventory** — Components, tokens, patterns from Figma (via the official Figma MCP)
2. **Code Inventory** — shadcn/ui components, Tailwind tokens, CSS variables in codebase
3. **Cross-Reference Map** — Figma component ↔ code component alignment
4. **Reuse Plan** — Which existing components to use for new features
5. **New Pattern Assessment** — Any patterns that need to be created
6. **Consistency Warnings** — Token drift, naming mismatches, style deviations
7. **Final Status** — PASS / FAIL / NEEDS NEW PATTERN

## Design System Standards

- **Colors**: Brand purple `#5900FF`, neutral scale, semantic colors via CSS variables
- **Typography**: DM Sans, 7-level type scale
- **Components**: shadcn/ui as base, customized per design system skill
- **Icons**: Lucide React, `currentColor` for fills
- **Spacing**: Tailwind v4 spacing scale
- **Dark mode**: All components must support dark mode

## Instructions

1. Invoke @frontend.design-system to produce the full audit report
2. If FAIL: create remediation tasks and invoke @frontend.implementation to fix
3. If NEEDS NEW PATTERN: present to user for approval before creating
4. Verify all components pass @frontend.accessibility accessibility audit

### Figma Sync Remediation

When the audit detects components that exist in code but not in Figma (or vice versa):

- **Code exists, no Figma** → @frontend.design-system creates matching Figma components using the official Figma MCP (`use_figma`, `generate_figma_design`)
- **Figma exists, no code** → Flag for @frontend.implementation to implement the missing code component
- **Both exist but diverged** → @frontend.design-system updates Figma to match code (code is source of truth for implementation)
- **Token drift** → @frontend.design-system syncs tokens from CSS custom properties to Figma using `use_figma`

### Storybook Coverage Verification

- **@frontend.storybook** — Verify Storybook coverage matches component inventory. Create missing stories for any components without Storybook documentation.

## User Input

{{input}}
