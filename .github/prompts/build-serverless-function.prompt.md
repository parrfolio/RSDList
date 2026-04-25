---
description: "Create a Cloud Functions endpoint with auth, validation, rate limiting, and tests"
agent: "conductor.powder"
---

# Build Serverless Function

You are creating a Cloud Functions endpoint with proper security and testing.

Read the backend skill at `.github/skills/backend/SKILL.md` for serverless function patterns specific to Firebase.

## Context

Use @conductor.powder to orchestrate:

1. **@engineering.implementation** — Implement the function with TDD
2. **@security.application** — Security audit (mandatory for all serverless functions)

## Serverless Function Standards

- **Runtime**: TypeScript strict mode
- **Validation**: Zod schemas for all inputs
- **Auth**: Verify Firebase Auth token on every callable/HTTP function
- **Authorization**: Check user roles/permissions after auth
- **Rate Limiting**: Implement per-user rate limiting for public endpoints
- **Error Handling**: Structured error responses
- **Logging**: Structured logging
- **Multi-tenant**: Scope all data access to `tenantId` from auth claims
- **Idempotency**: Design for safe retries where applicable

## Instructions

1. Define the function's Zod input/output schemas
2. Write tests first (TDD)
3. Implement the function:
   - Auth verification via Firebase Auth
   - Input validation
   - Authorization check
   - Business logic
   - Structured error handling
4. Run tests to verify
5. Invoke @security.application security audit (mandatory gate)
6. Document the function in API docs

## User Input

The serverless function I need: {{input}}
