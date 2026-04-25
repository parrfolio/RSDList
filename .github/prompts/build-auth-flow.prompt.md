---
description: "Implement authentication flow with Firebase Auth, RBAC, and tenant isolation"
agent: "conductor.powder"
---

# Build Authentication Flow

You are implementing authentication with Firebase Auth, role-based access control, and multi-tenant support.

Read the backend skill at `.github/skills/backend/SKILL.md` for auth patterns specific to Firebase.

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.context** — Research existing auth patterns
2. **@engineering.implementation** — Implement backend auth (Cloud Functions, RBAC claims/roles)
3. **@frontend.implementation** — Implement frontend auth (login, signup, profile)
4. **@security.application** — Security audit (mandatory for ALL auth work)

## Auth Standards

- **Providers**: Email/password + Google OAuth (minimum)
- **RBAC Claims/Roles**: `{ tenantId, role, permissions }` set via Cloud Functions
- **RBAC Roles**: owner, admin, editor, viewer (minimum)
- **Session**: Firebase Auth persistence with token refresh
- **Multi-tenant**: Users belong to tenants, auth claims scope all data access
- **Onboarding**: New user → create tenant → set claims → redirect to dashboard
- **Invite Flow**: Existing tenant invites user → user signs up → auto-joins tenant

## Security Requirements (security.application Gate)

- Cross-tenant access prevention
- Privilege escalation prevention (users can't modify their own claims)
- Auth token validation on every Cloud Functions endpoint
- Account deletion flow (GDPR compliance)
- Rate limiting on auth endpoints
- Brute force protection

## Instructions

1. Research existing auth patterns (architecture.context)
2. Design the auth flow (signup → onboarding → dashboard)
3. Implement RBAC claims/roles via Cloud Functions
4. Implement Firestore security rules/policies with claim-based access
5. Build frontend: login page, signup page, forgot password, profile
6. Implement auth context/provider with loading states
7. Add route guards for protected pages
8. Write tests proving cross-tenant denial
9. Invoke @security.application security audit (mandatory)

## User Input

{{input}}
