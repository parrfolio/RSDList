#!/usr/bin/env bash
# conductor-delegation-guard.sh — Enforce conductor delegation-only constraint
# The conductor agent (conductor.powder) should never write code, never read
# source files, and always delegate implementation work to subagents.
#
# OPT-IN: Only activates when SNOW_PATROL_CONDUCTOR_SESSION=true or
# .conductor-session file exists. Silently allows everything otherwise.

set -euo pipefail

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HOOK_DIR/../lib/common.sh"
source "$HOOK_DIR/../lib/patterns.sh"

# Read JSON input from stdin
read_input

# ── Check opt-in ──
# If not in a conductor session, allow everything (don't interfere with subagents)
if [[ "${SNOW_PATROL_CONDUCTOR_SESSION:-}" != "true" ]] && [[ ! -f ".conductor-session" ]]; then
  allow
fi

# ── Extract tool info ──
TOOL_NAME=$(get_field '.toolName')
TOOL_ARGS_RAW=$(get_field '.toolArgs')

# ── Terminal tools (bash, run_in_terminal, etc.) ──
if is_terminal_tool "$TOOL_NAME"; then
  COMMAND=$(extract_command "$TOOL_ARGS_RAW")

  # Check against conductor terminal whitelist
  if echo "$COMMAND" | grep -qE "$CONDUCTOR_TERMINAL_WHITELIST_REGEX"; then
    allow
  fi

  deny "CONDUCTOR GUARD: Terminal command must be delegated to a subagent. Only git status, git log --oneline, git diff --stat, and file listing on plans/agents are allowed."
fi

# ── File read tools (read_file, view, etc.) ──
if is_file_read_tool "$TOOL_NAME"; then
  FILE_PATH=$(extract_file_path "$TOOL_ARGS_RAW")
  # Normalize: remove leading ./
  FILE_PATH="${FILE_PATH#./}"

  # Source code files are always denied — delegate to architecture.exploration
  if echo "$FILE_PATH" | grep -qE "$SOURCE_CODE_EXTENSIONS_REGEX"; then
    deny "CONDUCTOR GUARD: Source file reading must be delegated to architecture.exploration. Conductor may only read plan files, spec files, and agent registry."
  fi

  # Check against read whitelist
  if echo "$FILE_PATH" | grep -qE "$CONDUCTOR_READ_WHITELIST_REGEX"; then
    allow
  fi

  # Not in whitelist — deny
  deny "CONDUCTOR GUARD: Source file reading must be delegated to architecture.exploration. Conductor may only read plan files, spec files, and agent registry."
fi

# ── File edit tools (create_file, edit, replace_string_in_file, etc.) ──
if is_file_edit_tool "$TOOL_NAME"; then
  FILE_PATH=$(extract_file_path "$TOOL_ARGS_RAW")
  # Normalize: remove leading ./
  FILE_PATH="${FILE_PATH#./}"

  # Check against write whitelist
  if echo "$FILE_PATH" | grep -qE "$CONDUCTOR_WRITE_WHITELIST_REGEX"; then
    allow
  fi

  deny "CONDUCTOR GUARD: File editing must be delegated to a subagent. Conductor may only write plan files, phase completions, and agent-registry.json."
fi

# ── All other tools (runSubagent, semantic_search, etc.) → ALLOW ──
allow
