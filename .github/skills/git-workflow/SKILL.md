---
name: git-workflow
description: >
  Git workflow expertise for branch management, commit crafting, PR creation,
  change analysis, and merge strategies. Provides decision frameworks for
  when to squash vs merge vs rebase, how to structure PR descriptions from
  diffs, and how to handle common Git scenarios (conflicts, dirty trees,
  force push recovery). Use this skill whenever shipping code to mainline.
agents: ["platform.git"]
---

# Git Workflow Skill

Expert knowledge for managing the full Git lifecycle: branching, committing, pull requests, code review workflow, and merging. This skill gives platform.git (and any future Git-related agent) deep context about Git operations, edge cases, and best practices.

## Change Analysis

### Reading a Diff Effectively

When analyzing changes for commit messages or PR descriptions:

1. **Start with `--stat`** to get the big picture (which files, how many lines)
2. **Group by directory/module** — changes in `src/auth/` are one story, `src/billing/` is another
3. **Identify the primary change** — what's the main intent? Everything else is supporting
4. **Flag new files** separately — they represent new capabilities
5. **Flag deleted files** — they represent removed capabilities or cleanup
6. **Flag renamed/moved files** — they represent restructuring
7. **Check config changes** — `package.json`, `tsconfig.json`, `vite.config.ts` changes often have cascading effects

### Commit Analysis Commands

```bash
# Overview of commits on this branch
git log main..HEAD --oneline --no-merges

# File-level summary
git diff main...HEAD --stat

# Full diff for detailed analysis
git diff main...HEAD

# Show only specific file types
git diff main...HEAD -- '*.ts' '*.tsx'

# Show renamed files
git diff main...HEAD --diff-filter=R --name-status

# Show only new files
git diff main...HEAD --diff-filter=A --name-only

# Show only deleted files
git diff main...HEAD --diff-filter=D --name-only
```

### Categorizing Changes for PR Descriptions

Group changes into these categories (skip empty ones):

| Category             | When to Use                                            |
| -------------------- | ------------------------------------------------------ |
| **New Features**     | New user-facing capabilities                           |
| **Bug Fixes**        | Corrections to existing behavior                       |
| **Refactoring**      | Code restructuring without behavior change             |
| **Configuration**    | Build, lint, CI, package changes                       |
| **Testing**          | New or updated tests                                   |
| **Documentation**    | README, inline docs, comments                          |
| **Dependencies**     | Added, removed, or updated packages                    |
| **Breaking Changes** | Anything that changes public API or requires migration |

## Branch Strategy Decision Framework

### When to Create a New Branch

- **Always** for any change that will become a PR
- **Never** commit directly to `main`
- If working on a long-running feature, consider sub-branches: `feat/auth/login`, `feat/auth/signup`

### Branch Lifecycle

```
main ──┬── feat/my-feature ──── PR ──── squash merge ──── main
       │
       └── (branch deleted after merge)
```

### Stale Branch Detection

If a branch is more than 2 weeks old with no recent commits:

- Check if it's still needed
- Rebase onto latest `main` if continuing work
- Delete if abandoned

## Merge Strategy Decision Framework

### Use Squash Merge (Default) When:

- PR has many small "WIP" or incremental commits
- You want a clean, single commit on `main`
- The individual commit history isn't valuable
- Most PRs should use this

### Use Merge Commit When:

- PR has carefully crafted, meaningful commits (each tells a story)
- Multiple authors contributed and attribution matters
- The branch represents a large feature with logical phases
- You want to preserve the exact development history

### Use Rebase When:

- PR is a single commit
- You want strictly linear history
- The change is small and self-contained

### Decision Flowchart

```
Is it a single commit?
  → Yes → Rebase
  → No → Are the individual commits meaningful?
    → Yes → Merge commit
    → No → Squash merge
```

## Conflict Resolution

### When Conflicts Occur

1. **Show the user which files conflict** — `git diff --name-only --diff-filter=U`
2. **Explain the nature of each conflict** — read the conflict markers and summarize
3. **Never auto-resolve** — always present options to the user
4. **After resolution**: verify the build still works

### Common Conflict Scenarios

| Scenario                       | Resolution Strategy                                        |
| ------------------------------ | ---------------------------------------------------------- |
| Both modified same line        | User must choose which version (or combine)                |
| One side deleted, other edited | Usually keep the edit; deletion was likely from a refactor |
| Package lock conflicts         | Delete lock file, reinstall: `rm pnpm-lock.yaml && pnpm i` |
| Auto-generated file conflicts  | Regenerate the file after resolving source conflicts       |
| Rebase conflicts (many)        | Consider merge instead, or resolve commit-by-commit        |

## PR Workflow

### Before Creating a PR

1. **Rebase onto latest main** — `git fetch origin && git rebase origin/main`
2. **Run linting** — `pnpm lint`
3. **Run type check** — `pnpm typecheck`
4. **Run tests** — `pnpm test`
5. **Review your own diff** — `git diff main...HEAD`

### Writing Effective PR Descriptions

- **Summary first**: What does this PR do and why? (1-2 sentences)
- **Break changes into sections**: Group by module/area
- **Reference files**: Mention specific files for significant changes
- **Include screenshots**: For UI changes (describe if you can't attach)
- **Testing instructions**: Step-by-step so a reviewer can verify
- **Call out risks**: Anything that's tricky, might break, or needs careful review

### PR Size Guidelines

| Size          | Lines Changed | Guidance                                    |
| ------------- | ------------- | ------------------------------------------- |
| **Small**     | < 100         | Ideal. Review in minutes                    |
| **Medium**    | 100-400       | Acceptable. Clear description needed        |
| **Large**     | 400-1000      | Consider splitting into smaller PRs         |
| **Too Large** | > 1000        | Must split. No reviewer can properly review |

## Error Recovery

### Undo Last Commit (Keep Changes)

```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)

```bash
git reset --hard HEAD~1
```

### Recover Deleted Branch

```bash
# Find the last commit SHA
git reflog

# Recreate the branch
git checkout -b <branch-name> <sha>
```

### Fix Wrong Branch Name

```bash
git branch -m <old-name> <new-name>
git push origin :<old-name> <new-name>
git push origin -u <new-name>
```

### Accidentally Committed to Main

```bash
# Create a branch with the commits
git branch <new-branch>

# Reset main to origin
git reset --hard origin/main

# Switch to the new branch
git checkout <new-branch>
```

## gh CLI Reference

### Essential Commands for platform.git

```bash
# Create PR
gh pr create --title "<title>" --body "<body>" --base main

# Create PR with web editor (fallback for complex descriptions)
gh pr create --title "<title>" --body-file pr-description.md --base main

# View PR status
gh pr status

# View specific PR
gh pr view <number>

# Check CI status
gh pr checks <number>

# Merge PR
gh pr merge <number> --squash --delete-branch
gh pr merge <number> --merge --delete-branch
gh pr merge <number> --rebase --delete-branch

# List open PRs
gh pr list

# Add reviewers
gh pr edit <number> --add-reviewer <user1>,<user2>

# Add labels
gh pr edit <number> --add-label "enhancement"
```

### Authentication Check

```bash
# Verify auth status
gh auth status

# Login if needed
gh auth login
```

## Security Considerations

- **Never commit secrets** — check for `.env` files, API keys, tokens in diffs
- **Review `.gitignore`** before first commit — ensure sensitive files are excluded
- **Use `--no-verify` sparingly** — pre-commit hooks exist for a reason
- **Sign commits** when required — `git commit -S`
- If secrets are accidentally committed: **rotate the secret immediately**, then remove from history with `git filter-branch` or BFG Repo Cleaner
