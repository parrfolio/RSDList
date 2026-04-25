#!/usr/bin/env bash
# protected-files-guard.sh — PreToolUse hook that blocks modifications to
# protected framework directories managed by Snow Patrol.
#
# Sources lib/common.sh and lib/patterns.sh for shared utilities and regex constants.

set -euo pipefail

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HOOK_DIR/../lib/common.sh"
source "$HOOK_DIR/../lib/patterns.sh"

# ── Read and parse input ──
read_input
TOOL_NAME=$(get_field '.toolName')
TOOL_ARGS=$(get_field '.toolArgs')

# ── Terminal tools: check command against destructive patterns ──
if is_terminal_tool "$TOOL_NAME"; then
  COMMAND=$(extract_command "$TOOL_ARGS")

  # Skip if no command extracted
  if [[ -z "$COMMAND" ]]; then
    allow
  fi

  # Check rm targeting protected dirs
  if echo "$COMMAND" | grep -qE "$RM_PROTECTED_REGEX"; then
    deny "BLOCKED: Cannot delete protected framework directory. These files are managed by Snow Patrol."
  fi

  # Check scaffolding at project root
  if echo "$COMMAND" | grep -qE "$SCAFFOLDING_AT_ROOT_REGEX"; then
    deny "BLOCKED: Scaffolding at project root would overwrite framework files. Use a subdirectory instead."
  fi

  # Check git clean
  if echo "$COMMAND" | grep -qE "$GIT_CLEAN_REGEX"; then
    deny "BLOCKED: git clean would destroy framework files."
  fi

  # Check git checkout resetting framework files
  if echo "$COMMAND" | grep -qE "$GIT_CHECKOUT_RESET_REGEX"; then
    deny "BLOCKED: Cannot reset protected framework files with git checkout."
  fi

  # Check mv/cp targeting protected dirs
  if echo "$COMMAND" | grep -qE "$MV_CP_PROTECTED_REGEX"; then
    deny "BLOCKED: Cannot move or copy over protected framework directories."
  fi

  # Terminal command is safe
  allow
fi

# ── File edit tools: check if path is protected ──
if is_file_edit_tool "$TOOL_NAME"; then
  FILE_PATH=$(extract_file_path "$TOOL_ARGS")

  # Skip if no path extracted
  if [[ -z "$FILE_PATH" ]]; then
    allow
  fi

  if is_protected_path "$FILE_PATH"; then
    deny "BLOCKED: Cannot modify protected framework file: $FILE_PATH"
  fi

  allow
fi

# ── All other tools (reads, searches, etc.): allow ──
allow
