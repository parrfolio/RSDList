#!/usr/bin/env bash
# error-logger.sh — Log tool errors to audit trail and track error count
# Runs on errorOccurred. Must be FAST (< 50ms). Append-only.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"

read_input

# ── Extract fields ──
TIMESTAMP=$(get_field '.timestamp')
TOOL_NAME=$(get_field '.toolName')
ERROR_MSG=$(get_field '.errorMessage')
[[ -z "$ERROR_MSG" ]] && ERROR_MSG=$(get_field '.error_message')
ERROR_TYPE=$(get_field '.errorType')
[[ -z "$ERROR_TYPE" ]] && ERROR_TYPE=$(get_field '.error_type')

# ── Truncate error message to 500 chars for log ──
ERROR_SUMMARY="${ERROR_MSG:0:500}"

# ── Ensure log directory exists ──
mkdir -p "$LOG_DIR"

# ── Append JSONL entry (fast, no complex processing) ──
jq -cn \
  --arg ts "${TIMESTAMP:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")}" \
  --arg tool "$TOOL_NAME" \
  --arg error_type "${ERROR_TYPE:-unknown}" \
  --arg error_summary "$ERROR_SUMMARY" \
  '{timestamp: $ts, event: "error", tool: $tool, error_type: $error_type, error_summary: $error_summary}' \
  >> "$LOG_DIR/audit.jsonl"

# ── Increment error counter ──
COUNT_FILE="$LOG_DIR/error-count"
if [[ -f "$COUNT_FILE" ]]; then
  COUNT=$(< "$COUNT_FILE")
  COUNT=$((COUNT + 1))
else
  COUNT=1
fi
echo "$COUNT" > "$COUNT_FILE"

# ── errorOccurred hooks don't return decisions ──
echo '{}'
