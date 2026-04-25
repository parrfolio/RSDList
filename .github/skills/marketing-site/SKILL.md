---
name: marketing-site
description: >
  Marketing site patterns for SaaS landing pages, pricing, features, testimonials,
  CTAs, pre-auth marketing UI, and conversion-focused layouts. Use this skill when
  building any public-facing marketing page, landing page, pricing page, or pre-auth
  experience (login/signup with marketing panels). Also applies when the user says
  "marketing site", "landing page", "pricing page", "homepage", or needs a
  conversion-focused layout. This skill extends the design-system skill with
  marketing-specific patterns — always read the design-system skill first.
version: 1.0.0
author: Framework Team
category: marketing
tags:
  [marketing, landing-page, pricing, conversion, saas, hero, testimonials, cta]
agents:
  [
    "frontend.marketing-site",
    "frontend.implementation",
    "frontend.design-system",
  ]
---

# Marketing Site Skill

Patterns and conventions for building conversion-focused marketing sites that align with the project's design system. This skill bridges the gap between app-level UI and public-facing marketing pages.

**This skill extends the design-system skill.** Always read `.github/skills/design-system/SKILL.md` and its reference files first — marketing pages use the same tokens, components, and type scale, with extensions for larger layouts and conversion patterns.

**Required reading for EVERY marketing page:**

- **`references/marketing-layouts.md`** — ALWAYS read. Full-width section patterns, hero variants, pricing tables, feature grids, testimonial layouts, FAQ, footer, and pre-auth marketing UI. Contains code examples.
- **`references/conversion-patterns.md`** — ALWAYS read. CTA design, social proof patterns, urgency indicators, email capture, announcement bars, and trust signals.

---

## Before You Generate: Required Context

Before producing any marketing page code, confirm the following with the user. If their prompt already answers these, proceed. If not, ask:

1. **Product name** — What is the product/service being marketed?
2. **Target audience** — Who is the ideal customer? (B2B, B2C, developers, etc.)
3. **Primary goal** — What action should visitors take? (Sign up, start trial, book demo, etc.)
4. **Pricing model** — If building a pricing page: how many tiers, free trial, monthly/annual toggle?
5. **Dark mode** — Light only (default for marketing) or both light/dark?

---

## Core Principles

### 1. Same Brand, Different Energy

Marketing pages use the SAME design system but with more dramatic layouts:

- **Larger type** — Hero headings can go up to `48px` (desktop) / `32px` (mobile)
- **More whitespace** — Section padding is `80px`+ vertical (desktop), `48px` (mobile)
- **Full-width sections** — No sidebar, no app shell — marketing pages use edge-to-edge layouts
- **Centered content** — Content area max-width `1200px`, centered with auto margins
- **Visual drama** — Gradient backgrounds, large product screenshots, animated elements

### 2. Conversion Architecture

Every marketing page follows the AIDA framework:

| Stage         | Purpose                 | Sections                            |
| ------------- | ----------------------- | ----------------------------------- |
| **Attention** | Stop the scroll         | Hero, announcement bar              |
| **Interest**  | Explain the value       | Features, benefits, use cases       |
| **Desire**    | Build trust and urgency | Testimonials, social proof, pricing |
| **Action**    | Drive the conversion    | CTA sections, signup forms          |

### 3. Above-the-Fold Contract

The hero section (what visitors see before scrolling) MUST contain:

- **Headline**: 5-10 words, communicates the core value proposition
- **Subline**: 1-2 sentences expanding on the headline
- **Primary CTA**: Single, prominent action button
- **Visual**: Product screenshot, illustration, or video (optional but recommended)
- **Social proof hint**: "Trusted by 10,000+ teams" or logo bar (optional)

### 4. SEO Requirements

Every marketing page must include:

- `<title>` tag: "Page Name | Product Name"
- `<meta name="description">` with compelling 150-160 character description
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
- Proper heading hierarchy (`h1` for page title, `h2` for sections, `h3` for subsections)
- Structured data (JSON-LD) for pricing pages (`Product`, `Offer`) and FAQ pages (`FAQPage`)

---

## Typography Extensions

Marketing pages extend the design system type scale for larger display text:

| Style             | Size (Desktop) | Size (Mobile) | Weight | Line Height | Use                          |
| ----------------- | -------------- | ------------- | ------ | ----------- | ---------------------------- |
| **Display 1**     | 56px           | 36px          | 600    | 1.1         | Hero headline (one per page) |
| **Display 2**     | 48px           | 32px          | 600    | 1.15        | Alternative hero headline    |
| **Section Title** | 36px           | 28px          | 500    | 1.2         | Section headings (`h2`)      |
| **Subsection**    | 24px           | 20px          | 500    | 1.3         | Feature card titles (`h3`)   |
| **Body Large**    | 18px           | 16px          | 400    | 1.6         | Hero subline, intro text     |
| **Body**          | 16px (not 14)  | 14px          | 400    | 1.6         | Section body text            |

**Key differences from app UI:**

- Marketing body text is `16px` (not `14px`) — readability at arm's length
- Hero text uses `semibold` (600) not `medium` (500) — more visual punch
- Line heights are more generous — marketing copy needs breathing room

---

## Spacing Extensions

Marketing pages use larger spacing between sections:

| Context                  | Desktop   | Mobile  | Tailwind          |
| ------------------------ | --------- | ------- | ----------------- |
| Section vertical padding | 80-120px  | 48-64px | `py-20` / `py-12` |
| Between cards in grid    | 24-32px   | 16-24px | `gap-6` / `gap-4` |
| Content max-width        | 1200px    | 100%    | `max-w-7xl`       |
| Content padding (sides)  | 24-48px   | 16-24px | `px-6` / `px-4`   |
| Hero vertical padding    | 120-160px | 64-80px | `py-32` / `py-16` |

---

## Section Background Patterns

Marketing pages alternate backgrounds to create visual rhythm:

| Pattern              | Background                    | Use                                      |
| -------------------- | ----------------------------- | ---------------------------------------- |
| **Default**          | `bg-white` or `bg-neutral-0`  | Most content sections                    |
| **Subtle alternate** | `bg-neutral-50`               | Alternate sections for visual separation |
| **Brand gradient**   | Purple gradient (see below)   | Hero, final CTA, announcement bar        |
| **Dark section**     | `bg-neutral-950` + white text | Social proof bar, testimonial highlight  |

### Brand gradient (hero/CTA backgrounds)

```css
/* Primary hero gradient */
background: linear-gradient(135deg, #1a0040 0%, #5900ff 50%, #7a33ff 100%);

/* Subtle section gradient */
background: linear-gradient(180deg, #f5f0ff 0%, #ffffff 100%);
```

When using dark/gradient backgrounds, text MUST be white (`text-white`) and CTAs use an inverted button style (white bg, brand text).

---

## Marketing Navigation

### Header (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│  Logo    Features  Pricing  Docs  Blog    [Login] [Sign Up] │
└─────────────────────────────────────────────────────────────┘
```

- Sticky/fixed at top, `h-16`, `z-50`
- On hero with gradient background: transparent header, white text/logo
- After scrolling past hero: solid white background, shadow-sm, dark text
- Logo links to `/`
- Primary CTA button (Sign Up / Get Started) in `brand-500`
- Secondary CTA (Login) as ghost button

### Header (Mobile)

- Sticky, `h-14`
- Logo left, hamburger icon right
- Opens full-screen overlay or Sheet with nav links + CTAs
- CTAs are full-width buttons at bottom of mobile nav

### Footer

```
┌─────────────────────────────────────────────────────────────┐
│  Logo + tagline    Product    Company    Resources    Legal  │
│                    Features   About      Blog        Terms  │
│                    Pricing    Careers    Docs        Privacy │
│                    Changelog  Contact    Help        Cookies │
├─────────────────────────────────────────────────────────────┤
│  © 2026 Company. All rights reserved.    [Social icons]     │
└─────────────────────────────────────────────────────────────┘
```

- Background: `bg-neutral-950`, `text-neutral-300`
- Links: `text-neutral-400` default, `text-white` on hover
- Grid: 4-5 columns (desktop), stacked (mobile)
- Bottom bar: copyright + social icons, separated by `border-t border-neutral-800`

---

## Pricing Page Conventions

### Pricing Tier Layout

- **2 tiers**: Side by side, centered
- **3 tiers**: Side by side, middle tier highlighted ("Most Popular" badge)
- **4+ tiers**: Horizontal scroll on mobile, or switch to feature comparison table

### Pricing Card Anatomy

```
┌──────────────────────────┐
│  [Popular Badge]          │
│  Tier Name                │
│  Short description        │
│                           │
│  $XX /mo                  │
│  billed annually          │
│                           │
│  [Get Started]            │
│                           │
│  ✓ Feature 1              │
│  ✓ Feature 2              │
│  ✓ Feature 3              │
│  ✓ Feature 4              │
│  ✗ Feature 5 (disabled)   │
└──────────────────────────┘
```

- Popular/recommended tier: `border-brand-500` (2px), `brand-50` badge
- Other tiers: `border-neutral-200` (1px)
- Monthly/annual toggle: `Tabs` or custom toggle at top of section
- Price animation: Smooth transition when toggling billing period
- Enterprise tier: "Contact us" instead of price, different CTA style

### Feature Comparison Table

For detailed comparisons, use a table below the pricing cards:

- Columns: Feature name + one column per tier
- Rows grouped by category
- Checkmarks (✓) in `success-500`, dashes (—) in `neutral-300`
- Sticky column headers on scroll
- Responsive: horizontal scroll on mobile with sticky first column

---

## Pre-Auth Marketing Pages

Login, signup, and password reset pages should include marketing context:

### Split-Screen Layout (Desktop)

- Left panel (50%): Marketing content — testimonial, feature highlight, value prop, product screenshot
- Right panel (50%): Auth form — clean, focused, minimal
- Background: Left panel uses brand gradient or `neutral-950`, right panel is white

### Mobile Layout

- Marketing panel becomes a compact header (brand mark + one-line tagline)
- Auth form takes full screen below
- Or: marketing panel is hidden entirely on mobile, showing just the auth form

### Content Rotation

The marketing panel should support multiple content variants:

- Testimonial with photo + quote
- Key metric ("Join 50,000+ teams")
- Feature highlight with screenshot
- Rotating between variants (optional, Framer Motion)

---

## Animations & Interactions

Marketing pages benefit from tasteful motion:

### Scroll Animations

- **Fade up on scroll**: Sections fade in + translate up 20px as they enter viewport
- **Stagger**: Items in a grid stagger their entrance by 50-100ms each
- Use Framer Motion `useInView` + `motion.div` with `initial`, `whileInView`, `transition`
- **Duration**: 400-600ms, ease-out
- **Respect reduced motion**: Check `prefers-reduced-motion` and disable animations

### Micro-interactions

- Pricing toggle: smooth slide + price number animation
- FAQ accordion: smooth expand/collapse with height animation
- CTA hover: subtle scale (1.02) + shadow increase
- Navigation scroll: smooth background transition (transparent → solid)

### Performance Rules

- Animations must not cause layout shifts (use `transform` and `opacity` only)
- Lazy load below-fold images
- Use `will-change: transform` sparingly
- No animation on initial page load above the fold (except hero text fade-in)

---

## Accessibility for Marketing Pages

Marketing pages have unique a11y considerations:

1. **Announcement bar**: Must be dismissible via keyboard, use `role="alert"` or `role="status"`
2. **Sticky header**: Must not trap focus; landmark `<header>` remains accessible
3. **Hero section**: Decorative background images/gradients need sufficient text contrast
4. **Logo bar**: Logos are decorative → `alt=""`, or if linked, descriptive `alt`
5. **Pricing toggle**: Announce state change to screen readers (`aria-live`)
6. **FAQ accordion**: Use `details/summary` or proper ARIA accordion pattern
7. **Testimonial carousel**: Controls must be keyboard accessible, auto-play must be pausable
8. **CTA buttons**: Unique accessible names if multiple CTAs on page ("Start free trial" not just "Get Started" x5)
9. **Footer columns**: Wrap in `<nav aria-label="Footer navigation">`
10. **Skip link**: Marketing pages still need a skip link to main content

---

## Checklist Before Output

Before delivering any marketing page code, verify:

- [ ] Uses the project's design system tokens (brand colors, neutrals, typography)
- [ ] Hero section has headline + subline + CTA above the fold
- [ ] All sections are responsive (375px, 768px, 1024px, 1280px)
- [ ] Navigation is sticky with scroll behavior (transparent → solid)
- [ ] Pricing cards highlight the recommended tier
- [ ] Social proof is present (logos, metrics, or testimonials)
- [ ] FAQ uses accessible accordion pattern
- [ ] All images lazy-loaded below the fold
- [ ] SEO meta tags present (`title`, `description`, OG, Twitter Card)
- [ ] Proper heading hierarchy (one `h1`, sections use `h2`, cards use `h3`)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] All CTAs have unique accessible names
- [ ] Skip link present
- [ ] Footer has proper navigation landmark
- [ ] Pre-auth pages include marketing context (if applicable)
- [ ] Tests cover key interactions (toggle, accordion, responsive)
