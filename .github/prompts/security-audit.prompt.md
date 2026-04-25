---
description: "Run a comprehensive security audit on Firestore rules/policies, Cloud Functions, and auth"
agent: "conductor.powder"
---

# Security Audit

You are performing a comprehensive security audit of the application.

## Context

Use @conductor.powder to orchestrate:

1. **@security.application** — Firebase security audit (mandatory PASS/FAIL gate)
2. **@engineering.implementation** — Implement security fixes for any findings

## security.application Audit Scope (10 Sections)

1. **Authentication** — Token verification, provider configuration, session management
2. **Authorization** — RBAC enforcement, custom claims validation, privilege escalation prevention
3. **Firestore Rules** — Tenant isolation, field validation, write-once protection, data access patterns
4. **Cloud Functions** — Input validation, auth checks, rate limiting, error handling
5. **Multi-Tenant Isolation** — Cross-tenant data access prevention (emulator-tested)
6. **App Check** — Attestation enforcement, replay protection
7. **Credential Management** — API keys, secrets, environment variables
8. **Rate Limiting & Abuse Prevention** — Per-user limits, cost attack prevention
9. **Audit Logging** — Admin action trails, append-only log protection
10. **Data Lifecycle** — PII handling, deletion flows, GDPR compliance

## Severity Levels

- **CRITICAL**: Must fix before deploy (data breach risk)
- **HIGH**: Must fix within 24 hours
- **MEDIUM**: Fix in current sprint
- **LOW**: Track as technical debt

## Instructions

1. Invoke @security.application with the full codebase scope
2. If FAIL (any CRITICAL or HIGH findings):
   - Create remediation tasks
   - Invoke @engineering.implementation to implement fixes
   - Re-invoke @security.application until PASS
3. Present the audit report with all findings and their status
4. No security-relevant code can be committed without security.application PASS

## User Input

{{input}}
