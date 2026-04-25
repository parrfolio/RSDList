---
description: "Branch, commit, PR, and merge workflow using @platform.git — from working code to mainline"
agent: "conductor.powder"
---

# Ship Code

Use **@platform.git** to take your working code from the current branch all the way to mainline.

## What This Does

platform.git handles the full Git workflow:

1. **Create a branch** (if not already on one)
2. **Stage and commit** with a Conventional Commits message
3. **Push and open a PR** with a detailed, structured description
4. **Merge to mainline** after checks pass

Each step pauses for your approval before proceeding.

## Prerequisites

- `git` installed and configured
- `gh` CLI installed (`brew install gh`) and authenticated (`gh auth login`)
- Changes ready to commit (staged or unstaged)

## Instructions

### Quick Ship (Full Flow)

Tell @platform.git to take it all the way:

> @platform.git ship these changes — branch: `feat/{{input}}`, squash merge when ready

platform.git will:

1. Create the branch from latest `main`
2. Show you the diff and propose a commit message
3. Push and generate a comprehensive PR description
4. Merge after CI passes (with your approval)

### Step-by-Step

If you prefer to control each step:

**Branch only:**

> @platform.git create a branch for {{input}}

**Commit only:**

> @platform.git commit these changes

**PR only:**

> @platform.git open a PR

**Merge only:**

> @platform.git merge it

**Just describe:**

> @platform.git what changed since main?

## Conventions

platform.git follows the project's `git-workflow.instructions.md`:

- Branch names: `<type>/<short-description>` (e.g., `feat/user-auth`)
- Commits: Conventional Commits format
- PR descriptions: structured with Summary, Changes, How to Test, Checklist
- Default merge strategy: squash

## User Input

What to ship: {{input}}
