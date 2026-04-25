#!/usr/bin/env bash
# prompt-capture.sh — Capture user's original request for scope verification
#
# Event: userPromptSubmitted
# Purpose: Record every user prompt to a log file so downstream hooks and agents
#          can reference the original request when verifying scope fidelity.
#
# Output: Appends to .github/hooks/logs/original-request.md
# Returns: JSON message reminding agents to honor the captured scope.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"

read_input

PROMPT=$(get_field '.prompt')
TIMESTAMP=$(get_field '.timestamp')

# Nothing to capture if prompt is empty
if [[ -z "$PROMPT" ]]; then
  echo '{}'
  exit 0
fi

# Fall back to current UTC time if no timestamp provided
if [[ -z "$TIMESTAMP" ]]; then
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
fi

mkdir -p "$LOG_DIR"
REQUEST_FILE="$LOG_DIR/original-request.md"

# Append each user prompt with timestamp delimiter
{
  echo "---"
  echo "timestamp: $TIMESTAMP"
  echo "---"
  echo ""
  echo "$PROMPT"
  echo ""
} >> "$REQUEST_FILE"

log_event "prompt_captured" "User prompt captured" \
  "length=${#PROMPT}"

# Capture is now separated from routing. Logging remains append-only and silent.
echo '{}'
