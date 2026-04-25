---
description: "Draft Terms of Service, Privacy Policy, and Cookie Policy for a SaaS app"
agent: "conductor.powder"
---

# Draft Legal Documents

You are drafting legal documents for a SaaS application.

## Context

Use @conductor.powder to orchestrate:

1. **@platform.pce** — Draft all legal documents
2. **@architecture.exploration** — Explore codebase for data collection, analytics, and AI usage

## Documents Produced

1. **Terms of Service** (`legal/terms-of-service.md`)
   - Account terms and eligibility
   - Acceptable use policy
   - Subscription and payment terms (if Stripe)
   - Intellectual property
   - Limitation of liability
   - Termination and account deletion

2. **Privacy Policy** (`legal/privacy-policy.md`)
   - Data collected and purposes
   - Legal bases for processing
   - Third-party processors/subprocessors
   - Data retention schedule
   - User rights (access, deletion, portability)
   - Cookie usage
   - AI data usage (if applicable)

3. **Cookie Policy** (`legal/cookie-policy.md`)
   - Essential cookies
   - Analytics cookies
   - Marketing cookies
   - Cookie consent mechanism

## Compliance Regions

- GDPR (EU/UK)
- CPRA (California)
- CCPA
- General US state privacy laws

## Instructions

1. Explore codebase for: auth providers, analytics, tracking, cookies, AI features, subprocessors
2. Invoke @platform.pce with discovered context
3. If NEEDS INPUT: gather missing information and re-invoke
4. If HIGH RISK items flagged: surface to user for legal counsel review
5. Present final drafts with assumptions listed
6. Remind user: these are AI-generated drafts — legal counsel review is recommended

## User Input

{{input}}
