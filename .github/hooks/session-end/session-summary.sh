#!/usr/bin/env bash
# session-summary.sh — Generate session summary from audit log at session end
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/common.sh"

read_input

# ── Extract fields ──
TIMESTAMP=$(get_field '.timestamp')
REASON=$(get_field '.reason')

# ── Ensure log directory exists ──
mkdir -p "$LOG_DIR"

AUDIT_FILE="$LOG_DIR/audit.jsonl"
SUMMARY_FILE="$LOG_DIR/session-summary.log"

if [[ -f "$AUDIT_FILE" ]]; then
  # Count total tool invocations (only tool-use entries, not session events)
  TOTAL=$(grep -c '"tool"' "$AUDIT_FILE" 2>/dev/null || echo "0")

  # Count by result type
  SUCCESS=$(grep -c '"result":"success"' "$AUDIT_FILE" 2>/dev/null || echo "0")
  FAILURE=$(grep -c '"result":"failure"' "$AUDIT_FILE" 2>/dev/null || echo "0")
  DENIED=$(grep -c '"result":"denied"' "$AUDIT_FILE" 2>/dev/null || echo "0")

  # Count unique tools used (extract tool field values, deduplicate)
  UNIQUE_TOOLS=$(jq -r 'select(.tool != null) | .tool' "$AUDIT_FILE" 2>/dev/null | sort -u | wc -l | tr -d ' ')

  # Calculate session duration from first and last timestamps
  FIRST_TS=$(head -1 "$AUDIT_FILE" | jq -r '.timestamp // empty' 2>/dev/null || true)
  LAST_TS="${TIMESTAMP:-$(date -u +"%Y-%m-%dT%H:%M:%SZ")}"

  DURATION_LINE=""
  if [[ -n "$FIRST_TS" ]] && command -v date >/dev/null 2>&1; then
    # Try to calculate duration (macOS and GNU date compatible)
    if date -j -f "%Y-%m-%dT%H:%M:%SZ" "$FIRST_TS" +%s >/dev/null 2>&1; then
      # macOS date
      START_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$FIRST_TS" +%s 2>/dev/null || true)
      END_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$LAST_TS" +%s 2>/dev/null || true)
    else
      # GNU date
      START_EPOCH=$(date -d "$FIRST_TS" +%s 2>/dev/null || true)
      END_EPOCH=$(date -d "$LAST_TS" +%s 2>/dev/null || true)
    fi

    if [[ -n "${START_EPOCH:-}" && -n "${END_EPOCH:-}" ]]; then
      DURATION_SECS=$((END_EPOCH - START_EPOCH))
      DURATION_MINS=$((DURATION_SECS / 60))
      DURATION_REM=$((DURATION_SECS % 60))
      DURATION_LINE="Duration: ${DURATION_MINS}m ${DURATION_REM}s"
    fi
  fi
else
  TOTAL=0
  SUCCESS=0
  FAILURE=0
  DENIED=0
  UNIQUE_TOOLS=0
  DURATION_LINE=""
fi

# ── Write summary ──
{
  echo ""
  echo "Session Summary"
  echo "═══════════════"
  echo "Ended: ${TIMESTAMP:-unknown}"
  echo "Reason: ${REASON:-unknown}"
  if [[ -n "$DURATION_LINE" ]]; then
    echo "$DURATION_LINE"
  fi
  echo "Total tool invocations: $TOTAL"
  echo "├─ Success: $SUCCESS"
  echo "├─ Failure: $FAILURE"
  echo "└─ Denied: $DENIED"
  echo "Unique tools used: $UNIQUE_TOOLS"
} >> "$SUMMARY_FILE"

# ── Log final event ──
log_event "session_end" "Session ended: ${REASON:-unknown}" \
  "total=$TOTAL, success=$SUCCESS, failure=$FAILURE, denied=$DENIED, unique_tools=$UNIQUE_TOOLS"

# ── Write structured checkpoint for next session pickup ──
CHECKPOINT_FILE="$LOG_DIR/last-session-summary.md"

# Detect current git branch
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

# Detect active spec directory (most recently modified spec)
ACTIVE_SPEC=""
if [[ -d "specs" ]]; then
  ACTIVE_SPEC=$(find specs -maxdepth 2 -name "tasks.md" -print0 2>/dev/null \
    | xargs -0 ls -t 2>/dev/null \
    | head -1 \
    | sed 's|/tasks.md$||' || true)
fi

# Count completed and total tasks from active spec
TASKS_DONE=0
TASKS_TOTAL=0
if [[ -n "$ACTIVE_SPEC" && -f "$ACTIVE_SPEC/tasks.md" ]]; then
  TASKS_DONE=$(grep -c '^\- \[x\]' "$ACTIVE_SPEC/tasks.md" 2>/dev/null || echo "0")
  TASKS_TOTAL=$(grep -c '^\- \[' "$ACTIVE_SPEC/tasks.md" 2>/dev/null || echo "0")
fi

# Detect modified files in this session (uncommitted changes)
MODIFIED_FILES=""
if command -v git >/dev/null 2>&1; then
  MODIFIED_FILES=$(git diff --name-only HEAD 2>/dev/null | head -20 || true)
fi

{
  echo "# Last Session Summary"
  echo ""
  echo "**Ended**: ${TIMESTAMP:-unknown}"
  echo "**Reason**: ${REASON:-unknown}"
  if [[ -n "$DURATION_LINE" ]]; then
    echo "**$DURATION_LINE**"
  fi
  echo "**Branch**: $GIT_BRANCH"
  echo ""
  echo "## Session Stats"
  echo ""
  echo "- Tool invocations: $TOTAL (success: $SUCCESS, failure: $FAILURE, denied: $DENIED)"
  echo "- Unique tools: $UNIQUE_TOOLS"
  echo ""

  if [[ -n "$ACTIVE_SPEC" ]]; then
    echo "## Active Spec"
    echo ""
    echo "- Directory: $ACTIVE_SPEC"
    echo "- Task progress: $TASKS_DONE / $TASKS_TOTAL completed"
    echo ""
  fi

  if [[ -n "$MODIFIED_FILES" ]]; then
    echo "## Modified Files (uncommitted)"
    echo ""
    echo "$MODIFIED_FILES" | while IFS= read -r f; do
      echo "- $f"
    done
    echo ""
  fi

  echo "## Next Session Should"
  echo ""
  echo "- Review branch \`$GIT_BRANCH\` for in-progress work"
  if [[ -n "$ACTIVE_SPEC" && "$TASKS_DONE" -lt "$TASKS_TOTAL" ]]; then
    echo "- Continue spec implementation: $ACTIVE_SPEC ($((TASKS_TOTAL - TASKS_DONE)) tasks remaining)"
  fi
  echo "- Check \`.github/PROJECT_CONTEXT.md\` for project overview"
  echo "- Check \`/memories/repo/\` for persistent project state"
} > "$CHECKPOINT_FILE"

log_event "checkpoint_written" "Session checkpoint saved" \
  "file=$CHECKPOINT_FILE, branch=$GIT_BRANCH, tasks=$TASKS_DONE/$TASKS_TOTAL"
