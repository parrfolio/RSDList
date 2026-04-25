---
description: "CRITICAL SAFETY RULE: Prevents agents from accidentally deleting, moving, or overwriting agent framework files during project scaffolding or builds"
applyTo: "**"
---

> **Deterministic enforcement:** These rules are enforced by the Copilot Hook `protected-files-guard.sh` in `.github/hooks/pre-tool-use/`. The hook blocks violations automatically before they execute.

# Protected Framework Files — DO NOT DELETE

## Core Rule (NON-NEGOTIABLE)

The following directories and files are part of the agent framework. They MUST NEVER be deleted, moved, overwritten, renamed, or modified by any agent for any reason during project scaffolding, initialization, or build operations.

This rule overrides any scaffolding tool's defaults, any "clean project" instinct, and any reorganization plan. **No exception. No workaround. No "I'll put them back later."**

## Protected Directories and Files

All contents within each directory are protected — every file, every subfolder, recursively.

| Path                              | Contents                                                  | Approximate Scale         |
| --------------------------------- | --------------------------------------------------------- | ------------------------- |
| `.github/agents/`                 | Agent definition files                                    | 33 files                  |
| `.github/instructions/`           | Coding standard instruction files                         | 25+ files                 |
| `.github/prompts/`                | Prompt templates                                          | 71 files                  |
| `.github/skills/`                 | Domain knowledge skill files                              | 24 directories, 79+ files |
| `.github/hooks/`                  | Copilot hooks (deterministic enforcement)                 | 10+ files                 |
| `.github/copilot.instructions.md` | Master instruction index                                  | 1 file                    |
| `.claude/commands/`               | SpecKit slash commands                                    | 9 files                   |
| `.specify/`                       | SpecKit runtime (scripts, templates, memory)              | 3 directories, 15+ files  |
| `.vscode/mcp.json`                | MCP server configuration                                  | 1 file                    |
| `.vscode/settings.json`           | VS Code / Copilot Chat settings                           | 1 file                    |
| `docs/`                           | Framework documentation                                   | 6 files                   |
| `.snow-patrol-manifest.json`      | Framework manifest (machine-readable protected file list) | 1 file                    |

## Prohibited Operations

The following operations are **strictly forbidden**:

- NEVER run scaffolding commands that write to the project root (e.g., `npx create-react-app .`, `npm init`, `yarn create`, `pnpm create`) — these overwrite `.github/` and `.vscode/`
- NEVER run `rm -rf .github`, `rm -rf .vscode`, `rm -rf .specify`, `rm -rf docs`, or any command that deletes protected directories
- NEVER overwrite `.vscode/settings.json` or `.vscode/mcp.json` without preserving existing content
- NEVER "clean up" or "reorganize" files in protected directories
- NEVER move protected directories to different locations
- NEVER use `git clean -fd` or `git checkout -- .github/` to reset framework files
- NEVER run commands with `--force` flags that could overwrite protected paths
- NEVER treat framework files as "stale", "unnecessary", or "leftover" — they are intentional

## Safe Scaffolding Patterns

When initializing a new application inside a framework-managed project, use these safe approaches:

### Target a subdirectory instead of root

```bash
# SAFE — scaffolds into a subdirectory, leaves root untouched
npx create-react-app ./app
npx create-vite ./client
npm init -w ./packages/api
```

### Create config files individually

Instead of running a full scaffolding CLI at root, create the config files one at a time:

- Create `package.json` manually with `npm init -y` (safe — only creates `package.json`)
- Create `vite.config.ts`, `tsconfig.json`, `next.config.js`, etc. individually
- Create `src/`, `app/`, or other source directories manually

### If scaffolding MUST happen at root

1. Back up all protected directories first
2. Run the scaffolding command
3. Restore protected directories from backup
4. Verify no framework files were lost

**This is a last resort. Prefer subdirectory scaffolding.**

## Detection

- If `.snow-patrol-manifest.json` exists in the project root, it lists all framework files. Check this manifest before any destructive operation.
- Before running ANY command that creates, deletes, or overwrites files in bulk, verify none of the protected paths will be affected.
- If an agent discovers that framework files are missing, it MUST **STOP** and alert the user — do NOT try to recreate them.

## What Agents MAY Do With Framework Files

- **READ** any framework file for context or reference — always permitted
- **platform.system-maintenance** MAY edit agent integration files (instruction indexes, agent registries, conductor.powder mappings) as part of system maintenance
- **conductor.powder** MAY edit plan files only
- **platform.agent-foundry** MAY create new agent files only

Normal implementation agents (engineering.implementation, frontend.implementation, quality.test-architecture, reliability.srre, etc.) should NEVER need to edit framework files. If an implementation task seems to require editing framework files, stop and ask the user.

## If Framework Files Are Accidentally Deleted

1. **STOP** all work immediately
2. **Alert the user** — explain which files are missing and what happened
3. The user can re-run `install.sh` from the framework source repository to restore framework files
4. Do NOT attempt to recreate framework files from memory — they may be incomplete, outdated, or incorrect
5. Do NOT continue building until framework files are confirmed restored
