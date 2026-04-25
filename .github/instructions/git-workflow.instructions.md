---
description: "Git workflow conventions: branch naming, commit messages (Conventional Commits), PR descriptions, and merge strategy standards"
applyTo: "**/.gitignore, **/CHANGELOG.md, **/.github/workflows/**"
---

> **Deterministic enforcement:** Prohibited operations in this file are enforced by the Copilot Hook `git-safety-guard.sh` in `.github/hooks/pre-tool-use/`. Force push, branch deletion, commit message format, and branch naming are validated automatically.

# Git Workflow Conventions

Standards for branch naming, commit messages, pull request descriptions, and merge strategies. These conventions apply project-wide — every agent that produces commits, branch names, or PR content must follow them.

## Branch Naming

Use the pattern `<type>/<short-description>` with kebab-case descriptions:

```
feat/user-authentication
fix/login-redirect-loop
chore/update-dependencies
refactor/extract-auth-middleware
docs/api-reference
test/auth-edge-cases
ci/github-actions-cache
```

### Branch Types

| Type       | Purpose                            | Example                      |
| ---------- | ---------------------------------- | ---------------------------- |
| `feat`     | New feature or capability          | `feat/stripe-checkout`       |
| `fix`      | Bug fix                            | `fix/null-user-crash`        |
| `chore`    | Maintenance, deps, config          | `chore/bump-firebase-sdk`    |
| `refactor` | Code restructuring (no behavior Δ) | `refactor/split-auth-hooks`  |
| `docs`     | Documentation only                 | `docs/firestore-rules-guide` |
| `test`     | Adding or updating tests           | `test/subscription-webhook`  |
| `ci`       | CI/CD pipeline changes             | `ci/add-preview-deploy`      |
| `style`    | Formatting, whitespace (no logic)  | `style/lint-fixes`           |
| `perf`     | Performance improvement            | `perf/lazy-load-dashboard`   |

### Rules

- Always branch from the latest default branch (`main`)
- Keep descriptions short (2-4 words)
- Use kebab-case, no uppercase, no special characters
- Delete branches after merge

## Commit Messages

Follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Format Rules

- **type**: Required. One of: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`, `style`, `perf`, `build`
- **scope**: Optional but encouraged. The affected area (e.g., `auth`, `api`, `ui`, `billing`, `firestore`)
- **description**: Required. Imperative mood, lowercase, no period, max 72 characters
- **body**: Optional. Wrap at 72 characters. Explain _what_ and _why_, not _how_
- **footer**: Optional. `BREAKING CHANGE:` for breaking changes. `Closes #123` for issue references

### Examples

```
feat(auth): add Google OAuth login flow

Implements Firebase Auth with Google provider. Adds sign-in button
to the login page and redirect handling after successful auth.

Closes #42
```

```
fix(firestore): prevent duplicate writes on optimistic update retry

The mutation hook was retrying without checking if the previous
write had already succeeded, causing duplicate documents.
```

```
chore(deps): bump firebase to 11.2.0
```

```
refactor(hooks): extract useSubscription from useBilling

Split the billing hook into focused hooks following single
responsibility. No behavior changes.
```

### What NOT to Do

- `Update stuff` — vague, no type
- `Fixed the bug.` — period, past tense, no scope
- `feat: Added user authentication, updated tests, fixed linting` — multiple concerns in one commit
- `WIP` — never commit work-in-progress to shared branches

## Pull Request Descriptions

Every PR must use this structured template:

```markdown
## Summary

[1-2 sentence overview of what this PR accomplishes and why]

## Changes

### [Area/Module 1]

- Description of change with file reference
- Description of change with file reference

### [Area/Module 2]

- Description of change with file reference

## Breaking Changes

[List any breaking changes, or "None"]

## How to Test

1. [Step-by-step testing instructions]
2. [Include setup steps if needed]
3. [Cover the happy path and edge cases]

## Checklist

- [ ] Code follows project conventions
- [ ] Types are strict (no `any`)
- [ ] Tests added/updated
- [ ] Documentation updated (if applicable)
- [ ] No unintended file changes
- [ ] Accessibility verified (if UI changes)
```

### PR Title Format

Use the same Conventional Commits format: `<type>(<scope>): <description>`

Example: `feat(auth): add Google OAuth login flow`

### PR Description Rules

- **Summary**: Always present. Concise. States the _what_ and _why_
- **Changes**: Grouped by area/module. Reference specific files
- **Breaking Changes**: Explicit. If none, say "None"
- **How to Test**: Step-by-step. A reviewer should be able to follow them exactly
- **Checklist**: All items checked before requesting review

## Merge Strategy

### Default: Squash Merge

Use squash merge for most PRs. This produces a clean, linear history on `main`:

```bash
gh pr merge <number> --squash --delete-branch
```

### When to Use Merge Commit

Use merge commits when preserving the full commit history matters:

- Large features with meaningful incremental commits
- Multi-author PRs where attribution matters

```bash
gh pr merge <number> --merge --delete-branch
```

### When to Use Rebase

Use rebase for small, single-commit PRs to keep history strictly linear:

```bash
gh pr merge <number> --rebase --delete-branch
```

### Post-Merge Cleanup

After any merge:

1. Delete the remote branch (handled by `--delete-branch`)
2. Switch to `main` locally: `git checkout main`
3. Pull latest: `git pull origin main`
4. Delete local branch: `git branch -d <branch-name>`

## Prohibited Operations

- **NEVER force push to `main`** or the default branch
- **NEVER commit directly to `main`** — always use a branch + PR
- **NEVER merge with failing CI checks** (if checks are configured)
- **NEVER merge without a PR description** — even for small changes
- **NEVER delete the default branch**
- **NEVER use `--force`** on shared branches without explicit team approval
