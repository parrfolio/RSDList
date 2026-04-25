#!/usr/bin/env bash
# common.sh — Shared utilities for Snow Patrol Copilot Hooks
# Source this file from any hook script: source "$(dirname "$0")/../lib/common.sh"

set -euo pipefail

# ── Read JSON input from stdin ──
# Copilot pipes JSON to hook scripts via stdin.
# Normalizes the new snake_case Copilot Hooks API (tool_name, tool_input, tool_result)
# to the camelCase schema (toolName, toolArgs, toolResult) all downstream hooks expect.
read_input() {
  INPUT=$(jq -c '
    if type == "object" and has("tool_name") then
      . + {toolName: .tool_name}
      + (if .tool_input then {toolArgs: (.tool_input | tojson)} else {} end)
      + (if .tool_result then {toolResult: {
            resultType: (.tool_result.result_type // null),
            textResultForLlm: (.tool_result.text_result_for_llm // null)
          }} else {} end)
      + (if .initial_prompt then {initialPrompt: .initial_prompt} else {} end)
    else .
    end
  ')
  export INPUT
}

# ── Extract field from INPUT using jq ──
get_field() {
  local field="$1"
  echo "$INPUT" | jq -r "$field // empty"
}

# ── Output deny decision ──
# Only preToolUse hooks process this output
deny() {
  local reason="$1"
  jq -n --arg reason "$reason" \
    '{permissionDecision: "deny", permissionDecisionReason: $reason}'
  exit 0
}

# ── Output allow decision ──
allow() {
  echo '{"permissionDecision":"allow"}'
  exit 0
}

# ── Log structured event to JSONL audit file ──
LOG_DIR=".github/hooks/logs"
log_event() {
  local event_type="$1"
  local message="$2"
  local details="${3:-}"

  mkdir -p "$LOG_DIR"

  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  jq -cn \
    --arg ts "$timestamp" \
    --arg type "$event_type" \
    --arg msg "$message" \
    --arg details "$details" \
    '{timestamp: $ts, event: $type, message: $msg, details: $details}' \
    >> "$LOG_DIR/audit.jsonl"
}

# ── Check if a tool name is a file editing tool ──
is_file_edit_tool() {
  local tool="$1"
  case "$tool" in
    edit|create|write|create_file|replace_string_in_file|multi_replace_string_in_file|Edit|MultiEdit|Write|NotebookEdit)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# ── Check if a tool name is a file reading tool ──
is_file_read_tool() {
  local tool="$1"
  case "$tool" in
    view|read|read_file|Read|NotebookRead)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# ── Check if a tool name is a terminal/bash tool ──
is_terminal_tool() {
  local tool="$1"
  case "$tool" in
    bash|run_in_terminal|execute|shell|Bash|powershell)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# ── Extract file path from tool args ──
# Handles various tool arg formats
extract_file_path() {
  local tool_args="$1"
  # Try common field names: filePath, path, file
  local path
  path=$(echo "$tool_args" | jq -r '.filePath // .path // .file // empty' 2>/dev/null || true)
  echo "$path"
}

# ── Extract command from terminal tool args ──
extract_command() {
  local tool_args="$1"
  local cmd
  cmd=$(echo "$tool_args" | jq -r '.command // .cmd // empty' 2>/dev/null || true)
  echo "$cmd"
}
