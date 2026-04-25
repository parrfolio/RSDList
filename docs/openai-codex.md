# OpenAI Codex Setup

Use this guide after installing Snow Patrol with option `5) OpenAI Codex` or
`7) All`.

## What Codex Uses

Snow Patrol installs five Codex-facing surfaces:

- `AGENTS.md` — repo-level project instructions that Codex loads automatically
- `.codex/agents/` — Codex-native role files generated from Snow Patrol agents
- `.codex/hooks/` and `.codex/hooks.json` — native Codex hook scripts and hook registration
- `.agents/skills/` — repo-visible skills that Codex can surface during work
- `.codex/instructions/` and `.codex/prompts/` — reference libraries for
  deeper framework guidance

This split is intentional:

- `AGENTS.md` gives Codex the global project contract
- `.codex/agents/` gives Codex reusable role definitions such as
  `conductor.powder` or `frontend.implementation`
- `.codex/hooks/` gives Codex the same prompt-submit routing and Bash guard
  scripts Snow Patrol uses elsewhere
- `.agents/skills/` preserves Snow Patrol's skill-based workflow inside Codex

## Trust The Project Layer

Codex reads `AGENTS.md` directly, but project config under `.codex/` is handled
as a project layer. If Codex reports that project config is disabled or the role
files are not available, mark the repository as trusted in your Codex setup.

The practical check is simple:

- If `AGENTS.md` guidance appears but `.codex/agents/` roles do not, trust is
  the first thing to verify.
- If repo skills from `.agents/skills/` appear but role-based orchestration does
  not, trust is again the first thing to verify.

If `AGENTS.md` loads but hooks do not, check whether Codex has project hook
support enabled in your local client. Snow Patrol writes `.codex/hooks.json`,
but some Codex clients still gate hook execution behind a local feature flag or
trust setting.

## Recommended Starting Roles

Use these as the default entry points:

- `conductor.powder` for end-to-end orchestration
- `architecture.engineer` for architecture and scaffolding
- `frontend.implementation` for UI implementation
- `engineering.implementation` for backend and core logic
- `quality.code-review` for formal review passes

For broad tasks, start with `conductor.powder` and let the work stay organized
around Snow Patrol's normal plan -> implement -> review loop.

For plain-English prompts, Snow Patrol now also installs a prompt-submit routing
hook that advises Codex to start with `conductor.powder` first unless you
explicitly name a specialist agent or built-in task type yourself.

## How To Work In Codex

Recommended flow:

1. Install Snow Patrol with option `4` or `5`.
2. Open the project in Codex from the repository root.
3. Confirm `AGENTS.md` is being applied.
4. Confirm `.codex/hooks.json` is recognized by your Codex client.
5. Confirm repo skills from `.agents/skills/` are visible.
6. Start with `conductor.powder` for any non-trivial task.

When a task clearly matches a listed skill, open that skill's `SKILL.md` and
follow it. Snow Patrol's Codex install keeps the skill library in the repo so
the same specialized workflows stay available outside GitHub Copilot.

## All Mode

If you install with `5) All`, the same repository can serve:

- GitHub Copilot via `.github/` and `.vscode/`
- Claude Code via `CLAUDE.md` and `.claude/`
- Snowflake Cortex Code via `.cortex/`
- Cursor via `.cursor/`
- OpenAI Codex via `AGENTS.md`, `.codex/`, and `.agents/skills/`

Use `All` for shared templates, starter repos, or teams that standardize on the
same framework but use different AI clients.

## Hook Notes

Snow Patrol generates these Codex hook events where meaningful:

- `SessionStart`
- `UserPromptSubmit`
- `PreToolUse`
- `PostToolUse`
- `Stop`

Pre/post tool behavior is still the most Bash-oriented part of the Codex hook
surface. Treat it as useful parity for guard scripts and audit logging, not as a
claim of perfect runtime equivalence with GitHub Copilot.

## Current Limits

The Codex install is designed to preserve Snow Patrol's structure and guidance,
but not every client supports the exact same tool surface. Treat the Codex role
files as the closest native adaptation of the framework, not as a byte-for-byte
copy of the GitHub Copilot runtime.

If a workflow behaves differently in Codex than it does in Copilot, keep the
role names and the plan structure the same, then adjust the client-specific
execution details.
