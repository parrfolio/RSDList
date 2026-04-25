#!/usr/bin/env bash
# subagent-stop-guard.sh — Prevent empty or placeholder-only subagent completions
#
# Event: subagentStop / SubagentStop
# Purpose: Block obviously non-informative subagent completions so the subagent
#          returns a concrete result, blocker, or finding before stopping.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"

read_input

AGENT_TYPE=$(get_field '.agent_type // .agentType')
LAST_MESSAGE=$(get_field '.last_assistant_message // .lastAssistantMessage')

NORMALIZED=$(printf '%s' "$LAST_MESSAGE" | tr '\n' ' ' | sed 's/[[:space:]]\+/ /g' | sed 's/^ //; s/ $//')

if [[ -z "$NORMALIZED" ]]; then
  REASON="Subagent stop blocked: return a concrete result, blocker, or finding before stopping. Empty subagent completions are not allowed."
  log_event "subagent_stop_blocked" "Empty subagent completion blocked" "agent_type=${AGENT_TYPE}"
  jq -n --arg reason "$REASON" '{decision: "block", reason: $reason}'
  exit 0
fi

if printf '%s' "$NORMALIZED" | grep -Eiq '^(done|ok|complete|completed|finished|fixed|handled|resolved|working on it|n/a|none)\.?$'; then
  REASON="Subagent stop blocked: placeholder-only completion detected. Return concrete findings, changed files, tests, or blockers before stopping."
  log_event "subagent_stop_blocked" "Placeholder subagent completion blocked" "agent_type=${AGENT_TYPE}; message=${NORMALIZED:0:160}"
  jq -n --arg reason "$REASON" '{decision: "block", reason: $reason}'
  exit 0
fi

echo '{}'