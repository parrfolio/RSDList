# ADR 0001: Consolidated Dispatcher Over Individual Hooks

## Status

Accepted

## Context

The `preToolUse` hook event needs to run six security and convention guards before every tool call:

1. Protected files guard
2. No heredoc guard
3. Git safety guard
4. Conductor delegation guard
5. Completion file guard
6. Mandatory UI gates guard

The hooks system allows registering multiple scripts per event. The naive approach registers six separate scripts in `hooks.json`, each parsing the same JSON input independently.

Six separate processes means:

- Six JSON parses of the identical input payload
- Six shell startups (each sourcing `common.sh` and `patterns.sh`)
- Non-deterministic execution order unless the runtime guarantees array ordering
- No shared state — each guard logs independently, losing session context
- Higher latency against a 5-second timeout budget

## Decision

Register a single `dispatcher.sh` script for the `preToolUse` event. The dispatcher:

1. Reads and parses input once (`read_input`)
2. Sources all guard functions from the same file
3. Runs guards sequentially in priority order (protected files first, UI gates last)
4. Exits on first denial (first-deny-wins)
5. Calls `allow` only if all six guards pass

Each guard is a bash function (`run_protected_files_guard`, `run_no_heredoc_guard`, etc.) defined inline in `dispatcher.sh`, sharing the parsed `$TOOL_NAME` and `$TOOL_ARGS` variables.

## Consequences

**Benefits:**

- Single input parse — one `jq` call instead of six
- Faster execution — one process, one shell startup, shared library sourcing
- Deterministic guard ordering — priority is explicit in the function call sequence
- First-deny-wins — a denied tool call short-circuits immediately without running remaining guards
- Shared log context — all guards write to the same audit log session

**Tradeoffs:**

- Monolithic script — all guard logic lives in one file (~310 lines); adding a seventh guard means editing the dispatcher
- A slow guard blocks subsequent guards — if guard 2 hangs, guards 3–6 never run (mitigated by keeping guards fast and stateless)
- Testing requires mocking the full dispatcher rather than testing guards in isolation (mitigated by the test suite in `tests/hooks/`)
