#!/usr/bin/env bash
# subagent-context.sh — Inject delegated-scope guidance into subagents
#
# Event: subagentStart / SubagentStart
# Purpose: Reinforce that subagents should stay within delegated scope, honor
#          required skills/instructions, and report concrete outcomes.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"

read_input

AGENT_TYPE=$(get_field '.agent_type // .agentType')

if [[ -z "$AGENT_TYPE" ]]; then
  echo '{}'
  exit 0
fi

MESSAGE="Subagent hardening: stay within delegated scope, load any required skills or instructions for the assigned task, avoid re-planning the entire workflow, and return a concrete result with changed files, findings, tests run, or blockers."

log_event "subagent_start_advisory" "Subagent start guidance injected" "agent_type=${AGENT_TYPE}"

jq -n --arg agent "$AGENT_TYPE" --arg message "$MESSAGE" \
  '{hookSpecificOutput: {hookEventName: "SubagentStart", additionalContext: ($message + " Active subagent: " + $agent + ".")}}'