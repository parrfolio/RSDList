#!/usr/bin/env bash
# mandatory-ui-gates-guard.sh — Enforce Phase Gate Receipt in phase completion files
#
# Event: preToolUse
# Purpose: When an agent creates or edits a phase completion file (*-phase-N-complete.md),
#          verify that the content includes a Phase Gate Receipt table. This prevents
#          agents from marking UI phases as done without proving that mandatory gates
#          (Design System, Storybook, Code Review, Accessibility, etc.) actually ran.
#
# Decision: DENY if a phase completion file is missing the Phase Gate Receipt, ALLOW otherwise.

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

# ── Only inspect phase completion files ──
if [[ ! "$FILE_PATH" =~ $PHASE_COMPLETE_REGEX ]]; then
  allow
fi

# ── Extract file content from tool args ──
CONTENT=$(echo "$TOOL_ARGS" | jq -r '.content // .newString // .file_text // empty' 2>/dev/null || true)

# If we can't extract content (e.g. multi_replace), allow and rely on LLM-level rules
if [[ -z "$CONTENT" ]]; then
  allow
fi

# ── Check for Phase Gate Receipt ──
if ! echo "$CONTENT" | grep -qi "phase gate receipt"; then
  log_event "ui_gates_guard_deny" \
    "Phase completion file missing 'Phase Gate Receipt' section" \
    "path=$FILE_PATH"
  deny "UI GATES GUARD: Phase completion file '$FILE_PATH' is missing the required 'Phase Gate Receipt' section. Every phase completion must include a Phase Gate Receipt table proving which mandatory gates (Design System, Visual Spec, Implementation, Storybook, Code Review, Accessibility, Security, Browser Testing) ran. Add a '## Phase Gate Receipt' section with the gate status table before writing this file."
fi

# ── Check for gate status evidence ──
# The Phase Gate Receipt must contain actual gate statuses, not just a header
if ! echo "$CONTENT" | grep -qiE "RAN|NOT RUN|N/A"; then
  log_event "ui_gates_guard_deny" \
    "Phase Gate Receipt exists but contains no gate status evidence" \
    "path=$FILE_PATH"
  deny "UI GATES GUARD: Phase completion file '$FILE_PATH' has a Phase Gate Receipt header but no gate status evidence. The receipt table must contain status entries (RAN, NOT RUN, or N/A) for each mandatory gate. Fill in the actual gate statuses before writing this file."
fi

# ── Check for Phase valid assertion ──
if ! echo "$CONTENT" | grep -qi "phase valid"; then
  log_event "ui_gates_guard_deny" \
    "Phase Gate Receipt missing 'Phase valid' assertion" \
    "path=$FILE_PATH"
  deny "UI GATES GUARD: Phase completion file '$FILE_PATH' is missing the 'Phase valid:' assertion. After the Phase Gate Receipt table, include 'Phase valid: YES' or 'Phase valid: NO' to confirm whether all mandatory gates passed."
fi

# ── Check for NOT RUN gates with Phase valid: YES ──
# If Phase valid: YES is claimed, no gate may be NOT RUN.
# NOT RUN means the gate was mandatory but skipped — that contradicts validity.
if echo "$CONTENT" | grep -qi "phase valid.*yes"; then
  if echo "$CONTENT" | grep -qi "NOT RUN"; then
    log_event "ui_gates_guard_deny" \
      "Phase valid: YES claimed but gates marked NOT RUN" \
      "path=$FILE_PATH"
    deny "UI GATES GUARD: Phase completion file '$FILE_PATH' claims 'Phase valid: YES' but has gates marked 'NOT RUN'. This is a contradiction — if a gate was not run, the phase is not valid. Either run the missing gate(s) or change to 'Phase valid: NO'."
  fi
fi

# ── Check for N/A on mandatory UI gates with Phase valid: YES ──
# Mandatory UI gates (Design System, Storybook) can NEVER be N/A when they
# appear in the Phase Gate Receipt. Their presence means the phase has UI work.
# Marking them N/A is a bypass — not a legitimate exclusion.
if echo "$CONTENT" | grep -qi "phase valid.*yes"; then
  if echo "$CONTENT" | grep -iE "$MANDATORY_UI_GATE_REGEX" | grep -qi "N/A"; then
    # Extract which mandatory gates were marked N/A for the deny message
    NA_GATES=$(echo "$CONTENT" | grep -iE "$MANDATORY_UI_GATE_REGEX" | grep -i "N/A" | head -5)
    log_event "ui_gates_guard_deny" \
      "Phase valid: YES claimed but mandatory UI gates marked N/A" \
      "path=$FILE_PATH"
    deny "UI GATES GUARD: Phase completion file '$FILE_PATH' claims 'Phase valid: YES' but has mandatory UI gates marked 'N/A'. Design System and Storybook gates are NEVER optional when they appear in the Phase Gate Receipt — their presence means this phase has UI work. Marking them N/A is a bypass, not a legitimate exclusion. Run the gate(s) and update the receipt, or change to 'Phase valid: NO'. Violations: $NA_GATES"
  fi
fi

allow
