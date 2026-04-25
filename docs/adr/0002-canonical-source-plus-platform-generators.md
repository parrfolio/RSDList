# ADR 0002: Canonical Source Plus Platform Generators

## Status

Accepted

## Context

Snow Patrol supports seven install targets: GitHub Copilot, Claude Code, Snowflake Cortex Code, Cursor, OpenAI Codex, Snowflake SnowWork, and All (combined). Each platform has its own directory conventions:

- GitHub Copilot: `.github/agents/`, `.github/instructions/`, `.github/hooks/hooks.json`
- Claude Code: `.claude/agents/`, `.claude/hooks/`, `.claude/settings.json`, root `CLAUDE.md`
- Cursor: `.cursor/rules/agents/`, `.cursor/rules/instructions/`, `.cursor/hooks.json`
- OpenAI Codex: `.codex/agents/`, `.codex/hooks/`, root `AGENTS.md`
- Snowflake Cortex Code: `.cortex/agents/`, `.cortex/hooks/`, `.cortex/settings.json`
- Snowflake SnowWork: `.cortex/` layout plus `.vscode/` and root `AGENTS.md`

Maintaining six parallel copies of every agent, instruction, skill, and hook file would create unsustainable divergence. A single change would require updating up to six variants and verifying each independently.

## Decision

Author all framework content in a single canonical format under `.github/`. The `install.sh` script generates platform-specific variants at install time by:

1. Copying canonical files to the platform's expected directory structure
2. Applying per-platform transforms (path rewrites in `@references`, hook config format conversion from `hooks.json` to `settings.json`, root-level `AGENTS.md` or `CLAUDE.md` generation)
3. Writing a `.snow-patrol-manifest.json` to track all installed files for clean uninstall

The canonical source lives in the Snow Patrol repository. Target projects receive generated output only.

## Consequences

**Benefits:**

- Single source of truth — one set of agent, instruction, skill, and hook files
- Six platforms supported from one codebase — new platforms require only a new transform block in `install.sh`
- Divergence is controlled — differences between platforms are explicit in the transform logic, not scattered across duplicated files
- Clean uninstall via manifest — `uninstall.sh` reads `.snow-patrol-manifest.json` and removes exactly what was installed

**Tradeoffs:**

- `install.sh` complexity — the installer is ~2,700 lines of bash handling seven platform targets, path mapping, `sed` transforms, and edge cases
- Platform drift risk — a new platform feature (e.g., Cursor adding native hook support) requires updating the installer; mitigated by `tests/install/test-platform-installs.sh` (123 assertions)
- BSD `sed` dependency — the installer currently uses `sed -i ''` (macOS); the CI regression runs on macOS for this reason
