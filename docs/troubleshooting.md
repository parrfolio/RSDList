# Troubleshooting

Practical solutions for common Snow Patrol issues. Every recommendation includes a command you can copy-paste.

---

## When a Hook Denies Your Tool Call

The `preToolUse` event runs a single dispatcher (`.github/hooks/pre-tool-use/dispatcher.sh`) that evaluates six guards in sequence. The first guard to deny wins — later guards don't run.

**Guard execution order:**

| # | Guard | What It Blocks |
|---|-------|----------------|
| 1 | `protected-files-guard` | Modifications to framework files (`.github/`, `.vscode/`, `.specify/`, `docs/`) |
| 2 | `no-heredoc-guard` | Heredoc/redirect file creation in terminal (`cat > file << EOF`, `echo > file`) |
| 3 | `git-safety-guard` | Force push, deleting main/master, non-conventional commit messages, invalid branch names |
| 4 | `conductor-delegation-guard` | Conductor writing code directly (opt-in, see below) |
| 5 | `completion-file-guard` | Phase/plan completion files missing required sections |
| 6 | `mandatory-ui-gates-guard` | Phase completion files missing Phase Gate Receipt |

**Find the denial in the audit log:**

```bash
# Show all denied tool calls
jq 'select(.result == "denied")' .github/hooks/logs/audit.jsonl

# Show denied tool calls with the denial reason
jq 'select(.event == "DENY")' .github/hooks/logs/audit.jsonl
```

The denial message tells you which guard fired and why. Fix the underlying issue (e.g., use file editing tools instead of heredocs, use conventional commit format) rather than working around the guard.

---

## When a Subagent's Completion Is Blocked

The `subagentStop` hook (`.github/hooks/subagent-stop/subagent-stop-guard.sh`) blocks subagents from stopping with:

- **Empty completion** — the subagent returned nothing
- **Placeholder-only completion** — the subagent returned only a token word like "Done", "OK", "Complete", "Fixed", "Handled", "Resolved", "Working on it", or "N/A"

The guard exists because empty handbacks provide no value to the conductor — it needs concrete results, file lists, test outcomes, or documented blockers.

**How to fix:**

Return a structured completion that includes at least one of:

- Files created or modified
- Test results or coverage changes
- Specific findings or blockers
- A summary of what was accomplished and what remains

```bash
# Check if your subagent completions are being blocked
jq 'select(.event == "subagent_stop_blocked")' .github/hooks/logs/audit.jsonl
```

---

## When the Conductor Refuses to Act Directly

The `conductor-delegation-guard` (Guard 4 in the dispatcher) enforces the rule that `conductor.powder` must delegate all file creation and editing to subagents. This guard is **opt-in** — it only activates when:

- The environment variable `SNOW_PATROL_CONDUCTOR_SESSION=true` is set, **OR**
- A `.conductor-session` file exists in the project root

When active, the conductor can only:

- **Read** plan files, spec files, agent definitions, and `Copilot-Processing.md`
- **Write** plan files (`plans/*-plan.md`), phase completions, `agent-registry.json`, and `Copilot-Processing.md`
- **Run** `git status`, `git log --oneline`, `git diff --stat`, and `ls`/`find` on `plans/` and `agents/`

Everything else must be delegated to a subagent via `runSubagent`.

For the full delegation rule, see `.github/instructions/conductor-discipline.instructions.md`.

```bash
# Check if conductor delegation is active
echo $SNOW_PATROL_CONDUCTOR_SESSION
ls -la .conductor-session 2>/dev/null

# Disable conductor delegation (remove the activation signal)
unset SNOW_PATROL_CONDUCTOR_SESSION
rm -f .conductor-session
```

---

## When install.sh Overwrites a Customization

The installer overwrites files by default. To avoid surprises:

**Preview first:**

```bash
./install.sh ~/Apps/my-project --dry-run
```

This shows every file that would be written without modifying anything.

**Check what's protected:**

The `.snow-patrol-manifest.json` file (written at install time) lists all framework-managed files. Anything in the manifest is considered framework-owned and will be overwritten on re-install.

```bash
# List all framework-managed files
jq -r '.files[]' .snow-patrol-manifest.json

# Count framework files
jq '.files | length' .snow-patrol-manifest.json
```

**Clean removal:**

```bash
# Preview what uninstall would remove
./uninstall.sh ~/Apps/my-project --dry-run

# Actually remove Snow Patrol
./uninstall.sh ~/Apps/my-project
```

The uninstaller reads the manifest and removes only the files it installed.

---

## When Hook Timeouts Occur

Each hook has a `timeoutSec` field in `.github/hooks/hooks.json`:

| Hook Event | Timeout | Scripts |
|------------|---------|---------|
| `sessionStart` | 10s | `context-loader.sh` |
| `sessionEnd` | 10s | `session-summary.sh` |
| `userPromptSubmitted` | 5s | `conductor-routing.sh`, `prompt-capture.sh` |
| `subagentStart` | 5s | `subagent-context.sh` |
| `subagentStop` | 5s | `subagent-stop-guard.sh` |
| `preToolUse` | 5s | `dispatcher.sh` (runs all 6 guards) |
| `postToolUse` | 5s | `audit-logger.sh` |
| `errorOccurred` | 5s | `error-logger.sh` |

**When a hook times out, the runtime defaults to allow.** This means a slow guard is a bypassed guard. The six guards in the dispatcher share a single 5-second budget — if one guard hangs, all subsequent guards are skipped and the tool call proceeds.

**Diagnosing slow hooks:**

```bash
# Time the dispatcher manually
time echo '{"toolName":"create_file","toolArgs":"{\"filePath\":\"test.txt\"}"}' | \
  bash .github/hooks/pre-tool-use/dispatcher.sh
```

If a guard is slow, check for expensive operations (network calls, large file scans) and simplify.

---

## Inspecting Audit Logs

The `postToolUse` hook logs every tool invocation to `.github/hooks/logs/audit.jsonl` as structured JSONL.

**Common queries:**

```bash
# All denials in current session
jq 'select(.result == "denied")' .github/hooks/logs/audit.jsonl

# Tool call frequency (most-used tools first)
jq -r '.tool' .github/hooks/logs/audit.jsonl | sort | uniq -c | sort -rn

# All errors
jq 'select(.event == "error")' .github/hooks/logs/audit.jsonl

# Subagent stop blocks
jq 'select(.event == "subagent_stop_blocked")' .github/hooks/logs/audit.jsonl

# Events in the last hour (macOS)
jq --arg cutoff "$(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ)" \
  'select(.timestamp > $cutoff)' .github/hooks/logs/audit.jsonl
```

**Session boundaries:**

The `last-session-summary.md` file contains the summary from the most recent session. For append-only history across sessions, check `session-summary.log`.

---

## Where Logs Live

All logs are in `.github/hooks/logs/`:

| File | Purpose |
|------|---------|
| `audit.jsonl` | Structured JSONL audit trail — every tool invocation, denial, and error |
| `audit.jsonl.1` | Rotated previous audit log (when rotation occurs) |
| `session-summary.log` | Append-only session summaries across all sessions |
| `last-session-summary.md` | Summary from the most recent session only |
| `error-count` | Running count of errors in the current session |

```bash
# Quick health check — how many denials this session?
grep -c '"result":"denied"' .github/hooks/logs/audit.jsonl

# How many errors?
cat .github/hooks/logs/error-count 2>/dev/null || echo "0"

# Last session summary
cat .github/hooks/logs/last-session-summary.md
```
