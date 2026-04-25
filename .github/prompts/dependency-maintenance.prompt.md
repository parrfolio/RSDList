---
description: "Update dependencies, fix vulnerabilities, and maintain the codebase"
agent: "conductor.powder"
---

# Dependency Update & Maintenance

You are performing routine codebase maintenance — updating dependencies, fixing vulnerabilities, and cleaning up.

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.exploration** — Scan current dependency state
2. **@engineering.implementation** — Implement updates and fixes
3. **@quality.code-review** — Review changes
4. **@security.application** — Security audit if security-related deps updated

## Maintenance Tasks

### Dependency Updates

- Run `pnpm outdated` to identify stale dependencies
- Separate updates into: patch (safe), minor (likely safe), major (breaking)
- Update patch/minor first, then major with careful testing
- Check changelogs for breaking changes before major updates
- Run full test suite after each update batch

### Security Vulnerabilities

- Run `pnpm audit` for known vulnerabilities
- Prioritize by severity: critical → high → moderate → low
- Update vulnerable packages or find alternatives
- If no fix available: document the risk and mitigation

### Code Health

- Remove unused dependencies (`depcheck`)
- Remove dead code and unused exports
- Update TypeScript to latest 5.x
- Update Node.js runtime (Cloud Functions)
- Clean up deprecated API usage

### Firebase Maintenance

- Update Firebase SDK versions
- Review and update Firestore indexes
- Check Cloud Functions runtime (ensure Node.js 20+)
- Review security rules for any deprecated patterns

## Instructions

1. Scan current dependency state (architecture.exploration)
2. Check for security vulnerabilities
3. Plan update strategy (patch → minor → major)
4. Implement updates in batches with test verification
5. Run full test suite after all updates
6. Security audit if security deps changed (security.application)
7. Review all changes (quality.code-review)
8. Update CHANGELOG.md

## User Input

{{input}}
