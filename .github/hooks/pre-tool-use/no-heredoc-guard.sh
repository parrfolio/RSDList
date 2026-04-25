#!/usr/bin/env bash
# no-heredoc-guard.sh — Block heredoc/redirect file creation in terminal tools
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

# Check for heredoc syntax
if echo "$COMMAND" | grep -qE "$HEREDOC_REGEX"; then
  log_event "DENY" "Heredoc blocked" "$COMMAND"
  deny "BLOCKED: Heredoc file creation is forbidden in VS Code terminals. Use file editing tools instead."
fi

# Check for tee with heredoc
if echo "$COMMAND" | grep -qE "$TEE_HEREDOC_REGEX"; then
  log_event "DENY" "Tee heredoc blocked" "$COMMAND"
  deny "BLOCKED: Heredoc file creation is forbidden in VS Code terminals. Use file editing tools instead."
fi

# Check for echo/printf redirect to file
if echo "$COMMAND" | grep -qE "$REDIRECT_WRITE_REGEX"; then
  log_event "DENY" "Redirect write blocked" "$COMMAND"
  deny "BLOCKED: Multi-line redirect to file is forbidden. Use file editing tools instead."
fi

# All checks passed
allow
