---
description: "Design and implement a Firestore data model with security rules/policies"
agent: "conductor.powder"
---

# Design Data Model

You are designing a Firestore data model with security rules/access policies.

Read the backend skill at `.github/skills/backend/SKILL.md` for data modeling patterns specific to Firebase.

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.context** — Research existing data patterns in the codebase
2. **@engineering.implementation** — Implement the data model, types, and helpers
3. **@security.application** — Audit security rules/policies (mandatory)

## Data Modeling Patterns

- **Schema design**: Structure entities following Firestore best practices
- **Relationships**: Model relationships appropriate to the database paradigm
- **Multi-tenant**: Every record/document scoped to `tenantId`
- **Indexes**: Define indexes for common query patterns
- **Timestamps**: Use server-side timestamps for `createdAt`/`updatedAt`
- **Soft deletes**: `deletedAt` field instead of hard deletes (where applicable)

## Instructions

1. Research existing data models (architecture.context)
2. Design the data structure with:
   - TypeScript interfaces for all entity types
   - Zod schemas for validation
   - Path/table constants
3. Create security rules/access policies:
   - Tenant isolation (users can only access their tenant's data)
   - Role-based access (admin, editor, viewer)
   - Field-level validation
   - Write-once fields protection (createdBy, createdAt)
4. Write helper functions (converters, query builders)
5. Write tests for security rules/access policies
6. Invoke @security.application for security audit

## User Input

The data model I need: {{input}}
