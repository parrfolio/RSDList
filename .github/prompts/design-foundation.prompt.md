---
description: "Establish visual identity, design system theme, UI mocks, and marketing/landing experience before building features"
agent: "conductor.powder"
---

# Design Foundation

You are establishing the visual identity and UI foundation for an application. No features are built yet — this step sets the tone for everything that follows. The goal is to answer: **What does this product look and feel like?** before writing any feature code.

## Why This Step Matters

Every great product has a visual personality that users feel before they think. Skipping this step leads to:

- Inconsistent UI that gets reworked repeatedly
- Features that "look done" but feel like different apps stitched together
- No marketing presence (users can't discover or understand the product)
- Design debt that compounds with every feature added

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** with design-system skill — Establish design tokens, component baseline, and theme
2. **@design.visual-designer** with product-designer + design-system skills — Decompose any provided mocks into Visual Implementation Specs with exact values, component mappings, and token mappings
3. **@frontend.implementation** with design-system + product-designer skills — Build the visual foundation following design.visual-designer's specs (mocks, marketing page, app shell)
4. **@design.ux-engineer** with product-designer skill — Validate UX flow, layout patterns, and navigation
5. **@frontend.accessibility** — Accessibility audit of the foundation (contrast, focus, landmarks, reflow)
6. **@frontend.storybook** with design-system skill — Storybook setup and component story documentation

## What This Step Produces

### 1. Visual Identity & Theme

Before any UI is built, the design system must be configured:

- **Color palette** — Brand colors, neutral scale, semantic colors (success/error/warning)
- **Typography** — Font family, type scale (7 levels), weights
- **Spacing & sizing** — Consistent spacing scale, border radii, shadows
- **Dark mode** — Full dark mode support from Day 1
- **Theme CSS** — Tailwind v4 theme tokens as CSS custom properties

### 2. Component Baseline

Configured and themed, not just default shadcn:

- **Buttons** — Primary, secondary, ghost, destructive (all states)
- **Inputs** — Text, select, checkbox, radio, textarea (all states including error)
- **Cards** — Content containers with consistent elevation
- **Badges & Tags** — Status indicators using semantic colors
- **Navigation** — Sidebar, top bar, breadcrumbs styled to brand
- **Typography** — Headings, body, captions rendered with brand font

### 3. Marketing / Landing Page (ALWAYS Required)

Every application needs a front door. This is the public-facing experience that:

- Communicates the value proposition in seconds
- Shows what the product does (screenshots, illustrations, or demo)
- Provides clear CTAs (Sign Up, Get Started, Learn More)
- Builds trust (testimonials, social proof, security badges)
- Includes footer with legal links (TOS, Privacy, etc.)
- Is fully responsive (mobile-first)
- Is SEO-friendly with proper meta tags, heading structure, OG tags

**Landing page sections (typical):**

1. Hero — Headline, subheadline, primary CTA, hero visual
2. Problem/Solution — What pain does this solve?
3. Features — 3-6 key capabilities with icons/visuals
4. How It Works — 3-step process or visual flow
5. Social Proof — Testimonials, logos, metrics
6. Pricing (if public) — Tier comparison
7. Final CTA — Repeat the call to action
8. Footer — Navigation, legal links, social links

### 4. App Shell (Authenticated Layout)

The skeleton that all feature pages live inside:

- **Sidebar navigation** — Logo, nav items, user menu, collapse behavior
- **Top bar** — Breadcrumbs, search, notifications, user avatar
- **Main content area** — Proper landmarks (`<main>`, `<nav>`, `<header>`)
- **Responsive behavior** — Sidebar collapses to mobile drawer at breakpoint
- **Empty states** — What does the app look like with zero data?
- **Loading states** — Skeleton screens for the shell

### 5. Key Screen Mocks (Set the Tone)

Before building features, mock 2-4 representative screens to establish the visual language:

- **Dashboard/Home** — The first thing users see after login
- **List/Table view** — How data-heavy screens will look
- **Detail/Form view** — How single-item views and forms will look
- **Settings page** — How configuration screens will look

These mocks don't need real data or functionality — they set the visual tone and prove the design system works together.

## Discovery Questions

The agent should work through these before building:

### Brand & Aesthetic

- Does a brand already exist? (Logo, colors, fonts, guidelines)
- If no brand: What feeling should the product evoke? (Professional, playful, minimal, bold)
- Reference products whose visual style you admire? (Linear, Notion, Stripe, Vercel, etc.)
- Light mode only, dark mode only, or both?

### Marketing & Landing

- Is there a marketing site separate from the app, or is it integrated?
- What is the one-sentence value proposition?
- Do you have testimonials, logos, or social proof to include?
- Is pricing public on the landing page?
- Any specific hero visual in mind? (Product screenshot, illustration, abstract)

### App Layout

- Sidebar navigation or top navigation?
- What are the primary navigation items? (Even rough ideas help)
- Does the app have a dashboard/home view?
- Any specific views you know you'll need? (Tables, kanban, calendar, chat, etc.)

## Design System Standards (Defaults)

| Element         | Default                                 | Notes                                        |
| --------------- | --------------------------------------- | -------------------------------------------- |
| **Aesthetic**   | "Clean authority"                       | Premium SaaS feel — Linear meets Notion      |
| **Brand color** | `#5900FF` (purple)                      | Used sparingly on CTAs, active states, links |
| **Font**        | DM Sans                                 | `sans-serif` fallback                        |
| **Components**  | shadcn/ui + Radix                       | Themed with brand tokens, not default        |
| **Icons**       | Lucide React                            | `currentColor` for fills, consistent sizing  |
| **Radii**       | 10px default                            | Modern but not bubbly                        |
| **Shadows**     | `shadow-sm` cards, `shadow-md` popovers | Flat with depth hints                        |
| **Spacing**     | Tailwind v4 scale                       | Generous whitespace is a feature             |

### Anti-Patterns (NEVER)

- No gradients on buttons
- No emojis or emoticons as UI icons, status indicators, or Figma stand-ins
- No floating labels
- No `bg-white` on invertible surfaces (use `bg-neutral-0`)
- No hardcoded hex colors (use tokens)
- No heavy shadows on in-page elements
- No purple backgrounds on large surfaces

## Instructions

1. **Discovery** — Ask brand/aesthetic/layout questions (batch them, don't ask one at a time)
2. **Theme setup** — Configure design tokens (colors, typography, spacing) as CSS custom properties in `theme.css`
3. **Component baseline** — Theme shadcn/ui components to match brand (frontend.design-system audit + frontend.implementation implementation)
4. **Marketing/landing page** — Build the public-facing front door (responsive, accessible, SEO-ready)
5. **App shell** — Build the authenticated layout skeleton (sidebar, top bar, content area)
6. **Screen mocks** — Create 2-4 representative screens to prove the visual language works
7. **Accessibility check** — frontend.accessibility audit of all foundation UI (contrast, landmarks, keyboard, reflow at 320px)
8. **Present to user** — Show the complete visual foundation for approval before proceeding to features
9. **Figma Component Library and View Frames** — @frontend.design-system uses the official Figma MCP to create Figma artifacts that mirror the code components and the actual product views:
   - Create a Figma token library (colors, typography, spacing, shadows) synced with CSS custom properties using `use_figma`
   - Convert baseline components to Figma components using `use_figma` and `generate_figma_design`
   - Create component variants matching code variants using `use_figma`
   - Create assembled Figma frames for the representative dashboard/home, list/table, detail/form, settings, and app-shell views established in this step
   - Use the real app icon system in Figma. If the product uses Lucide React, Figma artifacts must use matching Lucide icons or clearly named Lucide placeholders. Never use emojis or emoticons as icons.
   - This ensures designers and developers share a single source of truth across both reusable primitives and complete screens
10. **Storybook Setup & Stories** — @frontend.storybook initializes Storybook and documents every baseline component:
    - Set up Storybook with proper project configuration
    - Write stories for every component created in steps 5A-5D (with all variants, states, and responsive views)
    - Create MDX documentation pages for the design system overview
    - Verify Storybook builds successfully

## Design Contract

The screen mocks, marketing page, app shell, and component baseline produced in this step constitute the **visual contract** for all subsequent feature implementation.

- When features are built by @frontend.implementation or other implementation agents, they **MUST** match the layout, spacing, sizing, typography, colors, and proportions established in these mocks.
- Deviations from the established design require **explicit approval** from the user or designer before implementation proceeds.
- Do not "interpret" or "improve" the approved design — implement it as specified.
- The mocks produced here must include enough detail to serve as authoritative visual specs: specific spacing values, color tokens used, typography choices, and layout structure.
- If a design decision is ambiguous or underspecified, flag it during this step — not during feature implementation.

This contract ensures visual consistency across every feature built on top of the foundation.

## User Input

The product and any brand/visual direction: {{input}}
