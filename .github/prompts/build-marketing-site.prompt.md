---
description: "Build a complete marketing site with landing page, pricing, features, and conversion-optimized sections"
agent: "conductor.powder"
---

# Build a Marketing Site

You are building a public-facing marketing site — the first thing users see before signing up.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** — Audit design system for tokens, colors, typography, and reusable components
2. **@frontend.marketing-site** — Implement all marketing pages (landing, pricing, features, about)
3. **@frontend.accessibility** — Accessibility audit on every page

## Marketing Site Requirements

### Pages to Build

- **Landing page** — Hero, social proof, features, testimonials, FAQ, final CTA
- **Pricing page** — Tier cards with monthly/annual toggle, comparison table, FAQ
- **Features page** (optional) — Detailed feature breakdowns with visuals
- **About page** (optional) — Company story, team, values

### Every Marketing Page Must Include

- **Marketing header** — Sticky, transparent → solid on scroll, with mobile hamburger
- **Marketing footer** — Sitemap links, social icons, legal links
- **Skip link** to main content
- **Page `<title>`** — Format: "Page Name - Product Name"
- **At least 3 CTAs** — Above the fold, mid-page, and final section
- **Social proof** — Logo bar, testimonials, or metric counters (at least 2 types)
- **Trust signals** — "No credit card required", security badges, or review ratings
- **Responsive layout** — Full reflow at 320px, no horizontal scroll
- **Semantic HTML** — `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>` with proper headings

### Conversion Requirements

- Primary CTA uses high-contrast brand styling
- CTA copy starts with a verb ("Start free trial", not "Submit")
- Below-CTA trust text present ("No credit card required · Cancel anytime")
- AIDA flow: Attention (hero) → Interest (features) → Desire (social proof) → Action (CTA)

### Design Token Alignment

- Use the same brand tokens (purple `#5900FF`, neutral scale, DM Sans)
- Marketing pages use larger typography (Display 1 at 56px, Display 2 at 44px)
- Sections alternate backgrounds: white → neutral-50 → white → brand gradient
- Full-width layout — no sidebar, `max-w-7xl` content containers

## Instructions

1. Run frontend.design-system to audit available design tokens and components
2. Build the shared marketing layout (header, footer, skip link)
3. Build the landing page following AIDA structure
4. Build the pricing page with tier cards and comparison table
5. Build additional pages (features, about) if requested
6. Wire up all navigation links between pages
7. Run frontend.accessibility accessibility audit on each page
8. Verify conversion checklist from `references/conversion-patterns.md`

## User Input

The product and marketing site I need: {{input}}
