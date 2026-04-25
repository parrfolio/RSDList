#!/usr/bin/env bash
# conductor-routing.sh — Advisory conductor-first routing for user prompts
#
# Event: userPromptSubmitted
# Purpose: Nudge the runtime to begin with conductor.powder unless the user has
#          clearly and explicitly requested a specialist agent or built-in task type.
#
# Output: JSON message for advisory routing only. Never blocks prompt processing.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"

read_input

PROMPT=$(get_field '.prompt // .initialPrompt')

if [[ -z "$PROMPT" ]]; then
  echo '{}'
  exit 0
fi

NORMALIZED_PROMPT=$(printf '%s' "$PROMPT" | tr '[:upper:]' '[:lower:]' | tr '\n' ' ')

SPECIALIST_REGEX='(delivery\.tpm|architecture\.(context|exploration|engineer)|engineering\.implementation|frontend\.(implementation|accessibility|design-system|storybook|marketing-site|browsertesting)|quality\.(code-review|test-architecture)|security\.application|billing\.stripe|platform\.(pce|system-maintenance|git|agent-foundry)|documentation\.technical-writer|reliability\.srre|design\.(ux-engineer|visual-designer)|reasoning\.critical-thinking|compliance\.phases-checker|data\.synthetic|speckit\.(clarify|constitution|implement|plan|specify|tasks))'
TASK_TYPE_REGEX='(explore|plan|general-purpose)'

if printf '%s' "$NORMALIZED_PROMPT" | grep -Eqi "(^|[[:space:][:punct:]@])${SPECIALIST_REGEX}([[:space:][:punct:]]|$)"; then
  log_event "routing_opt_out" "Specialist requested explicitly" "prompt=${NORMALIZED_PROMPT:0:160}"
  jq -n '{message: "Routing hint: the user explicitly requested a specialist. Honor that direct invocation instead of forcing conductor.powder."}'
  exit 0
fi

if printf '%s' "$NORMALIZED_PROMPT" | grep -Eqi "(use|run|invoke|start|launch|open|switch to|route to|delegate to|with)[[:space:]]+${TASK_TYPE_REGEX}([[:space:][:punct:]]|$)"; then
  log_event "routing_opt_out" "Built-in task type requested explicitly" "prompt=${NORMALIZED_PROMPT:0:160}"
  jq -n '{message: "Routing hint: the user explicitly requested a built-in task type. Do not override it with conductor.powder in this pass."}'
  exit 0
fi

log_event "routing_advisory" "Conductor-first routing suggested" "prompt=${NORMALIZED_PROMPT:0:160}"

jq -n '{message: "Routing hint: begin with conductor.powder, then let Powder delegate specialists. Only bypass this when the user explicitly names a specialist or task type."}'