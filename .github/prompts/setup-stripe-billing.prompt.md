---
description: "Set up Stripe billing with subscriptions, checkout, and customer portal"
agent: "conductor.powder"
---

# Set Up Stripe Billing

You are implementing Stripe billing for a SaaS application.

## Context

Use @conductor.powder to orchestrate:

1. **@billing.stripe** — Design billing architecture (Stripe objects, Firestore model, Cloud Functions, webhooks, entitlements)
2. **@security.application** — Security audit of billing functions and webhook handlers
3. **@platform.pce** — Update TOS/Privacy Policy with payment clauses
4. **@frontend.implementation** — Implement billing UI (checkout, portal, plan selection)

## Billing Stack

- **Stripe Checkout** — Hosted payment page
- **Stripe Billing** — Subscription management
- **Stripe Customer Portal** — Self-service plan changes, cancellation, payment methods
- **Webhooks** — Cloud Functions handling Stripe events
- **Firestore** — Billing state stored per-tenant

## Instructions

1. Gather requirements: pricing tiers, trial period, monthly/annual, B2C vs B2B
2. Invoke @billing.stripe to design the billing architecture:
   - Stripe Products and Prices
   - Firestore billing data model (tenant-scoped)
   - Cloud Functions API (create-checkout, create-portal, webhook handler)
   - Webhook event map (8+ events)
   - Entitlements model with enforcement points
   - UX handoff specs
3. Invoke @security.application to audit:
   - Webhook signature verification
   - Billing function auth/authorization
   - Data isolation (tenant-scoped billing)
4. Invoke @platform.pce to update legal docs:
   - Payment terms in TOS
   - Billing data in Privacy Policy
5. Invoke @frontend.implementation to build UI:
   - Pricing page with plan comparison
   - Checkout flow
   - Billing portal link
   - Plan upgrade/downgrade UI
   - Trial expiration notices

## User Input

{{input}}
