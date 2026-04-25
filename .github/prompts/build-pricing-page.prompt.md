---
description: "Build a pricing page with tier cards, billing toggle, feature comparison, and FAQ"
agent: "conductor.powder"
---

# Build a Pricing Page

You are building a pricing page that clearly communicates plan options and drives conversions.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** — Audit design system tokens and components
2. **@frontend.marketing-site** — Implement the pricing page
3. **@frontend.accessibility** — Accessibility audit

## Pricing Page Structure

### 1. Header Section

- Headline: "Simple, transparent pricing" (or similar)
- Subline emphasizing value ("Start free. Upgrade when you're ready.")
- Monthly/annual billing toggle with savings badge

### 2. Tier Cards (3 tiers recommended)

Each tier card includes:

- Plan name and one-line description
- Price with animated billing toggle transition
- Primary CTA button (highlighted tier gets filled button)
- Feature list with check/X icons
- "Most Popular" badge on recommended tier

**Tier pattern**:
| Tier | Pricing | CTA | Style |
|------|---------|-----|-------|
| Starter/Free | $0/mo | "Get started free" | Outline border |
| Pro | $XX/mo | "Start free trial" | Brand border + shadow, "Most Popular" badge |
| Enterprise | "Custom" | "Contact sales" | Outline border |

### 3. Feature Comparison Table

- Full-width table below tier cards
- Columns: Feature | Starter | Pro | Enterprise
- Use Check/X/Minus icons for status
- Proper `<th>` headers for accessibility

### 4. FAQ Section

- 5-8 pricing-specific questions
- Topics: trial details, billing changes, refund policy, team pricing, security
- Accordion format using shadcn Accordion

### 5. Final CTA

- "Still have questions?" with contact link
- Or full-width CTA section for sign-up

## Requirements

- Marketing header and footer (shared layout)
- Skip link to main content
- Page `<title>`: "Pricing - Product Name"
- `aria-pressed` on billing toggle buttons
- `aria-label` on Check/X status icons in comparison table
- Color contrast ≥ 4.5:1 on all tier card text
- Responsive: cards stack vertically on mobile
- No horizontal scroll at 320px
- Trust text below primary CTA ("No credit card required · Cancel anytime")

## Instructions

1. Audit design tokens with frontend.design-system
2. Build shared marketing layout (if not already built)
3. Build billing toggle component
4. Build tier cards with animated price transitions
5. Build feature comparison table
6. Build pricing FAQ accordion
7. Build final CTA or contact section
8. Run frontend.accessibility accessibility audit
9. Verify pricing conversion patterns

## User Input

The plans and pricing page I need: {{input}}
