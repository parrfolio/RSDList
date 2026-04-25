---
name: CI/CD Pipelines
description: >
  Continuous integration and deployment pipeline design — GitHub Actions workflows,
  test gating, artifact management, deployment strategies (blue-green, canary),
  rollback procedures, and environment promotion. Use when setting up new
  pipelines, hardening existing ones, or diagnosing deployment failures.
agents: ["engineering.implementation", "reliability.srre", "platform.git", "architecture.engineer"]
tags: [ci-cd, github-actions, deployment, pipelines, release, rollback]
---

# CI/CD Pipelines

Pipelines are code. Pipelines are contracts. A good pipeline makes the path to production short, safe, and boring.

## Core Principles

1. **Every commit is a candidate** — Every main-branch commit could theoretically ship. CI verifies it can.
2. **Fast feedback beats exhaustive checks** — 5-minute CI beats 30-minute CI. Parallelize, cache, skip unnecessary work.
3. **Deterministic builds** — Same commit + same pipeline = same artifact. Pin versions. Lock dependencies.
4. **Forward-only, but always reversible** — Deploys go forward; problems are fixed with a new deploy. But rollback must be a one-click operation for emergencies.
5. **Environment parity** — Staging looks like production. Configuration differs, infrastructure does not.

## Pipeline Stages

A typical pipeline for a TypeScript/React/Firebase app:

```
┌─────────┐   ┌──────┐   ┌──────┐   ┌───────┐   ┌────────┐   ┌───────┐
│ Install │ → │ Lint │ → │ Type │ → │ Tests │ → │ Build  │ → │Deploy │
└─────────┘   └──────┘   └──────┘   └───────┘   └────────┘   └───────┘
     │            │         │           │            │            │
   cache      parallel   parallel    parallel    artifact      gated
```

### 1. Install

- Cache `node_modules` / pnpm store keyed on lockfile hash
- Use `--frozen-lockfile` (pnpm) / `npm ci` — fail if lockfile is out of sync

### 2. Lint / Format

- ESLint, Prettier, whatever you use — fail fast on style issues
- Run in parallel with typecheck, not after
- Prefer `eslint --max-warnings 0` to enforce zero-warning policy

### 3. Typecheck

- `tsc --noEmit` in parallel with lint
- Incremental builds with `tsBuildInfoFile` cached

### 4. Tests

- Unit tests: run on every PR, must pass
- Integration tests: run on every PR if fast (<5 min), else on main-only
- E2E tests: run on PR if critical paths affected; always on main before deploy
- Parallelize by sharding

### 5. Build

- Build production artifact once. Never rebuild in the deploy stage.
- Tag artifact with commit SHA: `app-abc1234.tar.gz`
- Store in a registry (GCR, ECR, GitHub Packages) or artifact store

### 6. Deploy

- Promote the **same artifact** through environments: staging → production
- Each environment is a separate GitHub Actions job with its own credentials
- Production deploy requires manual approval for high-risk services

## GitHub Actions patterns

### Reusable workflows

Extract shared pipeline logic:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    uses: ./.github/workflows/reusable-test.yml
    with:
      node-version: '20'
```

### Matrix builds

Test across Node versions / OSes:

```yaml
strategy:
  matrix:
    node-version: ['18', '20', '22']
    os: [ubuntu-latest, macos-latest]
```

### Caching

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'pnpm'
- run: pnpm install --frozen-lockfile
```

### Concurrency

Cancel superseded runs on the same branch:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
```

### Secrets

- Store in GitHub Actions secrets (repository or environment scoped)
- Use environment protection rules for production secrets (require approval)
- Never echo secrets. GitHub masks known secrets in logs but custom values leak.
- Rotate on any suspected exposure

## Deployment Strategies

### Rolling deploy (default)

- Replace instances N at a time
- Each new instance is health-checked before the next is rolled
- Good for stateless services; cheap; simple rollback

### Blue-green

- Two identical environments (blue = current, green = new)
- Deploy to green, run smoke tests, switch traffic
- Rollback = switch back to blue
- Good for services where version skew is dangerous

### Canary

- Deploy new version to N% of traffic (1% → 5% → 25% → 100%)
- Monitor error rate and latency at each step
- Auto-rollback if SLOs breach
- Good for high-traffic services where you want to catch issues early

### Feature flags

- Deploy code dark (disabled), turn on with a feature flag
- Decouples deploy from release
- Use LaunchDarkly, Unleash, or a homegrown table
- Gate new features behind flags for first week after launch

## Rollback

**Every deploy MUST be rollback-able in under 5 minutes.**

- Keep the previous N artifacts always available
- Rollback = redeploy previous artifact, not revert-and-rebuild
- Database migrations complicate rollback:
  - **Additive-only migrations**: add columns/tables, don't drop. Safe to roll back code without rolling back schema.
  - **Destructive migrations**: drop column, rename. Must be a two-step release: deploy code that works with both shapes, migrate, deploy code that assumes new shape.

## Environment promotion

```
feature branch → dev env (optional)
      ↓ PR merge
main branch → staging (auto-deploy)
      ↓ manual approval
         production (gated)
```

- Staging deploys on every main push — catches issues early
- Production requires approval from a human (or automated SLO check)
- Never deploy to production from a feature branch
- Never deploy to production without first deploying to staging

## Safety gates

Before production deploy, the pipeline must verify:
- [ ] All tests passing
- [ ] Security scan (npm audit, Snyk, GitHub security advisories) — no critical CVEs
- [ ] Type check passes
- [ ] Bundle size under budget (if applicable)
- [ ] Staging deploy succeeded and is healthy for N minutes
- [ ] Smoke tests pass in staging
- [ ] Changelog entry present (or documented exception)

## Post-deploy verification

After every production deploy:
- Automated smoke test hitting critical paths
- Error rate monitored for 15-30 minutes; auto-rollback if breaches threshold
- Deploy marker emitted to observability platform
- Team notified in chat with commit range and deployer identity

## Review checklist

- [ ] CI runs lint + typecheck + tests + build on every PR
- [ ] CI completes in under 10 minutes (15 max)
- [ ] Caching configured for dependencies and build artifacts
- [ ] Concurrency group cancels superseded runs
- [ ] Secrets stored in GitHub Actions secrets with environment scopes
- [ ] Production deploys gated by manual approval
- [ ] Rollback tested and documented (can you roll back right now?)
- [ ] Database migrations are additive-only or two-step
- [ ] Smoke tests run post-deploy in staging and production
- [ ] Deploy markers visible on observability dashboards
- [ ] Pipeline is itself code-reviewed (changes to .github/workflows require PR)
