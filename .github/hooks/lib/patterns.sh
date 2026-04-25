#!/usr/bin/env bash
# patterns.sh — Regex pattern constants for Snow Patrol enforcement hooks
# Source this file from guard scripts: source "$(dirname "$0")/../lib/patterns.sh"

# ══════════════════════════════════════════════════════════
# Protected Framework Files (from protected-framework-files.instructions.md)
# ══════════════════════════════════════════════════════════

# Protected directory patterns (relative to workspace root)
# These paths must NEVER be modified by agents during scaffolding or builds
PROTECTED_DIRS=(
  ".github/agents"
  ".github/instructions"
  ".github/prompts"
  ".github/skills"
  ".github/hooks"
  ".claude/commands"
  ".specify"
  ".vscode"
  "docs"
)

# Protected individual files
PROTECTED_FILES=(
  ".github/copilot.instructions.md"
  ".snow-patrol-manifest.json"
  ".vscode/mcp.json"
  ".vscode/settings.json"
)

# Regex: match rm commands targeting protected directories
RM_PROTECTED_REGEX='rm\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s+)*(\./)?(\.((github|vscode|claude|specify))|docs)\b'

# Regex: match scaffolding commands at project root (npx create-*, npm init, etc.)
SCAFFOLDING_AT_ROOT_REGEX='(npx\s+create-\S+|npm\s+init|yarn\s+create\s+\S+|pnpm\s+create\s+\S+)\s+\.(\s|$)'

# Regex: match git clean that could destroy framework files
GIT_CLEAN_REGEX='git\s+clean\s+-[a-zA-Z]*[fd]'

# Regex: match git checkout that resets framework files
GIT_CHECKOUT_RESET_REGEX='git\s+checkout\s+--\s+\.(github|vscode|claude)'

# Regex: match mv/cp commands targeting protected directories
MV_CP_PROTECTED_REGEX='(mv|cp)\s+.*\.(github|vscode|claude|specify|snow-patrol)'

# ══════════════════════════════════════════════════════════
# No Heredoc (from no-heredoc.instructions.md)
# ══════════════════════════════════════════════════════════

# Regex: match ANY heredoc syntax in terminal commands
HEREDOC_REGEX='<<-?\s*['"'"'"'"'"']?\w+'

# Regex: match tee with heredoc
TEE_HEREDOC_REGEX='tee\s+\S+\s*<<'

# Regex: match echo/printf multi-line redirect to file
REDIRECT_WRITE_REGEX='(echo|printf)\s+.*>+\s+\S+'

# ══════════════════════════════════════════════════════════
# Git Safety (from git-workflow.instructions.md)
# ══════════════════════════════════════════════════════════

# Regex: match force push (any branch)
FORCE_PUSH_REGEX='git\s+push\s+.*(-f\b|--force)'

# Regex: match deletion of default branch (local or remote)
DELETE_DEFAULT_BRANCH_REGEX='git\s+branch\s+(-[dD]|--delete)\s+(main|master)|git\s+push\s+\S+\s+:(main|master)'

# Regex: match direct commit to main/master (used with branch check)
COMMIT_ON_MAIN_REGEX='git\s+commit'

# Regex: conventional commit message format
# Valid: feat(scope): lowercase description
# Valid: fix: lowercase description
CONVENTIONAL_COMMIT_REGEX='^(feat|fix|chore|refactor|docs|test|ci|style|perf|build)(\([a-z0-9_-]+\))?: [a-z]'

# Regex: valid branch name format (type/kebab-case-description)
BRANCH_NAME_REGEX='^(feat|fix|chore|refactor|docs|test|ci|style|perf)/[a-z0-9][a-z0-9-]*$'

# ══════════════════════════════════════════════════════════
# Conductor Delegation Guard (from conductor.powder Pre-Action Firewall)
# ══════════════════════════════════════════════════════════

# Whitelisted terminal commands for conductor (everything else must be delegated)
CONDUCTOR_TERMINAL_WHITELIST_REGEX='^git\s+(status|log\s+--oneline|diff\s+--stat)|^(ls|find)\s+.*(plans|agents)/'

# Whitelisted file paths for conductor to READ
CONDUCTOR_READ_WHITELIST_REGEX='(^plans/|^specs/|/spec\.md$|/plan\.md$|/tasks\.md$|/constitution\.md$|^agents/agent-registry\.json$|\.agent\.md$|^Copilot-Processing\.md$|^\.github/hooks/)'

# Whitelisted file paths for conductor to WRITE/CREATE
CONDUCTOR_WRITE_WHITELIST_REGEX='^plans/.*-(plan|phase-[0-9]+-complete|complete)\.md$|^agents/agent-registry\.json$|^Copilot-Processing\.md$'

# Source code file extensions (conductor should NEVER read these directly)
SOURCE_CODE_EXTENSIONS_REGEX='\.(ts|tsx|js|jsx|css|scss|py|java|go|rs|rb|php|c|cpp|h|hpp|swift|kt)$'

# ══════════════════════════════════════════════════════════
# Completion File Guard (scope verification enforcement)
# ══════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════
# Mandatory UI Gates (gates that can never be N/A on UI phases)
# ══════════════════════════════════════════════════════════

# Regex: mandatory UI gate names — if listed in a Phase Gate Receipt,
# these can NEVER be marked N/A. Their presence in the table means the
# phase has UI work; marking them N/A is a bypass, not a legitimate exclusion.
MANDATORY_UI_GATE_REGEX='(design[[:space:]]*system|storybook)'

# Regex: match any completion file (plan or phase)
COMPLETION_FILE_REGEX='.*-complete\.md$'

# Regex: match phase completion files specifically (e.g., foo-phase-3-complete.md)
PHASE_COMPLETE_REGEX='.*-phase-[0-9]+-complete\.md$'

# Regex: match plan completion files (any *-complete.md that is NOT a phase completion)
# Used as: matches COMPLETION_FILE_REGEX but NOT PHASE_COMPLETE_REGEX
PLAN_COMPLETE_REGEX='.*-complete\.md$'

# ══════════════════════════════════════════════════════════
# Helper: Check if a path matches any protected directory
# ══════════════════════════════════════════════════════════

is_protected_path() {
  local filepath="$1"
  # Normalize: remove leading ./
  filepath="${filepath#./}"

  for dir in "${PROTECTED_DIRS[@]}"; do
    if [[ "$filepath" == "$dir"* ]]; then
      return 0
    fi
  done

  for file in "${PROTECTED_FILES[@]}"; do
    if [[ "$filepath" == "$file" ]]; then
      return 0
    fi
  done

  return 1
}
