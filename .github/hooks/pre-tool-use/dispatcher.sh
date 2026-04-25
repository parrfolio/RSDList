#!/usr/bin/env bash
# dispatcher.sh — Single pre-tool-use hook that runs all guards sequentially.
#
# Purpose: Reduce Agent Debug Log noise by consolidating 6 separate hook
# registrations into one. Each guard is sourced as a function and called
# in priority order. First deny wins; if all guards pass, we allow.
#
# Guard execution order (highest priority first):
#   1. protected-files-guard  — block modifications to framework files
#   2. no-heredoc-guard       — block heredoc/redirect file creation
#   3. git-safety-guard       — enforce git conventions
#   4. conductor-delegation   — enforce conductor delegation-only (opt-in)
#   5. completion-file-guard  — validate scope in completion files
#   6. mandatory-ui-gates     — enforce Phase Gate Receipt

set -euo pipefail

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$HOOK_DIR/../lib/common.sh"
source "$HOOK_DIR/../lib/patterns.sh"

# ── Read input once (shared by all guards) ──
read_input

TOOL_NAME=$(get_field '.toolName')
TOOL_ARGS=$(get_field '.toolArgs')

# ══════════════════════════════════════════════════════════
# Guard 1: Protected Files
# ══════════════════════════════════════════════════════════

run_protected_files_guard() {
  # Terminal tools: check command against destructive patterns
  if is_terminal_tool "$TOOL_NAME"; then
    COMMAND=$(extract_command "$TOOL_ARGS")
    [[ -z "$COMMAND" ]] && return 0

    if echo "$COMMAND" | grep -qE "$RM_PROTECTED_REGEX"; then
      deny "BLOCKED: Cannot delete protected framework directory. These files are managed by Snow Patrol."
    fi
    if echo "$COMMAND" | grep -qE "$SCAFFOLDING_AT_ROOT_REGEX"; then
      deny "BLOCKED: Scaffolding at project root would overwrite framework files. Use a subdirectory instead."
    fi
    if echo "$COMMAND" | grep -qE "$GIT_CLEAN_REGEX"; then
      deny "BLOCKED: git clean would destroy framework files."
    fi
    if echo "$COMMAND" | grep -qE "$GIT_CHECKOUT_RESET_REGEX"; then
      deny "BLOCKED: Cannot reset protected framework files with git checkout."
    fi
    if echo "$COMMAND" | grep -qE "$MV_CP_PROTECTED_REGEX"; then
      deny "BLOCKED: Cannot move or copy over protected framework directories."
    fi
    return 0
  fi

  # File edit tools: check if path is protected
  if is_file_edit_tool "$TOOL_NAME"; then
    FILE_PATH=$(extract_file_path "$TOOL_ARGS")
    [[ -z "$FILE_PATH" ]] && return 0
    if is_protected_path "$FILE_PATH"; then
      deny "BLOCKED: Cannot modify protected framework file: $FILE_PATH"
    fi
  fi
}

# ══════════════════════════════════════════════════════════
# Guard 2: No Heredoc
# ══════════════════════════════════════════════════════════

run_no_heredoc_guard() {
  if ! is_terminal_tool "$TOOL_NAME"; then
    return 0
  fi

  COMMAND=$(extract_command "$TOOL_ARGS")

  if echo "$COMMAND" | grep -qE "$HEREDOC_REGEX"; then
    log_event "DENY" "Heredoc blocked" "$COMMAND"
    deny "BLOCKED: Heredoc file creation is forbidden in VS Code terminals. Use file editing tools instead."
  fi
  if echo "$COMMAND" | grep -qE "$TEE_HEREDOC_REGEX"; then
    log_event "DENY" "Tee heredoc blocked" "$COMMAND"
    deny "BLOCKED: Heredoc file creation is forbidden in VS Code terminals. Use file editing tools instead."
  fi
  if echo "$COMMAND" | grep -qE "$REDIRECT_WRITE_REGEX"; then
    log_event "DENY" "Redirect write blocked" "$COMMAND"
    deny "BLOCKED: Multi-line redirect to file is forbidden. Use file editing tools instead."
  fi
}

# ══════════════════════════════════════════════════════════
# Guard 3: Git Safety
# ══════════════════════════════════════════════════════════

run_git_safety_guard() {
  if ! is_terminal_tool "$TOOL_NAME"; then
    return 0
  fi

  COMMAND=$(extract_command "$TOOL_ARGS")

  if echo "$COMMAND" | grep -qE "$FORCE_PUSH_REGEX"; then
    log_event "DENY" "Force push blocked" "$COMMAND"
    deny "BLOCKED: Force push is prohibited. Remove --force/-f flag."
  fi
  if echo "$COMMAND" | grep -qE "$DELETE_DEFAULT_BRANCH_REGEX"; then
    log_event "DENY" "Delete default branch blocked" "$COMMAND"
    deny "BLOCKED: Cannot delete the default branch (main/master)."
  fi

  # Conventional commit message check
  if echo "$COMMAND" | grep -qE 'git\s+commit.*-m\s'; then
    COMMIT_MSG=$(echo "$COMMAND" | sed -E "s/.*-m[[:space:]]+[\"']([^\"']*)[\"'].*/\1/")
    if [[ "$COMMIT_MSG" != "$COMMAND" ]]; then
      FIRST_LINE=$(echo "$COMMIT_MSG" | head -n 1)
      if ! echo "$FIRST_LINE" | grep -qE "$CONVENTIONAL_COMMIT_REGEX"; then
        log_event "DENY" "Non-conventional commit message" "$COMMIT_MSG"
        deny "BLOCKED: Commit message must follow Conventional Commits format: type(scope): lowercase description"
      fi
    fi
  fi

  # Branch naming check
  if echo "$COMMAND" | grep -qE 'git\s+checkout\s+-b\s+\S+'; then
    BRANCH_NAME=$(echo "$COMMAND" | sed -E 's/.*git[[:space:]]+checkout[[:space:]]+-b[[:space:]]+([^[:space:]]+).*/\1/')
    if ! echo "$BRANCH_NAME" | grep -qE "$BRANCH_NAME_REGEX"; then
      log_event "DENY" "Invalid branch name" "$BRANCH_NAME"
      deny "BLOCKED: Branch name must follow format: type/kebab-case-description (e.g., feat/user-auth)"
    fi
  elif echo "$COMMAND" | grep -qE 'git\s+branch\s+[^-]\S*'; then
    BRANCH_NAME=$(echo "$COMMAND" | sed -E 's/.*git[[:space:]]+branch[[:space:]]+([^[:space:]]+).*/\1/')
    if [[ "$BRANCH_NAME" != -* ]]; then
      if ! echo "$BRANCH_NAME" | grep -qE "$BRANCH_NAME_REGEX"; then
        log_event "DENY" "Invalid branch name" "$BRANCH_NAME"
        deny "BLOCKED: Branch name must follow format: type/kebab-case-description (e.g., feat/user-auth)"
      fi
    fi
  fi
}

# ══════════════════════════════════════════════════════════
# Guard 4: Conductor Delegation
# ══════════════════════════════════════════════════════════

run_conductor_delegation_guard() {
  # Opt-in: only activates in conductor sessions
  if [[ "${SNOW_PATROL_CONDUCTOR_SESSION:-}" != "true" ]] && [[ ! -f ".conductor-session" ]]; then
    return 0
  fi

  # Terminal tools
  if is_terminal_tool "$TOOL_NAME"; then
    COMMAND=$(extract_command "$TOOL_ARGS")
    if echo "$COMMAND" | grep -qE "$CONDUCTOR_TERMINAL_WHITELIST_REGEX"; then
      return 0
    fi
    deny "CONDUCTOR GUARD: Terminal command must be delegated to a subagent. Only git status, git log --oneline, git diff --stat, and file listing on plans/agents are allowed."
  fi

  # File read tools
  if is_file_read_tool "$TOOL_NAME"; then
    FILE_PATH=$(extract_file_path "$TOOL_ARGS")
    FILE_PATH="${FILE_PATH#./}"

    if echo "$FILE_PATH" | grep -qE "$SOURCE_CODE_EXTENSIONS_REGEX"; then
      deny "CONDUCTOR GUARD: Source file reading must be delegated to architecture.exploration. Conductor may only read plan files, spec files, and agent registry."
    fi
    if echo "$FILE_PATH" | grep -qE "$CONDUCTOR_READ_WHITELIST_REGEX"; then
      return 0
    fi
    deny "CONDUCTOR GUARD: Source file reading must be delegated to architecture.exploration. Conductor may only read plan files, spec files, and agent registry."
  fi

  # File edit tools
  if is_file_edit_tool "$TOOL_NAME"; then
    FILE_PATH=$(extract_file_path "$TOOL_ARGS")
    FILE_PATH="${FILE_PATH#./}"

    if echo "$FILE_PATH" | grep -qE "$CONDUCTOR_WRITE_WHITELIST_REGEX"; then
      return 0
    fi
    deny "CONDUCTOR GUARD: File editing must be delegated to a subagent. Conductor may only write plan files, phase completions, and agent-registry.json."
  fi
}

# ══════════════════════════════════════════════════════════
# Guard 5: Completion File
# ══════════════════════════════════════════════════════════

run_completion_file_guard() {
  if ! is_file_edit_tool "$TOOL_NAME"; then
    return 0
  fi

  FILE_PATH=$(extract_file_path "$TOOL_ARGS")
  FILE_PATH="${FILE_PATH#./}"

  if [[ ! "$FILE_PATH" =~ $COMPLETION_FILE_REGEX ]]; then
    return 0
  fi

  CONTENT=$(echo "$TOOL_ARGS" | jq -r '.content // .newString // .file_text // empty' 2>/dev/null || true)
  [[ -z "$CONTENT" ]] && return 0

  if [[ "$FILE_PATH" =~ $PHASE_COMPLETE_REGEX ]]; then
    if ! echo "$CONTENT" | grep -qi "phase scope check"; then
      log_event "completion_guard_deny" \
        "Phase completion file missing 'Phase Scope Check' section" \
        "path=$FILE_PATH"
      deny "SCOPE GUARD: Phase completion file '$FILE_PATH' is missing the required 'Phase Scope Check' section. Every phase completion must include a Phase Scope Check that verifies all phase objectives were completed. Add a '## Phase Scope Check' section before writing this file."
    fi
    return 0

  elif [[ "$FILE_PATH" =~ $PLAN_COMPLETE_REGEX ]]; then
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
  fi
}

# ══════════════════════════════════════════════════════════
# Guard 6: Mandatory UI Gates
# ══════════════════════════════════════════════════════════

run_mandatory_ui_gates_guard() {
  if ! is_file_edit_tool "$TOOL_NAME"; then
    return 0
  fi

  FILE_PATH=$(extract_file_path "$TOOL_ARGS")
  FILE_PATH="${FILE_PATH#./}"

  if [[ ! "$FILE_PATH" =~ $PHASE_COMPLETE_REGEX ]]; then
    return 0
  fi

  CONTENT=$(echo "$TOOL_ARGS" | jq -r '.content // .newString // .file_text // empty' 2>/dev/null || true)
  [[ -z "$CONTENT" ]] && return 0

  if ! echo "$CONTENT" | grep -qi "phase gate receipt"; then
    log_event "ui_gates_guard_deny" \
      "Phase completion file missing 'Phase Gate Receipt' section" \
      "path=$FILE_PATH"
    deny "UI GATES GUARD: Phase completion file '$FILE_PATH' is missing the required 'Phase Gate Receipt' section. Every phase completion must include a Phase Gate Receipt table proving which mandatory gates (Design System, Visual Spec, Implementation, Storybook, Code Review, Accessibility, Security, Browser Testing) ran. Add a '## Phase Gate Receipt' section with the gate status table before writing this file."
  fi

  if ! echo "$CONTENT" | grep -qiE "RAN|NOT RUN|N/A"; then
    log_event "ui_gates_guard_deny" \
      "Phase Gate Receipt exists but contains no gate status evidence" \
      "path=$FILE_PATH"
    deny "UI GATES GUARD: Phase completion file '$FILE_PATH' has a Phase Gate Receipt header but no gate status evidence. The receipt table must contain status entries (RAN, NOT RUN, or N/A) for each mandatory gate. Fill in the actual gate statuses before writing this file."
  fi

  if ! echo "$CONTENT" | grep -qi "phase valid"; then
    log_event "ui_gates_guard_deny" \
      "Phase Gate Receipt missing 'Phase valid' assertion" \
      "path=$FILE_PATH"
    deny "UI GATES GUARD: Phase completion file '$FILE_PATH' is missing the 'Phase valid:' assertion. After the Phase Gate Receipt table, include 'Phase valid: YES' or 'Phase valid: NO' to confirm whether all mandatory gates passed."
  fi

  if echo "$CONTENT" | grep -qi "phase valid.*yes"; then
    if echo "$CONTENT" | grep -qi "NOT RUN"; then
      log_event "ui_gates_guard_deny" \
        "Phase valid: YES claimed but gates marked NOT RUN" \
        "path=$FILE_PATH"
      deny "UI GATES GUARD: Phase completion file '$FILE_PATH' claims 'Phase valid: YES' but has gates marked 'NOT RUN'. This is a contradiction — if a gate was not run, the phase is not valid. Either run the missing gate(s) or change to 'Phase valid: NO'."
    fi
  fi

  # Check for N/A on mandatory UI gates with Phase valid: YES
  if echo "$CONTENT" | grep -qi "phase valid.*yes"; then
    if echo "$CONTENT" | grep -iE "$MANDATORY_UI_GATE_REGEX" | grep -qi "N/A"; then
      NA_GATES=$(echo "$CONTENT" | grep -iE "$MANDATORY_UI_GATE_REGEX" | grep -i "N/A" | head -5)
      log_event "ui_gates_guard_deny" \
        "Phase valid: YES claimed but mandatory UI gates marked N/A" \
        "path=$FILE_PATH"
      deny "UI GATES GUARD: Phase completion file '$FILE_PATH' claims 'Phase valid: YES' but has mandatory UI gates marked 'N/A'. Design System and Storybook gates are NEVER optional when they appear in the Phase Gate Receipt — their presence means this phase has UI work. Marking them N/A is a bypass, not a legitimate exclusion. Run the gate(s) and update the receipt, or change to 'Phase valid: NO'. Violations: $NA_GATES"
    fi
  fi
}

# ══════════════════════════════════════════════════════════
# Run all guards in sequence — first deny wins
# ══════════════════════════════════════════════════════════

run_protected_files_guard
run_no_heredoc_guard
run_git_safety_guard
run_conductor_delegation_guard
run_completion_file_guard
run_mandatory_ui_gates_guard

# All guards passed
allow
