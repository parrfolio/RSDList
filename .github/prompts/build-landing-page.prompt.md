---
description: "Build a conversion-optimized landing page with hero, features, social proof, and CTAs"
agent: "conductor.powder"
---

# Build a Landing Page

You are building a single landing page — the primary entry point for new visitors.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** — Audit design system tokens and existing components
2. **@frontend.marketing-site** — Implement the landing page
3. **@frontend.accessibility** — Accessibility audit

## Landing Page Structure (AIDA Flow)

The page must follow the AIDA conversion framework:

### 1. Attention — Hero Section

- Value proposition headline (≤ 12 words)
- Supporting subline (≤ 25 words, explains the benefit)
- Primary CTA + secondary CTA
- Product screenshot or demo visual
- Optional: announcement badge above headline

### 2. Interest — Social Proof + Features

- Logo bar or metric counters (immediately after hero)
- Feature grid (3-6 features with icons and descriptions)
- Alternating feature sections (text + visual, for detailed features)

### 3. Desire — Testimonials + Trust

- Customer testimonials (3 minimum)
- Security badges or compliance mentions
- Optional: case study highlights or metric improvements

### 4. Action — Final CTA

- Full-width CTA section with brand gradient background
- Repeat the primary headline or a variation
- CTA + trust text ("No credit card required")

### 5. Support — FAQ + Footer

- FAQ accordion (5-8 questions)
- Marketing footer with sitemap

## Requirements

- Marketing header (sticky, transparent → solid on scroll)
- Skip link to main content
- Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`)
- Page `<title>`: "Product Name — tagline"
- CTAs appear at least 3 times
- Responsive: full reflow at 320px
- Color contrast ≥ 4.5:1 for all text
- All interactive elements keyboard operable

## Instructions

1. Audit design tokens with frontend.design-system
2. Build marketing layout shell (header + footer)
3. Build hero section with CTA pair
4. Build social proof bar (logos or metrics)
5. Build feature grid and/or alternating features
6. Build testimonials section
7. Build FAQ section
8. Build final CTA section
9. Run frontend.accessibility accessibility audit
10. Verify against conversion checklist

## User Input

The product and landing page I need: {{input}}
