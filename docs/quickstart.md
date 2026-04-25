# Quickstart

Get Snow Patrol running in under 10 minutes.

---

## Install in 30 Seconds

Preview first, then install:

```bash
# Preview what will be installed (no files written)
./install.sh ~/Apps/my-project --dry-run

# Install for real
./install.sh ~/Apps/my-project
```

The installer presents a platform menu:

```text
Select target platform:
    1) ❆ CoCo CLI
    2) ❆ SnowWork
    3) Cursor
    4) Claude Code
    5) OpenAI Codex
    6) GitHub Copilot
    7) All
```

Pick your IDE. Choose `All` to support every platform simultaneously.

---

## Verify the Install

After install, confirm the framework landed:

```bash
# Check the manifest exists
cat .snow-patrol-manifest.json | jq '.files | length'

# Verify key directories (GitHub Copilot example)
ls .github/agents/ .github/instructions/ .github/skills/ .github/hooks/
```

You should see agent files (`.agent.md`), instruction files (`.instructions.md`), skill directories with `SKILL.md` files, and the hooks directory with `hooks.json`.

---

## Your First Task

1. **Open the workspace** in your platform (VS Code for GitHub Copilot, Cursor, Claude Code, etc.).

2. **Give a simple request** in the chat:

   > Add a hello world button to the homepage

3. **Watch the conductor work.** `conductor.powder` will:
   - Research the codebase via `architecture.exploration`
   - Draft a plan and ask for your approval
   - Delegate implementation to `frontend.implementation`
   - Run code review via `quality.code-review`
   - If UI was touched, run the accessibility gate (`frontend.accessibility`)
   - Present a summary and commit message

4. **Check the audit log** to see what happened:

   ```bash
   jq '.' .github/hooks/logs/audit.jsonl | tail -20
   ```

---

## When to Call Specialists Directly

Use `@agent-name` to bypass conductor routing for narrow, well-scoped asks:

- `@reliability.srre` — fix a specific bug
- `@documentation.technical-writer` — update documentation
- `@quality.test-architecture` — write tests for a module
- `@platform.git` — create a branch and commit

See [docs/available-agents.md](available-agents.md) for the full agent roster.

---

## When Things Go Wrong

See [docs/troubleshooting.md](troubleshooting.md) — covers hook denials, audit log inspection, timeout behavior, and common fixes.

---

## Next Steps

| Guide | What You'll Learn |
|-------|-------------------|
| [How to Set Up a New Project](how-to-setup-new-project.md) | The full 11-step workflow from idea to deployment |
| [Available Hooks](available-hooks.md) | How deterministic enforcement works |
| [Context Memory Guide](context-memory-guide.md) | How agents share and persist knowledge |
| [Available Agents](available-agents.md) | All 35 agents and their roles |
