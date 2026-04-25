---
name: Security Hardening
description: >
  Application security hardening — OWASP Top 10 mitigation, input validation,
  authentication, authorization, secrets management, dependency security,
  and secure defaults. Use when building new features, reviewing existing code,
  or responding to security findings.
agents: ["security.application", "engineering.implementation", "architecture.engineer", "quality.code-review"]
tags: [security, owasp, authentication, authorization, validation, secrets]
---

# Security Hardening

Defensive patterns for building and reviewing secure applications. Covers OWASP Top 10 and production-grade security hygiene.

## Core Principles

1. **Defense in depth** — No single control should be the only thing between an attacker and data. Stack validation, authorization, and auditing.
2. **Least privilege** — Every user, service, and process gets the minimum permissions required. No broad admin tokens.
3. **Fail closed** — On error or ambiguity, deny. Never default to "allow" on an exception.
4. **Validate at boundaries** — Every input from outside the trust boundary is hostile until proven otherwise.
5. **Secrets are poison** — Treat secrets with the same care as production data. Never log them, never commit them, rotate them regularly.

## OWASP Top 10 (2021) — Quick Reference

### A01: Broken Access Control
- **Never trust client-provided IDs.** Always verify the authenticated user owns or may access the resource.
- Implement authorization at the data layer (Firestore rules, RLS policies) AND the application layer. Two gates.
- Test: try accessing another user's resource by changing the ID in the request. Must return 403/404.

```typescript
// BAD — trusts client
app.get('/orders/:id', (req, res) => {
  const order = db.orders.get(req.params.id);
  res.json(order);
});

// GOOD — verifies ownership
app.get('/orders/:id', requireAuth, async (req, res) => {
  const order = await db.orders.get(req.params.id);
  if (!order || order.userId !== req.user.id) return res.sendStatus(404);
  res.json(order);
});
```

### A02: Cryptographic Failures
- Use TLS 1.3 minimum for all traffic. Redirect HTTP → HTTPS at the edge.
- Hash passwords with `argon2id` (preferred) or `bcrypt` (cost ≥12). Never MD5, SHA1, plain SHA256.
- Encrypt sensitive data at rest with AES-256-GCM. Use a KMS (Cloud KMS, AWS KMS) for key management.
- Generate random tokens with `crypto.randomUUID()` or `crypto.getRandomValues()`. Never `Math.random()`.

### A03: Injection
- **Parameterized queries only.** Never concatenate user input into SQL/NoSQL queries.
- For shell commands, use `spawn` with an args array, never `exec` with a string.
- For HTML output, use framework-native escaping (React auto-escapes, but `dangerouslySetInnerHTML` bypasses it).
- Validate against a whitelist schema (zod, joi) at every boundary.

### A04: Insecure Design
- Threat model new features before building. Ask: "What could an attacker do with this?"
- Separate auth, authz, and business logic layers. Don't conflate them.
- Rate limit every write endpoint. Rate limit read endpoints that expose user enumeration.

### A05: Security Misconfiguration
- Disable debug mode in production. No stack traces to clients.
- Remove default credentials, unused features, and sample files.
- Set security headers: `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`.
- Firestore/RLS: default-deny, then add explicit allows.

### A06: Vulnerable Components
- Run `npm audit` / `pnpm audit` on every build. Block releases on critical CVEs.
- Subscribe to Dependabot / Renovate for automated updates.
- Pin versions in production builds. Use lockfiles (`pnpm-lock.yaml`).
- Audit transitive dependencies, not just direct ones.

### A07: Identification and Authentication Failures
- Enforce password strength: min 12 chars, check against HaveIBeenPwned.
- Rate limit login endpoints (5 attempts / 15 min per IP+username).
- Implement MFA for high-value accounts.
- Sessions: short-lived access tokens (15 min) + long-lived refresh tokens (stored httpOnly+secure+sameSite=strict).
- On logout, invalidate the refresh token server-side. Don't just clear the cookie.

### A08: Software and Data Integrity Failures
- Verify package signatures when available.
- Don't deserialize untrusted data without validation.
- Sign webhooks and verify signatures before processing (Stripe, GitHub webhooks).
- Use SRI (Subresource Integrity) for CDN-hosted scripts.

### A09: Security Logging and Monitoring Failures
- Log: auth success/failure, access control denials, input validation failures, privilege changes.
- Never log: passwords, tokens, PII, session cookies, full credit card numbers.
- Include: timestamp, userId (if authenticated), IP, requestId, action, outcome.
- Alert on: spike in 401/403, repeated failed logins, new admin grants.

### A10: Server-Side Request Forgery (SSRF)
- Block requests to internal IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, localhost).
- Whitelist allowed external domains for webhooks/callbacks.
- Disable HTTP redirects in server-side HTTP clients, or cap at 1-2.

## Input Validation

Validate at every trust boundary with a schema library (zod, joi, pydantic):

```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(100),
  age: z.number().int().min(13).max(150),
});

app.post('/users', (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ error: { code: 'VALIDATION_FAILED', issues: result.error.issues } });
  }
  // ... result.data is now type-safe
});
```

**Rules:**
- Whitelist, don't blacklist
- Enforce min AND max lengths
- Reject unknown fields (`.strict()` in zod)
- Validate nested objects recursively

## Secrets Management

- Never commit secrets. Use `.env` for local dev, a secrets manager (Google Secret Manager, AWS Secrets Manager, Doppler) for production.
- Rotate secrets quarterly. Rotate immediately on employee departure.
- Scope secrets: a service should only access secrets it needs.
- Audit secret access. Alert on unusual patterns.
- If a secret is exposed (git commit, log leak): rotate immediately, audit usage, notify security team. Don't wait.

## Authentication Patterns

- **OAuth2 / OIDC** for SSO. Don't roll your own.
- **Firebase Auth** / **Auth0** / **Clerk** for hosted auth. Self-hosted only with a security review.
- Use short-lived JWTs for API auth. Validate signature, issuer, audience, expiry on every request.
- For server-to-server: mTLS, signed requests (HMAC), or OIDC client credentials flow.

## Authorization Patterns

- **RBAC** (roles) for simple cases. **ABAC** (attributes) for fine-grained.
- Define permissions at the action level (`orders:read`, `orders:delete`), not the UI level.
- Check authorization at the data layer (Firestore rules, RLS) as the last line of defense.
- Avoid "admin" catch-all roles. Decompose into specific permissions.

## Review checklist

- [ ] All inputs validated against a schema at the boundary
- [ ] All queries parameterized (no string concat)
- [ ] Authorization checked on every endpoint that accesses user-specific data
- [ ] Secrets loaded from env/secret manager, never hardcoded
- [ ] Rate limits on write endpoints and login
- [ ] Security headers set at the edge
- [ ] Dependency audit passing (no critical CVEs)
- [ ] No PII in logs or error messages
- [ ] TLS 1.3 enforced, HTTP redirected to HTTPS
- [ ] Webhook signatures verified before processing
