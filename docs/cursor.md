# Cursor Setup

Use this guide after installing Snow Patrol with option `4) Cursor` or
`7) All`.

## What Cursor Uses

Snow Patrol installs these Cursor-facing surfaces:

```text
AGENTS.md                    ← Repo orientation
.cursor/
  rules/                     ← Always-on standards only
    snow-patrol.mdc          ← Project guide
    instructions/            ← 27 file-scoped coding standards
    hooks/                   ← Hook enforcement rules
  agents/                    ← 35 specialist delegates
  skills/                    ← 24 domain knowledge skills
  prompts/                   ← 71 prompt templates
  hooks/                     ← Automation scripts
  hooks.json                 ← Hook configuration
  mcp.json                   ← MCP server configuration
docs/                        ← Framework documentation
.specify/                    ← SpecKit runtime
```

## What Goes Where

Each surface has a distinct purpose:

- **AGENTS.md** — Broad repo briefing. How to set up, key commands,
  architecture map, what good output looks like.
- **Rules** (`.cursor/rules/`) — Static, always-on. Only file-scoped coding
  standards (instructions) and hook enforcement. Small and durable. Not a
  dumping ground.
- **Agents** (`.cursor/agents/`) — Specialist delegates. Invoke with
  `@agent-name`. Frontend, backend, testing, docs, security, design, etc.
- **Skills** (`.cursor/skills/`) — Dynamic knowledge. Loaded on demand when
  relevant. Domain expertise like design systems, Figma workflows, git
  workflow, test engineering.
- **Prompts** (`.cursor/prompts/`) — Loose templates. One-off requests. If
  used repeatedly, promote to a skill.
- **Hooks** (`.cursor/hooks/`) — Automation before/after actions. Pre-tool-use
  guards, audit logging, session management.
- **MCP** (`.cursor/mcp.json`) — External tools and systems. Figma, shadcn,
  Radix, Context7, Linear.

## Decision Framework

Use this to decide where something belongs:

| Question                                | Answer                 |
| --------------------------------------- | ---------------------- |
| Should this happen every time?          | **Rule**               |
| Should I invoke this by name?           | **Skill** or **Agent** |
| Does this need a specialist?            | **Agent**              |
| Should this run automatically?          | **Hook**               |
| Is this just wording I paste sometimes? | **Prompt**             |

## Recommended Starting Agents

Use these as the default entry points:

- `@conductor.powder` for end-to-end orchestration
- `@frontend.implementation` for UI implementation
- `@engineering.implementation` for backend and core logic
- `@quality.code-review` for formal review passes
- `@frontend.design-system` before non-trivial UI work

For broad tasks, start with `@conductor.powder` and keep the work organized
around Snow Patrol's usual plan → implement → review loop.

## How To Work In Cursor

Recommended flow:

1. Install Snow Patrol with option `4` or `6`.
2. Open the project in Cursor from the repository root.
3. Confirm `.cursor/rules/snow-patrol.mdc` is loaded.
4. Let file-scoped instruction rules in `.cursor/rules/instructions/` apply
   automatically based on matching globs.
5. Use `@conductor.powder` for non-trivial work and `@`-mention specialist
   agents when the task is clearly scoped.
6. Open `.cursor/skills/<skill>/SKILL.md` when a skill references deeper
   knowledge.

## MCP Configuration

Cursor supports project-level MCP configuration in `.cursor/mcp.json`.

Snow Patrol copies the existing MCP server catalog there for Cursor installs, so
the same Figma, shadcn, Radix, and other MCP integrations remain available in a
Cursor-native location.

If you need to customize or troubleshoot MCP servers in Cursor, edit
`.cursor/mcp.json`.

## Hooks and Enforcement

Snow Patrol installs native Cursor hooks that mechanically block violations at
runtime — the same deterministic enforcement that GitHub Copilot provides.

### Native Hooks (`.cursor/hooks.json`)

The installer copies all hook scripts to `.cursor/hooks/` and generates a
`.cursor/hooks.json` configuration that Cursor's hook runtime loads
automatically. These hooks run real shell scripts that can deny tool calls:

| Hook Event           | Scripts                           | Purpose                                                                     |
| -------------------- | --------------------------------- | --------------------------------------------------------------------------- |
| `preToolUse`         | 6 guards                          | Block protected file edits, heredoc abuse, git safety violations, etc.      |
| `postToolUse`        | audit-logger                      | Append-only audit trail of all tool invocations                             |
| `sessionStart`       | context-loader                    | Auto-detect SpecKit artifacts and project context                           |
| `sessionEnd`         | session-summary                   | Generate session summary from audit log                                     |
| `beforeSubmitPrompt` | conductor-routing, prompt-capture | Advisory conductor-first routing plus prompt capture for scope verification |
| `subagentStart`      | subagent-context                  | Inject delegated-scope and reporting guidance into subagents at launch       |
| `subagentStop`       | subagent-stop-guard               | Block empty or placeholder-only subagent completions                        |

A compatibility layer (`.cursor/hooks/lib/cursor-compat.sh`) translates between
Cursor's and Copilot's hook I/O formats, so the same guard scripts work in both
environments unchanged.

Prompt-submit routing happens before any subagent lifecycle behavior. Broad
requests are nudged through `@conductor.powder`, while explicit specialist asks
still opt out cleanly.

The installer maps all canonical hook events — including `subagentStart` and
`subagentStop` lifecycle hooks — into `.cursor/hooks.json`, giving Cursor the
same subagent guardrails as Claude and Cortex installs.

You can verify hooks are loaded in **Cursor Settings → Hooks**. The
"Configured Hooks" section should show all hooks from
`.cursor/hooks.json`.

### Supplementary Rules (`.cursor/rules/hooks/`)

In addition to native hooks, always-applied `.mdc` rules reinforce the same
constraints at the AI prompt level:

- **no-heredoc-guard** — prevents file corruption from heredoc/redirect patterns
- **protected-files-guard** — prevents deletion of framework files
- **git-safety-guard** — enforces conventional commits and safe git operations
- **conductor-delegation-guard** — ensures the conductor only delegates
- **completion-file-guard** — validates scope verification in completion files
- **mandatory-ui-gates-guard** — requires Phase Gate Receipt tables

These rules provide defense-in-depth: native hooks block violations
deterministically, and the `.mdc` rules ensure the AI is also instructed to
follow the constraints proactively.

## All Mode

If you install with `7) All`, the same repository can serve:

- GitHub Copilot via `.github/` and `.vscode/`
- Claude Code via `CLAUDE.md` and `.claude/`
- Snowflake Cortex Code via `.cortex/`
- Snowflake SnowWork via `AGENTS.md`, `.cortex/`, and `.vscode/`
- Cursor via `.cursor/`
- OpenAI Codex via `AGENTS.md`, `.codex/`, and `.agents/skills/`

Use `All` for shared templates, starter repos, or teams that standardize on the
same framework but use different AI clients.
