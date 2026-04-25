#!/usr/bin/env bash
# completion-file-guard.sh — Validate scope verification in plan completion files
#
# Event: preToolUse
# Purpose: When an agent creates or edits a completion file (*-complete.md),
#          verify that the content includes required scope verification sections.
#          This prevents agents from writing "done" summaries that silently
#          reduce scope or launder unfinished work into Recommendations.
#
# Decision: DENY if a completion file is missing required sections, ALLOW otherwise.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"
source "$SCRIPT_DIR/../lib/patterns.sh"

read_input

TOOL_NAME=$(get_field '.toolName')

# ── Only inspect file creation/edit tools ──
if ! is_file_edit_tool "$TOOL_NAME"; then
  allow
fi

# ── Extract file path ──
TOOL_ARGS=$(get_field '.toolArgs')
FILE_PATH=$(extract_file_path "$TOOL_ARGS")

# Normalize: strip leading ./
FILE_PATH="${FILE_PATH#./}"

# ── Only inspect completion files ──
# Match: *-complete.md (plan completion) and *-phase-N-complete.md (phase completion)
if [[ ! "$FILE_PATH" =~ $COMPLETION_FILE_REGEX ]]; then
  allow
fi

# ── Extract file content from tool args ──
# create_file passes content directly; replace_string_in_file passes newString
CONTENT=$(echo "$TOOL_ARGS" | jq -r '.content // .newString // .file_text // empty' 2>/dev/null || true)

# If we can't extract content (e.g. multi_replace), allow and rely on LLM-level rules
if [[ -z "$CONTENT" ]]; then
  allow
fi

# ── Determine completion type and validate ──

if [[ "$FILE_PATH" =~ $PHASE_COMPLETE_REGEX ]]; then
  # Phase completion file: require "Phase Scope Check" section
  if ! echo "$CONTENT" | grep -qi "phase scope check"; then
    log_event "completion_guard_deny" \
      "Phase completion file missing 'Phase Scope Check' section" \
      "path=$FILE_PATH"
    deny "SCOPE GUARD: Phase completion file '$FILE_PATH' is missing the required 'Phase Scope Check' section. Every phase completion must include a Phase Scope Check that verifies all phase objectives were completed. Add a '## Phase Scope Check' section before writing this file."
  fi
  allow

elif [[ "$FILE_PATH" =~ $PLAN_COMPLETE_REGEX ]]; then
  # Plan completion file: require "Scope Verification" section
  MISSING_SECTIONS=""

  if ! echo "$CONTENT" | grep -qi "scope verification"; then
    MISSING_SECTIONS="Scope Verification"
  fi

  if ! echo "$CONTENT" | grep -qi "scope fidelity"; then
    if [[ -n "$MISSING_SECTIONS" ]]; then
      MISSING_SECTIONS="$MISSING_SECTIONS, Scope Fidelity assessment"
    else
      MISSING_SECTIONS="Scope Fidelity assessment"
    fi
  fi

  if [[ -n "$MISSING_SECTIONS" ]]; then
    log_event "completion_guard_deny" \
      "Plan completion file missing required sections: $MISSING_SECTIONS" \
      "path=$FILE_PATH"
    deny "SCOPE GUARD: Plan completion file '$FILE_PATH' is missing required sections: $MISSING_SECTIONS. Every plan completion must include a '## Scope Verification' section with a 'Scope Fidelity:' assessment that confirms all original requirements were addressed. Do not defer requested items to Recommendations."
  fi
  allow
fi

# Catch-all: if it matched COMPLETION_FILE_REGEX but not the specific sub-patterns, allow
allow
