---
description: "Set up CI/CD pipeline with Firebase deployment"
agent: "conductor.powder"
---

# Set Up CI/CD & Deployment

You are configuring continuous integration, deployment, and Firebase hosting.

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.context** — Research current deployment setup
2. **@engineering.implementation** — Implement CI/CD configuration
3. **@security.application** — Security audit (secrets, permissions)

## CI/CD Stack

- **CI**: GitHub Actions
- **Hosting**: Firebase Hosting
- **Functions**: Cloud Functions deployment
- **Preview**: Firebase Hosting preview channels for PRs

## Pipeline Stages

### On Pull Request

1. Install dependencies (`pnpm install --frozen-lockfile`)
2. Type check (`tsc --noEmit`)
3. Lint (`eslint`)
4. Unit tests (`vitest run`)
5. Build (`vite build`)
6. Deploy to preview channel (Firebase Hosting)
7. Post preview URL as PR comment

### On Merge to Main

1. All PR checks pass
2. Build production bundle
3. Deploy Firestore security rules/policies
4. Deploy Cloud Functions
5. Deploy to Firebase Hosting (production)
6. Run smoke tests against production
7. Post deployment summary

## Security Requirements

- Firebase service account key stored as GitHub Secret
- Environment variables for each environment (dev, staging, prod)
- No secrets in CI logs
- Branch protection rules on main
- Required status checks before merge

## Instructions

1. Research current deployment setup (architecture.context)
2. Create GitHub Actions workflow files:
   - `.github/workflows/ci.yml` (PR checks)
   - `.github/workflows/deploy.yml` (production deployment)
3. Configure Firebase hosting preview channels
4. Set up environment variables for each stage
5. Add build caching for faster CI
6. Security audit of CI/CD secrets and permissions (security.application)
7. Document deployment process

## User Input

{{input}}
