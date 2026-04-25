# Conversion Patterns

Reusable conversion-optimized UI patterns for marketing sites. These patterns increase sign-ups, engagement, and trust. Use them in combination with the layout patterns in `marketing-layouts.md`.

> **Rule**: Every marketing page must include at least 3 conversion touchpoints (CTA, social proof, trust signal). Never build a page with only one call-to-action.

---

## Table of Contents

1. [CTA Button Patterns](#cta-button-patterns)
2. [Announcement Bar](#announcement-bar)
3. [Email Capture](#email-capture)
4. [Trust Signals](#trust-signals)
5. [Social Proof Patterns](#social-proof-patterns)
6. [Feature Comparison Table](#feature-comparison-table)
7. [Urgency & Scarcity](#urgency--scarcity)
8. [Onboarding Teaser](#onboarding-teaser)
9. [Exit Intent / Sticky CTA](#exit-intent--sticky-cta)
10. [Conversion Checklist](#conversion-checklist)

---

## CTA Button Patterns

### Primary CTA — High Emphasis

The primary CTA uses brand color on light backgrounds and inverted (white) on brand/dark backgrounds.

```tsx
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// On light background
export function PrimaryCTALight() {
  return (
    <Button
      size="lg"
      className="bg-brand-500 hover:bg-brand-600 text-white h-12 px-8 text-base"
      asChild
    >
      <a href="/signup">
        Start free trial
        <ArrowRight className="ml-2 w-4 h-4" />
      </a>
    </Button>
  );
}

// On dark / brand background
export function PrimaryCTADark() {
  return (
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
  );
}
```

### Secondary CTA — Low Emphasis

```tsx
// On light background
export function SecondaryCTALight() {
  return (
    <Button
      size="lg"
      variant="ghost"
      className="text-neutral-700 hover:bg-neutral-100 h-12 px-8 text-base"
      asChild
    >
      <a href="/demo">Watch demo</a>
    </Button>
  );
}

// On dark / brand background
export function SecondaryCTADark() {
  return (
    <Button
      size="lg"
      variant="ghost"
      className="text-white hover:bg-white/10 h-12 px-8 text-base"
      asChild
    >
      <a href="/demo">Watch demo</a>
    </Button>
  );
}
```

### CTA Pair (Primary + Secondary)

Always group CTAs with primary on the left:

```tsx
export function CTAPair({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {dark ? <PrimaryCTADark /> : <PrimaryCTALight />}
      {dark ? <SecondaryCTADark /> : <SecondaryCTALight />}
    </div>
  );
}
```

### CTA Copywriting Rules

| Context    | Good CTA Copy                      | Bad CTA Copy |
| ---------- | ---------------------------------- | ------------ |
| Sign up    | "Start free trial"                 | "Submit"     |
| Demo       | "Watch demo" or "Book a demo"      | "Learn more" |
| Pricing    | "Get started free"                 | "Sign up"    |
| Enterprise | "Talk to sales" or "Contact sales" | "Contact us" |
| Upgrade    | "Upgrade to Pro"                   | "Buy"        |

**Rules**:

- Start with a verb
- Include the benefit or next step
- Primary CTA ≤ 4 words
- Never use "Submit", "Click here", or "Learn more" as primary CTA

---

## Announcement Bar

Sticky banner at the top of the page for promotions, launches, or events.

```tsx
import { X, ArrowRight } from "lucide-react";
import { useState } from "react";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className="relative bg-brand-500 text-white text-sm py-2.5 px-4 text-center"
      role="status"
    >
      <a
        href="/launch"
        className="inline-flex items-center gap-2 hover:underline"
      >
        <span className="font-medium">New:</span> We just launched v2.0 with
        AI-powered features
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
      <button
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
        onClick={() => setVisible(false)}
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

### Variants

```tsx
// Subtle / neutral
<div className="bg-neutral-900 text-white text-sm py-2.5 px-4 text-center">

// Success / launch
<div className="bg-green-600 text-white text-sm py-2.5 px-4 text-center">

// Warning / limited offer
<div className="bg-amber-500 text-white text-sm py-2.5 px-4 text-center">
```

---

## Email Capture

### Inline Email Capture (in page flow)

```tsx
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2 } from "lucide-react";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // API call here
      await new Promise((r) => setTimeout(r, 1000));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center" role="status">
        <p className="text-green-600 font-medium">You're on the list!</p>
        <p className="text-sm text-neutral-500 mt-1">
          Check your inbox for confirmation.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
    >
      <div className="flex-1">
        <label htmlFor="email-capture" className="sr-only">
          Email address
        </label>
        <Input
          id="email-capture"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={status === "error"}
          aria-describedby={status === "error" ? "email-error" : undefined}
          className="h-12"
          disabled={status === "loading"}
        />
        {status === "error" && (
          <p id="email-error" className="text-sm text-red-600 mt-1">
            Something went wrong. Try again.
          </p>
        )}
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-12 px-6"
        disabled={status === "loading"}
      >
        {status === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            Get early access
            <ArrowRight className="ml-2 w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  );
}
```

### Email Capture Section (standalone section)

```tsx
export function EmailCaptureSection() {
  return (
    <section className="py-12 sm:py-16 bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-medium text-neutral-950">
          Stay in the loop
        </h2>
        <p className="mt-3 text-neutral-500">
          Get product updates, tips, and insights delivered to your inbox.
        </p>
        <div className="mt-6">
          <EmailCapture />
        </div>
        <p className="mt-3 text-xs text-neutral-400">
          No spam. Unsubscribe anytime. Read our{" "}
          <a href="/privacy" className="underline hover:text-neutral-600">
            privacy policy
          </a>
          .
        </p>
      </div>
    </section>
  );
}
```

---

## Trust Signals

### Security Badges

```tsx
import { Shield, Lock, Award } from "lucide-react";

const badges = [
  { icon: Shield, label: "SOC 2 Type II" },
  { icon: Lock, label: "256-bit encryption" },
  { icon: Award, label: "GDPR compliant" },
];

export function SecurityBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-2 text-neutral-400 text-sm"
        >
          <badge.icon className="w-4 h-4" aria-hidden="true" />
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  );
}
```

### Below-CTA Trust Text

Always place reassurance text directly below the primary CTA:

```tsx
export function CTAWithTrust() {
  return (
    <div className="text-center">
      <Button
        size="lg"
        className="bg-brand-500 hover:bg-brand-600 text-white h-12 px-8"
        asChild
      >
        <a href="/signup">Start free trial</a>
      </Button>
      <p className="mt-3 text-sm text-neutral-400">
        No credit card required · Free for 14 days · Cancel anytime
      </p>
    </div>
  );
}
```

### Third-Party Review Ratings

```tsx
import { Star } from "lucide-react";

export function ReviewRating() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex" aria-label="4.9 out of 5 stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= 4 ? "fill-amber-400 text-amber-400" : "fill-amber-400/60 text-amber-400/60"}`}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-sm text-neutral-500">
        4.9/5 from 2,000+ reviews on G2
      </span>
    </div>
  );
}
```

---

## Social Proof Patterns

### Logo Wall (Detailed)

```tsx
export function LogoWall() {
  const companies = [
    { name: "Acme Corp", width: 120 },
    { name: "Globex Inc", width: 100 },
    { name: "Initech", width: 90 },
    { name: "Umbrella Co", width: 110 },
    { name: "Stark Industries", width: 130 },
    { name: "Wayne Enterprises", width: 140 },
  ];

  return (
    <section className="py-10 sm:py-14 bg-white border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-neutral-400 tracking-wide uppercase mb-8">
          Trusted by 5,000+ companies
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {companies.map((company) => (
            <div
              key={company.name}
              className="text-neutral-300 font-semibold text-lg"
              style={{ width: company.width }}
              aria-hidden="true"
            >
              {company.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Metric Counter Section

```tsx
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      className="tabular-nums"
    >
      {isInView ? value.toLocaleString() : "0"}
      {suffix}
    </motion.span>
  );
}

const stats = [
  { value: 50000, suffix: "+", label: "Active teams" },
  { value: 99.99, suffix: "%", label: "Uptime SLA" },
  { value: 150, suffix: "+", label: "Countries" },
  { value: 12, suffix: "M", label: "Tasks completed" },
];

export function MetricCounters() {
  return (
    <section className="py-10 sm:py-14 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl sm:text-4xl font-semibold text-white">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-neutral-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Feature Comparison Table

For pricing pages — compare feature availability across tiers.

```tsx
import { Check, X, Minus } from "lucide-react";

type FeatureStatus = "yes" | "no" | "limited";

interface ComparisonRow {
  feature: string;
  starter: FeatureStatus;
  pro: FeatureStatus;
  enterprise: FeatureStatus;
}

const rows: ComparisonRow[] = [
  { feature: "Projects", starter: "limited", pro: "yes", enterprise: "yes" },
  {
    feature: "Team members",
    starter: "limited",
    pro: "yes",
    enterprise: "yes",
  },
  { feature: "Analytics", starter: "limited", pro: "yes", enterprise: "yes" },
  { feature: "Custom domain", starter: "no", pro: "yes", enterprise: "yes" },
  { feature: "SSO / SAML", starter: "no", pro: "no", enterprise: "yes" },
  { feature: "SLA guarantee", starter: "no", pro: "no", enterprise: "yes" },
  { feature: "Dedicated support", starter: "no", pro: "no", enterprise: "yes" },
];

function StatusIcon({ status }: { status: FeatureStatus }) {
  switch (status) {
    case "yes":
      return <Check className="w-5 h-5 text-green-600" aria-label="Included" />;
    case "no":
      return (
        <X className="w-5 h-5 text-neutral-300" aria-label="Not included" />
      );
    case "limited":
      return <Minus className="w-5 h-5 text-amber-500" aria-label="Limited" />;
  }
}

export function ComparisonTable() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-medium text-neutral-950 mb-8 text-center">
          Compare plans
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th
                  className="text-left py-4 pr-4 font-medium text-neutral-500"
                  scope="col"
                >
                  Feature
                </th>
                <th
                  className="text-center px-4 py-4 font-medium text-neutral-500 w-28"
                  scope="col"
                >
                  Starter
                </th>
                <th
                  className="text-center px-4 py-4 font-medium text-brand-500 w-28"
                  scope="col"
                >
                  Pro
                </th>
                <th
                  className="text-center px-4 py-4 font-medium text-neutral-500 w-28"
                  scope="col"
                >
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature} className="border-b border-neutral-100">
                  <td className="py-3 pr-4 text-neutral-700">{row.feature}</td>
                  <td className="text-center px-4 py-3">
                    <StatusIcon status={row.starter} />
                  </td>
                  <td className="text-center px-4 py-3">
                    <StatusIcon status={row.pro} />
                  </td>
                  <td className="text-center px-4 py-3">
                    <StatusIcon status={row.enterprise} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
```

---

## Urgency & Scarcity

Use sparingly and honestly. Never fabricate scarcity.

### Limited-Time Banner

```tsx
export function LimitedTimeBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-center text-sm">
      <strong className="text-amber-800">Limited time:</strong>{" "}
      <span className="text-amber-700">
        50% off Pro for your first 3 months. Ends Jan 31.
      </span>
    </div>
  );
}
```

### Spot Counter (e.g., beta slots)

```tsx
export function SpotCounter({
  remaining,
  total,
}: {
  remaining: number;
  total: number;
}) {
  const percentage = ((total - remaining) / total) * 100;

  return (
    <div className="max-w-xs mx-auto text-center">
      <div
        className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={total - remaining}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        <strong className="text-neutral-900">{remaining}</strong> of {total}{" "}
        beta spots remaining
      </p>
    </div>
  );
}
```

---

## Onboarding Teaser

Shows what the signup experience looks like — reduces anxiety.

```tsx
export function OnboardingTeaser() {
  const steps = [
    {
      step: 1,
      label: "Create account",
      description: "30 seconds, no credit card",
    },
    {
      step: 2,
      label: "Connect your tools",
      description: "GitHub, Slack, Jira in one click",
    },
    {
      step: 3,
      label: "Start building",
      description: "Your first project in under 2 minutes",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-medium text-neutral-950">
          Get started in 3 steps
        </h2>
        <div className="mt-10 grid sm:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center mx-auto text-sm font-bold">
                {s.step}
              </div>
              <h3 className="mt-4 font-medium text-neutral-900">{s.label}</h3>
              <p className="mt-1 text-sm text-neutral-500">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## Exit Intent / Sticky CTA

### Sticky Bottom CTA Bar

Shows after user scrolls past the hero (use Intersection Observer).

```tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-neutral-200 shadow-lg py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-neutral-700 hidden sm:block">
          Ready to get started? Try it free for 14 days.
        </p>
        <Button
          size="sm"
          className="bg-brand-500 hover:bg-brand-600 text-white flex-shrink-0"
          asChild
        >
          <a href="/signup">Start free trial</a>
        </Button>
      </div>
    </div>
  );
}
```

---

## Conversion Checklist

Use this checklist for every marketing page:

### Above the Fold

- [ ] Clear value proposition headline (≤ 12 words)
- [ ] Supporting subline (≤ 25 words)
- [ ] Primary CTA button (high contrast, action verb)
- [ ] Secondary CTA (lower emphasis alternative)
- [ ] Product visual or screenshot

### Social Proof (at least 2)

- [ ] Logo bar or customer count
- [ ] Testimonial(s)
- [ ] Review rating (G2, Capterra, etc.)
- [ ] Metric counters

### Trust Signals (at least 1)

- [ ] Security badges
- [ ] "No credit card required" text
- [ ] Money-back guarantee
- [ ] SOC 2 / GDPR mention

### Conversion Points

- [ ] CTA appears at least 3 times on page
- [ ] CTA above the fold
- [ ] CTA after feature sections
- [ ] CTA in final section
- [ ] Sticky CTA or announcement bar

### Pricing (if applicable)

- [ ] Monthly/annual toggle
- [ ] "Most Popular" highlight
- [ ] Feature comparison table
- [ ] Enterprise "Contact sales" option
- [ ] Trust text below CTA

### Technical

- [ ] All CTAs are `<a>` links (not just buttons)
- [ ] Skip link present
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color contrast ≥ 4.5:1
- [ ] Reflows at 320px without horizontal scroll
- [ ] No keyboard traps
- [ ] Page has descriptive `<title>`
