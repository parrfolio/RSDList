---
description: "Implement transactional email system with templates and delivery tracking"
agent: "conductor.powder"
---

# Build Email System

You are setting up a transactional email system.

## Context

Use @conductor.powder to orchestrate:

1. **@engineering.implementation** — Implement email Cloud Functions
2. **@frontend.implementation** — Email template design (if HTML templates)
3. **@security.application** — Security audit (PII in emails, API keys)
4. **@platform.pce** — Privacy consideration for email data

## Email Categories

### Transactional (required)

- Welcome / email verification
- Password reset
- Workspace invitation
- Subscription confirmation / cancellation
- Payment receipt / failed payment

### Notification (optional)

- Activity digests
- Feature announcements
- Usage alerts (approaching limits)

## Implementation Stack

- **Trigger**: Cloud Functions (Firestore triggers or callable)
- **Delivery**: Firebase Extensions or SendGrid/Resend
- **Templates**: HTML email templates with dynamic content
- **Tracking**: Sent/delivered/opened/bounced status in Firestore

## Email Standards

- Responsive HTML (600px max width, table-based layout)
- Plain text fallback for every HTML email
- Unsubscribe link on all non-transactional emails
- From address: `noreply@yourdomain.com` or branded sender
- SPF/DKIM/DMARC configured
- PII minimization (don't include sensitive data in email bodies)

## Instructions

1. Define email types and triggers
2. Set up email delivery service (Firebase Extension or third-party)
3. Create HTML email templates
4. Implement Cloud Functions triggers
5. Add delivery tracking in Firestore
6. Write tests for email triggers
7. Security audit (security.application — API keys, PII handling)
8. Privacy review (platform.pce — email data in privacy policy)

## User Input

{{input}}
