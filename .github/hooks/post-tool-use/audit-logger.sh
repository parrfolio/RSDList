#!/usr/bin/env bash
# audit-logger.sh — Structured audit trail for every tool execution
# Runs after every tool use. Must be FAST (< 50ms). Append-only.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"

read_input

# ── Extract fields ──
TIMESTAMP=$(get_field '.timestamp')
TOOL_NAME=$(get_field '.toolName')
RESULT_TYPE=$(get_field '.toolResult.resultType')

# ── Truncate args and result to 200 chars for log ──
TOOL_ARGS_RAW=$(get_field '.toolArgs')
TOOL_ARGS_SUMMARY="${TOOL_ARGS_RAW:0:200}"

RESULT_TEXT_RAW=$(get_field '.toolResult.textResultForLlm')
RESULT_SUMMARY="${RESULT_TEXT_RAW:0:200}"

# ── Ensure log directory exists ──
mkdir -p "$LOG_DIR"

# ── Rotate log if it exceeds 10MB ──
AUDIT_FILE="$LOG_DIR/audit.jsonl"
if [[ -f "$AUDIT_FILE" ]]; then
  size=$(stat -f%z "$AUDIT_FILE" 2>/dev/null || stat -c%s "$AUDIT_FILE" 2>/dev/null || echo 0)
  if [[ "$size" -gt 10485760 ]]; then
    mv -f "$AUDIT_FILE" "${AUDIT_FILE}.1"
  fi
fi

# ── Append JSONL entry (fast, no complex processing) ──
jq -cn \
  --arg ts "${TIMESTAMP:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")}" \
  --arg tool "$TOOL_NAME" \
  --arg result "${RESULT_TYPE:-unknown}" \
  --arg args_summary "$TOOL_ARGS_SUMMARY" \
  --arg result_summary "$RESULT_SUMMARY" \
  '{timestamp: $ts, tool: $tool, result: $result, args_summary: $args_summary, result_summary: $result_summary}' \
  >> "$LOG_DIR/audit.jsonl"
