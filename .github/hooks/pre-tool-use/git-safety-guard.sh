#!/usr/bin/env bash
# git-safety-guard.sh — Enforce git safety rules in terminal tools
# Part of Snow Patrol Copilot Hooks
set -euo pipefail

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HOOK_DIR/../lib/common.sh"
source "$HOOK_DIR/../lib/patterns.sh"

# Read JSON input from stdin
read_input

# Extract tool name
TOOL_NAME=$(get_field '.toolName')

# Only check terminal tools — allow everything else
if ! is_terminal_tool "$TOOL_NAME"; then
  allow
fi

# Extract command from tool args
TOOL_ARGS=$(get_field '.toolArgs')
COMMAND=$(extract_command "$TOOL_ARGS")

# ── Force push check ──
if echo "$COMMAND" | grep -qE "$FORCE_PUSH_REGEX"; then
  log_event "DENY" "Force push blocked" "$COMMAND"
  deny "BLOCKED: Force push is prohibited. Remove --force/-f flag."
fi

# ── Delete default branch check ──
if echo "$COMMAND" | grep -qE "$DELETE_DEFAULT_BRANCH_REGEX"; then
  log_event "DENY" "Delete default branch blocked" "$COMMAND"
  deny "BLOCKED: Cannot delete the default branch (main/master)."
fi

# ── Conventional commit message check ──
# Only validates when -m flag is present (editor-based commits are allowed)
if echo "$COMMAND" | grep -qE 'git\s+commit.*-m\s'; then
  # Extract message from between quotes after -m flag
  COMMIT_MSG=$(echo "$COMMAND" | sed -E "s/.*-m[[:space:]]+[\"']([^\"']*)[\"'].*/\1/")
  # Only validate if extraction succeeded (message differs from full command)
  if [[ "$COMMIT_MSG" != "$COMMAND" ]]; then
    FIRST_LINE=$(echo "$COMMIT_MSG" | head -n 1)
    if ! echo "$FIRST_LINE" | grep -qE "$CONVENTIONAL_COMMIT_REGEX"; then
      log_event "DENY" "Non-conventional commit message" "$COMMIT_MSG"
      deny "BLOCKED: Commit message must follow Conventional Commits format: type(scope): lowercase description"
    fi
  fi
fi

# ── Branch naming check ──
if echo "$COMMAND" | grep -qE 'git\s+checkout\s+-b\s+\S+'; then
  BRANCH_NAME=$(echo "$COMMAND" | sed -E 's/.*git[[:space:]]+checkout[[:space:]]+-b[[:space:]]+([^[:space:]]+).*/\1/')
  if ! echo "$BRANCH_NAME" | grep -qE "$BRANCH_NAME_REGEX"; then
    log_event "DENY" "Invalid branch name" "$BRANCH_NAME"
    deny "BLOCKED: Branch name must follow format: type/kebab-case-description (e.g., feat/user-auth)"
  fi
elif echo "$COMMAND" | grep -qE 'git\s+branch\s+[^-]\S*'; then
  # git branch <name> — creating a branch (not a flag like -D/--delete)
  BRANCH_NAME=$(echo "$COMMAND" | sed -E 's/.*git[[:space:]]+branch[[:space:]]+([^[:space:]]+).*/\1/')
  if [[ "$BRANCH_NAME" != -* ]]; then
    if ! echo "$BRANCH_NAME" | grep -qE "$BRANCH_NAME_REGEX"; then
      log_event "DENY" "Invalid branch name" "$BRANCH_NAME"
      deny "BLOCKED: Branch name must follow format: type/kebab-case-description (e.g., feat/user-auth)"
    fi
  fi
fi

# All checks passed
allow
