#!/usr/bin/env bash
# context-loader.sh — Discover and log project context at session start
# Runs at sessionStart. Output is ignored by runtime but log persists.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"

read_input

# ── Extract fields from session start input ──
TIMESTAMP=$(get_field '.timestamp')
CWD=$(get_field '.cwd')
SOURCE=$(get_field '.source')
INITIAL_PROMPT=$(get_field '.initialPrompt')

# ── Ensure log directory exists ──
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/session-context.log"

# ── Begin context discovery (overwrite each session) ──
{
  echo "Session Context Discovery"
  echo "═════════════════════════"
  echo "Timestamp: ${TIMESTAMP:-unknown}"
  echo "CWD: ${CWD:-unknown}"
  echo "Source: ${SOURCE:-unknown}"
  echo ""

  # Check for framework manifest
  if [[ -f ".snow-patrol-manifest.json" ]]; then
    echo "Framework: manifest found (.snow-patrol-manifest.json)"
    PROTECTED_COUNT=$(jq -r '.protectedPaths | length' .snow-patrol-manifest.json 2>/dev/null || echo "0")
    echo "Protected paths: $PROTECTED_COUNT"
  else
    echo "Framework: no manifest"
  fi

  echo ""

  # Check for specs directory
  if [[ -d "specs" ]]; then
    echo "Specs directory: found"
    SPEC_FILES=$(find specs -maxdepth 2 -type f \( -name "spec.md" -o -name "plan.md" -o -name "tasks.md" \) 2>/dev/null || true)
    if [[ -n "$SPEC_FILES" ]]; then
      echo "Spec files:"
      echo "$SPEC_FILES" | while IFS= read -r f; do
        echo "  - $f"
      done
    else
      echo "Spec files: none"
    fi
  else
    echo "Specs directory: not found"
  fi

  echo ""

  # Check for constitution
  CONSTITUTION=".specify/memory/constitution.md"
  if [[ -f "$CONSTITUTION" ]]; then
    FILE_SIZE=$(wc -c < "$CONSTITUTION" | tr -d ' ')
    if [[ "$FILE_SIZE" -gt 50 ]]; then
      echo "Constitution: populated ($FILE_SIZE bytes)"
    else
      echo "Constitution: exists but appears to be a template"
    fi
  else
    echo "Constitution: not found"
  fi

  echo ""

  # Git branch
  GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  echo "Git branch: $GIT_BRANCH"

  echo ""
  echo "Session source: ${SOURCE:-unknown}"

  # ── Previous session checkpoint ──
  CHECKPOINT_FILE="$LOG_DIR/last-session-summary.md"
  if [[ -f "$CHECKPOINT_FILE" ]]; then
    echo ""
    echo "Previous Session Context"
    echo "────────────────────────"
    cat "$CHECKPOINT_FILE"
  fi

  # ── Project context file ──
  if [[ -f ".github/PROJECT_CONTEXT.md" ]]; then
    echo ""
    echo "Project Context"
    echo "───────────────"
    cat ".github/PROJECT_CONTEXT.md"
  fi

  # ── Powder active task capsule ──
  ACTIVE_TASK_FILE="plans/powder-active-task-plan.md"
  if [[ -f "$ACTIVE_TASK_FILE" ]]; then
    echo ""
    echo "Powder Active Task"
    echo "──────────────────"
    cat "$ACTIVE_TASK_FILE"
  fi
} > "$LOG_FILE"

# ── Log structured event ──
log_event "session_start" "Context discovery complete" \
  "source=${SOURCE:-unknown}, branch=${GIT_BRANCH:-unknown}, cwd=${CWD:-unknown}"
