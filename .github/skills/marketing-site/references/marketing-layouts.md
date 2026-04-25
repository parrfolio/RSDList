# Marketing Layout Patterns

Structural patterns, responsive rules, and code examples for marketing site pages. This file is self-contained — read it whenever building a public-facing marketing page, landing page, pricing page, or pre-auth marketing UI.

> **Design system note:** These patterns extend the design-system skill. All components use the same tokens from `references/theme.css`. Marketing pages use full-width layouts (no sidebar) with larger type and more generous spacing.

---

## Table of Contents — Code Examples

1. [Marketing Page Shell](#marketing-page-shell)
2. [Marketing Header](#marketing-header)
3. [Hero Section](#hero-section)
4. [Feature Grid](#feature-grid)
5. [Alternating Feature Sections](#alternating-feature-sections)
6. [Pricing Section](#pricing-section)
7. [Testimonials Section](#testimonials-section)
8. [FAQ Section](#faq-section)
9. [Final CTA Section](#final-cta-section)
10. [Marketing Footer](#marketing-footer)
11. [Pre-Auth Split Layout](#pre-auth-split-layout)
12. [Social Proof Bar](#social-proof-bar)

---

## Marketing Page Shell

The foundational layout for all marketing pages. No sidebar — full-width, centered content.

```
┌────────────────────────────────────────────────────┐
│  Header (sticky, transparent → solid on scroll)    │
├────────────────────────────────────────────────────┤
│  Hero Section (full-width, gradient bg)            │
├────────────────────────────────────────────────────┤
│  Content Sections (alternating bg)                 │
├────────────────────────────────────────────────────┤
│  Footer (dark bg, sitemap + legal)                 │
└────────────────────────────────────────────────────┘
```

### Structure

```tsx
export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white"
      >
        Skip to main content
      </a>
      <MarketingHeader />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
```

### Responsive Strategy

- `max-w-7xl mx-auto` for content containers (1280px max)
- `px-4 sm:px-6 lg:px-8` for horizontal padding
- Sections use `py-12 sm:py-16 lg:py-20` for vertical rhythm
- Hero uses `py-16 sm:py-24 lg:py-32` for dramatic spacing

---

## Marketing Header

Sticky header with scroll-based appearance change.

### Desktop Structure

```tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-neutral-200"
          : "bg-transparent"
      }`}
    >
      <nav
        className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2" aria-label="Home">
          <Logo />
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="/features"
            className={`text-sm font-medium transition-colors ${scrolled ? "text-neutral-600 hover:text-neutral-900" : "text-white/80 hover:text-white"}`}
          >
            Features
          </a>
          <a
            href="/pricing"
            className={`text-sm font-medium transition-colors ${scrolled ? "text-neutral-600 hover:text-neutral-900" : "text-white/80 hover:text-white"}`}
          >
            Pricing
          </a>
          <a
            href="/docs"
            className={`text-sm font-medium transition-colors ${scrolled ? "text-neutral-600 hover:text-neutral-900" : "text-white/80 hover:text-white"}`}
          >
            Docs
          </a>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={scrolled ? "" : "text-white hover:bg-white/10"}
            asChild
          >
            <a href="/login">Log in</a>
          </Button>
          <Button
            size="sm"
            className={
              scrolled ? "" : "bg-white text-brand-500 hover:bg-white/90"
            }
            asChild
          >
            <a href="/signup">Get Started</a>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </nav>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 shadow-lg">
          <div className="flex flex-col px-4 py-4 gap-1">
            <a
              href="/features"
              className="py-3 text-neutral-900 font-medium border-b border-neutral-100"
            >
              Features
            </a>
            <a
              href="/pricing"
              className="py-3 text-neutral-900 font-medium border-b border-neutral-100"
            >
              Pricing
            </a>
            <a
              href="/docs"
              className="py-3 text-neutral-900 font-medium border-b border-neutral-100"
            >
              Docs
            </a>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="outline" className="w-full" asChild>
                <a href="/login">Log in</a>
              </Button>
              <Button className="w-full" asChild>
                <a href="/signup">Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
```

---

## Hero Section

The most critical section — communicates value in 3 seconds.

### Centered Hero (Default)

```tsx
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0040] via-brand-500 to-[#7A33FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Optional badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/90 mb-6">
            <span
              className="w-2 h-2 rounded-full bg-green-400"
              aria-hidden="true"
            />
            Just launched — see what's new
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight max-w-4xl mx-auto">
            Build products your
            <br className="hidden sm:block" />
            customers love
          </h1>

          {/* Subline */}
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform that helps teams ship faster, collaborate
            better, and delight their users.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-brand-500 hover:bg-white/90 h-12 px-8 text-base"
              asChild
            >
              <a href="/signup">
                Start free trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/10 h-12 px-8 text-base"
              asChild
            >
              <a href="/demo">Watch demo</a>
            </Button>
          </div>
        </motion.div>

        {/* Product screenshot */}
        <motion.div
          className="mt-16 sm:mt-20 relative max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="rounded-xl border border-white/10 shadow-2xl overflow-hidden bg-gradient-to-br from-[#c3b1e1] via-[#f0c4d0] to-[#e0aed0] aspect-video" />
        </motion.div>
      </div>
    </section>
  );
}
```

### Split Hero (Text Left, Visual Right)

```tsx
export function HeroSplit() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0040] via-brand-500 to-[#7A33FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-semibold text-white leading-tight">
              Ship faster with confidence
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed">
              Stop juggling tools. One platform for planning, building, testing,
              and deploying — so your team can focus on what matters.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-brand-500 hover:bg-white/90 h-12 px-8"
                asChild
              >
                <a href="/signup">Get started free</a>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 h-12 px-8"
                asChild
              >
                <a href="/demo">Book a demo</a>
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="rounded-xl border border-white/10 shadow-2xl overflow-hidden bg-gradient-to-br from-[#a8edea] via-[#fed6e3] to-[#a8edea] aspect-[4/3]" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Feature Grid

3-column grid for feature highlights.

```tsx
import { Zap, Shield, BarChart3, Users, Globe, Lock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for speed. Every interaction feels instant.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant with end-to-end encryption.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track what matters with live dashboards.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Built for teams of 5 or 5,000.",
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "Deployed across 12 regions worldwide.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "GDPR compliant. Your data stays yours.",
  },
];

export function FeatureGrid() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-medium text-neutral-950">
            Everything you need to ship
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            A complete toolkit for modern development teams.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="p-6 rounded-lg border border-neutral-200 bg-white hover:shadow-sm transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-brand-500" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-neutral-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Alternating Feature Sections

For detailed feature explanations — text on one side, visual on the other, alternating per section.

```tsx
const detailedFeatures = [
  {
    title: "Plan with clarity",
    description:
      "Organize work into sprints, track progress in real-time, and never lose sight of what matters. Built-in roadmaps keep everyone aligned.",
    bullets: ["Sprint planning", "Real-time tracking", "Custom roadmaps"],
    gradient: "from-[#a8edea] via-[#fed6e3] to-[#a8edea]",
  },
  {
    title: "Build together",
    description:
      "Real-time collaboration tools that make remote work feel like you're in the same room. Code review, pair programming, and shared workspaces.",
    bullets: ["Live collaboration", "Code review", "Shared workspaces"],
    gradient: "from-[#f6d5c5] via-[#e8b4b8] to-[#d4a0a0]",
  },
];

export function AlternatingFeatures() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {detailedFeatures.map((feature, i) => (
          <motion.div
            key={feature.title}
            className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            {/* Text side */}
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <h2 className="text-3xl sm:text-4xl font-medium text-neutral-950">
                {feature.title}
              </h2>
              <p className="mt-4 text-lg text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
              <ul className="mt-6 space-y-3">
                {feature.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-3 text-neutral-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-brand-500" />
                    </div>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual side */}
            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
              <div
                className={`rounded-xl shadow-sm overflow-hidden bg-gradient-to-br ${feature.gradient} aspect-[4/3]`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

---

## Pricing Section

Three-tier pricing with monthly/annual toggle.

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const plans = [
  {
    name: "Starter",
    description: "For individuals and small projects",
    monthly: 0,
    annual: 0,
    cta: "Get started free",
    ctaVariant: "outline" as const,
    popular: false,
    features: [
      { text: "Up to 3 projects", included: true },
      { text: "Basic analytics", included: true },
      { text: "Community support", included: true },
      { text: "Custom domain", included: false },
      { text: "Team collaboration", included: false },
    ],
  },
  {
    name: "Pro",
    description: "For growing teams",
    monthly: 29,
    annual: 24,
    cta: "Start free trial",
    ctaVariant: "default" as const,
    popular: true,
    features: [
      { text: "Unlimited projects", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Priority support", included: true },
      { text: "Custom domain", included: true },
      { text: "Team collaboration", included: true },
    ],
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    monthly: null,
    annual: null,
    cta: "Contact sales",
    ctaVariant: "outline" as const,
    popular: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "SSO / SAML", included: true },
      { text: "Dedicated support", included: true },
      { text: "Custom contracts", included: true },
      { text: "SLA guarantee", included: true },
    ],
  },
];

export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-medium text-neutral-950">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            Start free. Upgrade when you're ready.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-neutral-100 p-1">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!annual ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500"}`}
              onClick={() => setAnnual(false)}
              aria-pressed={!annual}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${annual ? "bg-white shadow-sm text-neutral-900" : "text-neutral-500"}`}
              onClick={() => setAnnual(true)}
              aria-pressed={annual}
            >
              Annual
              <span className="ml-1.5 text-xs text-brand-500">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-6 sm:p-8 flex flex-col ${
                plan.popular
                  ? "border-2 border-brand-500 shadow-md"
                  : "border border-neutral-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-brand-500 text-white text-xs font-bold px-3 py-1">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-neutral-900">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {plan.description}
                </p>
              </div>

              <div className="mt-6">
                {plan.monthly !== null ? (
                  <div className="flex items-baseline gap-1">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={annual ? "annual" : "monthly"}
                        className="text-4xl font-semibold text-neutral-950"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        ${annual ? plan.annual : plan.monthly}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-neutral-500">/mo</span>
                  </div>
                ) : (
                  <p className="text-4xl font-semibold text-neutral-950">
                    Custom
                  </p>
                )}
                {plan.monthly !== null && annual && (
                  <p className="mt-1 text-sm text-neutral-400">
                    Billed annually
                  </p>
                )}
              </div>

              <Button
                variant={plan.ctaVariant}
                className={`mt-6 w-full ${plan.popular ? "bg-brand-500 hover:bg-brand-600 text-white" : ""}`}
                asChild
              >
                <a href={plan.monthly === null ? "/contact" : "/signup"}>
                  {plan.cta}
                </a>
              </Button>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature.text}
                    className="flex items-center gap-3 text-sm"
                  >
                    {feature.included ? (
                      <Check className="w-4 h-4 text-success-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                    )}
                    <span
                      className={
                        feature.included
                          ? "text-neutral-700"
                          : "text-neutral-400"
                      }
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Testimonials Section

Customer testimonials in a grid layout.

```tsx
const testimonials = [
  {
    quote:
      "This tool completely transformed how our team ships product. We went from monthly releases to weekly.",
    author: "Sarah Chen",
    role: "VP Engineering, Acme Corp",
    avatar: null, // Use initials fallback
  },
  {
    quote:
      "The best investment we've made this year. ROI was visible within the first month.",
    author: "Marcus Johnson",
    role: "CTO, StartupXYZ",
    avatar: null,
  },
  {
    quote:
      "Finally, a tool that doesn't require a PhD to set up. Our team was productive on day one.",
    author: "Priya Patel",
    role: "Engineering Lead, CloudCo",
    avatar: null,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-medium text-neutral-950">
            Loved by teams worldwide
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            See what our customers have to say.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure
              key={t.author}
              className="rounded-lg border border-neutral-200 bg-white p-6"
            >
              <blockquote className="text-neutral-700 leading-relaxed">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-sm font-medium text-brand-500">
                  {t.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {t.author}
                  </p>
                  <p className="text-sm text-neutral-500">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## FAQ Section

Accordion-based FAQ using shadcn Accordion.

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does the free trial work?",
    a: "You get full access to Pro features for 14 days. No credit card required. At the end of the trial, you can upgrade or continue with the free Starter plan.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes, you can upgrade, downgrade, or cancel at any time. Changes take effect immediately, and we prorate your billing.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We're SOC 2 Type II certified, use end-to-end encryption, and never share your data with third parties.",
  },
  {
    q: "Do you offer team discounts?",
    a: "Yes, we offer volume discounts for teams of 10+. Contact our sales team for custom pricing.",
  },
  {
    q: "What integrations do you support?",
    a: "We integrate with Slack, GitHub, GitLab, Jira, Linear, Figma, and 50+ other tools. Check our integrations page for the full list.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-medium text-neutral-950">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-neutral-500">
            Can't find what you're looking for?{" "}
            <a href="/contact" className="text-brand-500 hover:underline">
              Contact us
            </a>
            .
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-lg border border-neutral-200 px-6"
            >
              <AccordionTrigger className="text-left text-neutral-900 font-medium py-4 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-neutral-600 leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
```

---

## Final CTA Section

Closing conversion section with gradient background.

```tsx
export function FinalCTA() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[#1a0040] via-brand-500 to-[#7A33FF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold text-white">
          Ready to get started?
        </h2>
        <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
          Join thousands of teams already shipping faster. Start your free trial
          today — no credit card required.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-white text-brand-500 hover:bg-white/90 h-12 px-8 text-base"
            asChild
          >
            <a href="/signup">Start free trial</a>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="text-white hover:bg-white/10 h-12 px-8 text-base"
            asChild
          >
            <a href="/contact">Talk to sales</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
```

---

## Marketing Footer

Full sitemap footer with dark background.

```tsx
import { Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "Integrations", href: "/integrations" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Help Center", href: "/help" },
    { label: "Community", href: "/community" },
    { label: "Status", href: "/status" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-neutral-950 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <a
              href="/"
              className="text-white font-semibold text-lg"
              aria-label="Home"
            >
              ProductName
            </a>
            <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
              The modern platform for teams that ship.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={`${category} navigation`}>
              <h3 className="text-sm font-medium text-neutral-300 mb-3">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-neutral-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-600">
            &copy; {new Date().getFullYear()} ProductName. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              className="text-neutral-600 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://github.com"
              className="text-neutral-600 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com"
              className="text-neutral-600 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## Pre-Auth Split Layout

Login/signup page with marketing panel.

```tsx
export function AuthLayout({
  children,
  marketing,
}: {
  children: React.ReactNode;
  marketing?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Marketing panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1a0040] via-brand-500 to-[#7A33FF] p-12 flex-col justify-between">
        <a
          href="/"
          className="text-white font-semibold text-lg"
          aria-label="Home"
        >
          ProductName
        </a>
        <div className="flex-1 flex items-center justify-center">
          {marketing ?? <DefaultMarketingPanel />}
        </div>
        <p className="text-white/40 text-sm">
          &copy; {new Date().getFullYear()} ProductName
        </p>
      </div>

      {/* Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <a
              href="/"
              className="text-brand-500 font-semibold text-lg"
              aria-label="Home"
            >
              ProductName
            </a>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function DefaultMarketingPanel() {
  return (
    <div className="max-w-md">
      <figure>
        <blockquote className="text-xl text-white/90 leading-relaxed font-medium">
          "This tool completely transformed how our team ships product. We went
          from monthly releases to weekly."
        </blockquote>
        <figcaption className="mt-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-medium">
            SC
          </div>
          <div>
            <p className="text-white font-medium">Sarah Chen</p>
            <p className="text-white/60 text-sm">VP Engineering, Acme Corp</p>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
```

---

## Social Proof Bar

Logo bar or metrics bar below the hero.

### Logo Bar

```tsx
export function LogoBar() {
  const logos = ["Acme", "Globex", "Initech", "Umbrella", "Stark", "Wayne"];

  return (
    <section className="py-8 sm:py-12 bg-neutral-50 border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-neutral-400 mb-6">
          Trusted by industry-leading teams
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {logos.map((name) => (
            <span
              key={name}
              className="text-neutral-300 font-semibold text-lg"
              aria-hidden="true"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Metrics Bar

```tsx
const metrics = [
  { value: "50,000+", label: "Teams" },
  { value: "99.99%", label: "Uptime" },
  { value: "150+", label: "Countries" },
  { value: "4.9/5", label: "Rating" },
];

export function MetricsBar() {
  return (
    <section className="py-8 sm:py-12 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-2xl sm:text-3xl font-semibold text-white">
                {m.value}
              </p>
              <p className="mt-1 text-sm text-neutral-400">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```
