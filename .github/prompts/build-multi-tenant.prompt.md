---
description: "Implement multi-tenant architecture with workspace isolation"
agent: "conductor.powder"
---

# Build Multi-Tenant Architecture

You are implementing multi-tenant (workspace) isolation for a SaaS application.

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.engineer** — Design the multi-tenant architecture
2. **@engineering.implementation** — Implement backend (Firestore structure, Cloud Functions, auth claims)
3. **@frontend.implementation** — Implement frontend (workspace switcher, tenant-scoped UI)
4. **@security.application** — Security audit (mandatory — cross-tenant isolation is critical)

## Multi-Tenant Patterns

- **Tenant Model**: Shared database with tenant-scoped collections
- **Data Path**: `tenants/{tenantId}/[subcollections]`
- **Auth Claims**: `tenantId` in Firebase Auth custom claims
- **RBAC per Tenant**: owner, admin, editor, viewer roles
- **Workspace Switching**: Users can belong to multiple tenants
- **Invites**: Tenant admins invite users via email
- **Onboarding**: First user becomes tenant owner

## Security Requirements (Non-negotiable)

- Every Firestore rule checks `request.auth.token.tenantId == resource.data.tenantId`
- Every Cloud Functions endpoint validates tenantId from auth claims
- Users cannot access other tenants' data (test with emulator)
- Users cannot escalate their own role
- Tenant deletion cascades all subcollections
- Audit log for admin actions

## Instructions

1. Design tenant data model and collection hierarchy
2. Implement tenant CRUD Cloud Functions
3. Implement membership management (invite, accept, remove)
4. Set up Firestore security rules/policies with tenant isolation
5. Build workspace switcher UI
6. Implement tenant-scoped TanStack Query hooks
7. Write comprehensive emulator tests proving cross-tenant denial
8. Invoke @security.application security audit (mandatory)

## User Input

{{input}}
