---
description: "Initialize Firebase project with Firebase Auth, Firestore, Cloud Functions, and hosting"
agent: "conductor.powder"
---

# Backend Project Setup

You are configuring Firebase for a new or existing project.

Read the backend skill at `.github/skills/backend/SKILL.md` for setup patterns specific to Firebase.

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.engineer** — Scaffold project structure and configuration
2. **@engineering.implementation** — Implement setup, config files, and environment initialization
3. **@security.application** — Audit security rules/policies (mandatory)

The standard Firebase stack includes:

- **Firebase Auth** — Email/password, Google, GitHub providers
- **Firestore** — Database with security rules/access policies
- **Cloud Functions** — Serverless functions with TypeScript
- **Firebase Storage** — File storage with access controls
- **Hosting** — Static hosting with SPA rewrites

## Instructions

1. Initialize Firebase configuration files
2. Set up Firestore with security rules/access policies:
   - Tenant isolation patterns (if multi-tenant)
   - Role-based access control
   - Data validation rules
3. Scaffold Cloud Functions directory with TypeScript
4. Configure hosting for SPA (rewrite all routes to `index.html`)
5. Create local development/emulator configuration
6. Set up environment-based initialization config
7. Create auth context/provider for React using Firebase Auth
8. After setup, invoke @security.application to audit security rules/policies

## User Input

{{input}}
