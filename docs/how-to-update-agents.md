# How To: Update Agents When Skills, Prompts, or Instructions Change

A step-by-step guide for keeping Snow Patrol's agents and subagents in sync when you add, remove, or modify skills, prompts, or instruction files.

## Why This Matters

Snow Patrol has a chain of awareness that connects skills and instructions to the agents that use them:

```text
Skill / Instruction file
    ↓
copilot.instructions.md (master index — all agents read this)
    ↓
conductor.powder.agent.md (discovery protocols — injects into subagent prompts)
    ↓
Individual subagent files (Skill Integration + Instruction Integration sections)
```

When you add a new skill or instruction, you need to update each link in this chain so agents discover and apply the new knowledge. If any link is missing, agents will silently ignore the new file.

## Scenario 0: Updating Powder's orchestration model

Changes to Powder's execution behavior must be treated as framework changes, not isolated prompt tweaks.

When changing loop behavior, `--auto` policy, launch-set rules, or rolling task memory:

1. Update `.github/agents/conductor.powder.agent.md`
2. Update the user-facing workflow docs in `docs/how-to-setup-new-project.md`
3. Update memory guidance in `docs/context-memory-guide.md`
4. Update hook docs in `docs/available-hooks.md` if the behavior changes what is soft vs hard enforcement
5. Update prompt docs in `docs/available-prompts.md` if users can invoke the new mode directly
6. Update or add framework tests, especially `tests/hooks/test-conductor-delegation-guard.sh`, when conductor-owned artifacts or allowed paths change

Use `platform.system-maintenance` when possible so the awareness chain stays synchronized.

## Automated Approach: Use platform.system-maintenance

The **platform.system-maintenance** subagent automates the entire integration process. Instead of manually editing 3-4 files, you can:

### After creating a new artifact

Ask conductor.powder or invoke platform.system-maintenance directly:

```
@platform.system-maintenance Integrate the new skill at .github/skills/my-new-skill/SKILL.md
```

platform.system-maintenance will:

1. Parse the artifact's frontmatter (`agents:`, `applyTo:`, etc.)
2. Update `copilot.instructions.md` (add to Skill Index or Instruction Index)
3. Update `conductor.powder.agent.md` (mapping hints or file mappings)
4. Update each target subagent's Instruction/Skill Integration sections
5. Update `agents/agent-registry.json`
6. Validate all changes and return a PASS/FAIL report

### Full audit (verify all wiring)

```
@platform.system-maintenance Run a full audit of all agent wiring
```

platform.system-maintenance will cross-reference every skill, instruction, and agent against all integration points and report any gaps.

### When conductor.powder invokes platform.system-maintenance automatically

conductor.powder will invoke platform.system-maintenance whenever any subagent creates a new skill, instruction, prompt, or agent during a development cycle. This keeps the chain self-healing.

### When to use manual steps instead

The manual scenarios below are still useful for:

- Understanding what platform.system-maintenance does under the hood
- Making targeted edits when platform.system-maintenance's automated changes need adjustment
- Troubleshooting integration issues
- Learning the Snow Patrol architecture

---

## Scenario 1: Adding a New Skill

Skills live in `.github/skills/<skill-name>/SKILL.md`. Each skill declares which agents should use it via the `agents:` field in its YAML frontmatter.

### Step 1: Create the skill file

Create `.github/skills/<skill-name>/SKILL.md` with proper frontmatter:

```yaml
---
name: my-new-skill
description: "What this skill teaches agents to do"
agents: ["frontend.implementation", "engineering.implementation"]
---
```

The `agents:` array lists exactly which subagents should receive this skill. Use the agent names as they appear in the `.agent.md` filenames (without the `.agent.md` extension).

### Step 2: Update the Skill Index in copilot.instructions.md

Open `.github/copilot.instructions.md` and add a row to the **Skill Index** table:

```markdown
| `my-new-skill` | frontend.implementation, engineering.implementation | Description of what it teaches |
```

This table is the master reference that all agents can see. It lives in the "Skills (MANDATORY for Matching Agents)" section.

### Step 3: Update conductor.powder's skill-agent mappings (if needed)

Open `.github/agents/conductor.powder.agent.md` and find the **Skill Discovery & Injection Protocol** section. conductor.powder dynamically scans skill frontmatter, so she will auto-discover new skills. However, check that the "Current skill-agent mappings" guidance covers your new agent targets:

```markdown
- **frontend.implementation**: Check for skills targeting frontend/UI work
- **engineering.implementation**: Check for any skills that list them in `agents:`
```

If your new skill targets an agent not mentioned in the mapping hints, add a line for it.

### Step 4: Verify subagent has Skill Integration section

Open the target subagent file (e.g., `.github/agents/frontend.implementation.agent.md`) and confirm it has a **Skill Integration** section:

```markdown
## Skill Integration

When conductor.powder provides skill file references in your task prompt:

1. **Read first**: Use `read_file` to read each referenced SKILL.md file before beginning work
2. **Apply knowledge**: Use the patterns, procedures, and templates from the skill
3. **Reference skills**: Note which skill influenced the approach
4. **Skill priority**: Prefer the skill most specific to the current task
```

All Snow Patrol subagents already have this section. If you create a **new** subagent, add this section to it.

### Summary: Adding a skill

| What to update                       | Where                                      | Action                                   |
| ------------------------------------ | ------------------------------------------ | ---------------------------------------- |
| Skill file                           | `.github/skills/<name>/SKILL.md`           | Create with `agents:` in frontmatter     |
| Master index                         | `.github/copilot.instructions.md`          | Add row to Skill Index table             |
| conductor.powder (usually automatic) | `.github/agents/conductor.powder.agent.md` | Verify mapping hints cover target agents |
| Target subagents                     | `.github/agents/<name>.agent.md`           | Confirm Skill Integration section exists |

---

## Scenario 2: Adding a New Instruction File

Instructions live in `.github/instructions/<name>.instructions.md`. Each instruction declares which files it applies to via the `applyTo` glob pattern in its YAML frontmatter.

### Step 1: Create the instruction file

Create `.github/instructions/<name>.instructions.md` with proper frontmatter:

```yaml
---
description: "What coding standards this enforces"
applyTo: "**/*.ts, **/*.tsx"
---
```

The `applyTo` pattern uses glob syntax. Common patterns:

| Pattern                | Matches                        |
| ---------------------- | ------------------------------ |
| `**`                   | All files (global instruction) |
| `**/*.ts`              | All TypeScript files           |
| `**/*.md`              | All Markdown files             |
| `**/*.css, **/*.scss`  | All CSS/SCSS files             |
| `**/Makefile, **/*.mk` | All Makefiles                  |
| `**/SKILL.md`          | All skill files                |

### Step 2: Update the Instruction Index in copilot.instructions.md

Open `.github/copilot.instructions.md` and add a row to the **Instruction Index** table:

```markdown
| `my-new-instruction.instructions.md` | `**/*.ts, **/*.tsx` | What it enforces |
```

This table lives in the "Contextual Instructions (MANDATORY)" section.

### Step 3: Update conductor.powder's instruction-to-file mappings

Open `.github/agents/conductor.powder.agent.md` and find the **Instruction Discovery & Injection Protocol** section. Add your new instruction to the "Known instruction-to-file mappings" list:

```markdown
- `*.ts` → `typescript-5-es2022.instructions.md`, ..., `my-new-instruction.instructions.md`
```

Add it under every file pattern it applies to. If it uses `applyTo: "**"` (all files), add it to the global instructions list:

```markdown
Global instructions (apply to ALL files — always include):

- `a11y.instructions.md` — WCAG 2.2 AA accessibility
- `no-heredoc.instructions.md` — Never use heredoc/cat/echo for file creation
- `context-engineering.instructions.md` — Code structure for Copilot context
- `my-new-instruction.instructions.md` — What it does
```

### Step 4: Update subagent Instruction Integration sections

Open each subagent that edits the matching file types and add the new instruction to their **Instruction Integration** key mappings. For example, if the new instruction applies to `*.ts` files, update every subagent that edits TypeScript:

```markdown
## Instruction Integration

... 4. **Key mappings**:

- `*.ts` → `typescript-5-es2022`, `reactjs`, `tailwind-v4-vite`, `tanstack-start-shadcn-tailwind`, `my-new-instruction`
```

**Which subagents edit which file types:**

| File types                       | Subagents that edit them                                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `*.ts, *.tsx`                    | engineering.implementation, frontend.implementation, `architecture.engineer`                               |
| `*.js, *.mjs`                    | engineering.implementation                                                                                 |
| `*.css, *.scss`                  | frontend.implementation                                                                                    |
| `*.md`                           | engineering.implementation, frontend.implementation, platform.pce, billing.stripe, `architecture.engineer` |
| `*.html`                         | frontend.implementation                                                                                    |
| Firestore rules, Cloud Functions | engineering.implementation, security.application                                                           |
| All files (global)               | All subagents                                                                                              |

### Summary: Adding an instruction

| What to update   | Where                                         | Action                                      |
| ---------------- | --------------------------------------------- | ------------------------------------------- |
| Instruction file | `.github/instructions/<name>.instructions.md` | Create with `applyTo` in frontmatter        |
| Master index     | `.github/copilot.instructions.md`             | Add row to Instruction Index table          |
| conductor.powder | `.github/agents/conductor.powder.agent.md`    | Add to instruction-to-file mappings         |
| Target subagents | `.github/agents/<name>.agent.md`              | Add to Instruction Integration key mappings |

---

## Scenario 3: Adding a New Prompt

Prompts live in `.github/prompts/<name>.prompt.md`. Prompts are self-contained and do NOT require agent file updates — they work immediately after creation.

### Step 1: Create the prompt file

Create `.github/prompts/<name>.prompt.md` with proper frontmatter:

```yaml
---
description: "What this prompt does"
agent: "agent"
---
```

### Step 2: Reference in workflows (optional)

If the new prompt is part of the ship-application workflow or another master prompt, update those files to reference it:

- `.github/prompts/ship-application.prompt.md` — The master 11-step workflow
- Any how-to docs in `docs/` that list available prompts

### Why prompts don't need agent updates

Prompts are user-facing entry points, not agent knowledge. When a user runs `/my-new-prompt`, Copilot reads the prompt file directly and passes its instructions to agents. The agents don't need to "know about" prompts ahead of time — they receive the prompt content in their task context.

### Summary: Adding a prompt

| What to update                  | Where                                        | Action                  |
| ------------------------------- | -------------------------------------------- | ----------------------- |
| Prompt file                     | `.github/prompts/<name>.prompt.md`           | Create with frontmatter |
| Master workflow (if applicable) | `.github/prompts/ship-application.prompt.md` | Add reference           |
| Documentation (if applicable)   | `docs/`                                      | Update how-to guides    |

---

## Scenario 4: Removing a Skill, Instruction, or Prompt

Reverse the addition steps:

### Removing a skill

1. Delete `.github/skills/<name>/SKILL.md` (and the directory)
2. Remove the row from the Skill Index table in `copilot.instructions.md`
3. No changes needed in conductor.powder (she scans dynamically and won't find it)
4. No changes needed in subagents (they only read skills that conductor.powder injects)

### Removing an instruction

1. Delete `.github/instructions/<name>.instructions.md`
2. Remove the row from the Instruction Index table in `copilot.instructions.md`
3. Remove from conductor.powder's instruction-to-file mappings in `conductor.powder.agent.md`
4. Remove from subagent Instruction Integration key mappings

### Removing a prompt

1. Delete `.github/prompts/<name>.prompt.md`
2. Remove references from `ship-application.prompt.md` and `docs/` if applicable

---

## Scenario 5: Adding a New Subagent

When you create an entirely new subagent:

### Step 1: Create the agent file

Create `.github/agents/<name>.agent.md` with frontmatter:

```yaml
---
description: "What this agent does"
tools: ["edit", "search", "execute/runInTerminal", ...]
name: "My Agent - Sub Agent"
model: Claude Opus 4.6 (copilot)
---
```

### Step 2: Add Skill Integration section

Add this to the agent's markdown body:

```markdown
## Skill Integration

When conductor.powder provides skill file references in your task prompt:

1. **Read first**: Use `read_file` to read each referenced SKILL.md file before beginning work
2. **Apply knowledge**: Use the patterns, procedures, and templates from the skill to inform your work
3. **Reference skills**: When applying a skill's patterns, briefly note which skill influenced the approach
4. **Skill priority**: If multiple skills provide conflicting guidance, prefer the most specific one
```

### Step 3: Add Instruction Integration section

Add the appropriate key mappings based on what file types this agent will edit:

```markdown
## Instruction Integration

Before editing any file, check which instruction files from `.github/instructions/` apply based on the file type:

1. **Check applicability**: Match the target file's extension/path against instruction `applyTo` patterns
2. **Read instructions**: Use `read_file` to read each applicable instruction file before making changes
3. **Follow rules**: Apply the coding standards, patterns, and constraints from those instructions
4. **Key mappings**:
   - `*.ts` → `typescript-5-es2022`, `reactjs`, `tailwind-v4-vite`, `tanstack-start-shadcn-tailwind`
   - `*.tsx` → `reactjs`, `tailwind-v4-vite`, `tanstack-start-shadcn-tailwind`
   - `*.css` → `tailwind-v4-vite`, `html-css-style-color-guide`
   - `*.md` → `markdown`
   - All files → `a11y`, `no-heredoc`, `context-engineering`
5. **conductor.powder may pre-inject**: If conductor.powder includes instruction file paths in the task prompt, read those first
```

Only include the file-type mappings relevant to this agent's work.

### Step 4: Register in conductor.powder

Open `.github/agents/conductor.powder.agent.md` and update:

1. **Subagent list** (near the top) — Add the new agent with its description
2. **Subagent instructions** (in `<subagent_instructions>`) — Add delegation guidance for when and how to invoke it
3. **Skill mappings** — If skills should target this agent, update the hints
4. **Instruction mappings** — If this agent edits specific file types, note it

### Step 5: Update skills that should target this agent

If existing skills should also be injected into this agent, update their `agents:` arrays:

```yaml
# In .github/skills/design-system/SKILL.md
agents:
  [
    "frontend.design-system",
    "frontend.implementation",
    "architecture.engineer",
    "my-new",
  ]
```

And update the Skill Index table in `copilot.instructions.md` to reflect the new target.

### Summary: Adding a subagent

| What to update         | Where                                      | Action                                         |
| ---------------------- | ------------------------------------------ | ---------------------------------------------- |
| Agent file             | `.github/agents/<name>.agent.md`           | Create with Skill + Instruction Integration    |
| conductor.powder       | `.github/agents/conductor.powder.agent.md` | Add to subagent list + delegation instructions |
| Skills (if applicable) | `.github/skills/*/SKILL.md`                | Add agent to `agents:` arrays                  |
| Master index           | `.github/copilot.instructions.md`          | Update Skill Index if skill targets changed    |

---

## Quick Reference: Files to Touch

| Change             |   copilot.instructions.md   | conductor.powder.agent.md |        Subagent files        |     Skill files      |
| ------------------ | :-------------------------: | :-----------------------: | :--------------------------: | :------------------: |
| Add skill          |       ✓ (Skill Index)       |    ○ (verify mappings)    |  ○ (verify section exists)   |          —           |
| Add instruction    |    ✓ (Instruction Index)    |     ✓ (file mappings)     |       ✓ (key mappings)       |          —           |
| Add prompt         |        ○ (optional)         |             —             |              —               |          —           |
| Add subagent       | ✓ (if skill targets change) |     ✓ (subagent list)     |              —               | ○ (update `agents:`) |
| Remove skill       |       ✓ (remove row)        |             —             |              —               |          —           |
| Remove instruction |       ✓ (remove row)        |    ✓ (remove mapping)     | ✓ (remove from key mappings) |          —           |
| Remove prompt      |        ○ (optional)         |             —             |              —               |          —           |

✓ = Required, ○ = Check/optional, — = No change needed

---

## Scenario 6: Adding Handoffs to an Agent

Handoffs enable guided transitions between agents. When one agent finishes its work, handoff buttons appear in the chat interface, suggesting the next agent in the workflow.

### When to add handoffs

- An agent's output is frequently the input for another agent (e.g., `speckit.specify` → `speckit.plan`)
- You want to create a guided workflow without requiring users to remember the next step
- The transition between agents is a natural part of a pipeline

### The `handoffs:` frontmatter format

Add a `handoffs:` block to the agent's YAML frontmatter:

```yaml
---
description: "Agent description"
name: "my-agent"
tools: ["read", "edit", "search"]
handoffs:
  - label: Review Implementation
    agent: quality.code-review
    prompt: "Review the changes above for correctness and quality."
    send: false
  - label: Write Tests
    agent: quality.test-architecture
    prompt: "Write tests for the implementation above."
    send: false
---
```

### Handoff properties

| Property | Required | Description                                                     |
| -------- | -------- | --------------------------------------------------------------- |
| `label`  | Yes      | Button text shown in the chat UI (use action-oriented language) |
| `agent`  | Yes      | Target agent identifier (filename without `.agent.md`)          |
| `prompt` | No       | Pre-filled prompt text for the target agent                     |
| `send`   | No       | If `true`, auto-submits the prompt. Default: `false`            |

### Guidelines

- **Max 3 handoffs per agent** — keep transitions focused on the most logical next steps
- **Use `send: false`** (recommended) — lets users review the pre-filled prompt before sending, maintaining human-in-the-loop control
- **Action-oriented labels** — "Review Implementation", "Write Tests", "Commit Changes" (not "Next" or "Continue")
- **Context-aware prompts** — reference the completed work (e.g., "Review the changes above") so the target agent has context

### Summary: Adding handoffs

| What to update | Where                            | Action                                        |
| -------------- | -------------------------------- | --------------------------------------------- |
| Agent file     | `.github/agents/<name>.agent.md` | Add `handoffs:` to YAML frontmatter           |
| No other files | —                                | Handoffs are self-contained in the agent file |

---

## Multi-Platform Paths

Snow Patrol supports multiple platforms. The `install.sh` script copies agents to the correct location for each platform:

| Platform              | Agent directory   | Instructions directory  | Commands directory  |
| --------------------- | ----------------- | ----------------------- | ------------------- |
| GitHub Copilot        | `.github/agents/` | `.github/instructions/` | `.claude/commands/` |
| Claude Code           | `.claude/agents/` | `.claude/commands/`     | `.claude/commands/` |
| Snowflake Cortex Code | `.cortex/agents/` | `.cortex/instructions/` | `.cortex/commands/` |
| Snowflake SnowWork    | `.cortex/agents/` | `.cortex/instructions/` | `.cortex/commands/` |

When editing agents, always edit the source files in the Snow Patrol repository. The install script handles all path transformations — you do not need to maintain separate copies for each platform.

---

## Tips

- **Use `@platform.system-maintenance` for automation**. After creating any new skill, instruction, prompt, or agent, invoke platform.system-maintenance to handle all the integration updates automatically. It validates and returns PASS/FAIL.
- **Use `@platform.system-maintenance` for audits**. Run "full audit" periodically to catch integration drift — missing table rows, stale mappings, or subagents missing Skill/Instruction Integration sections.
- **Use the `/new-agent` prompt** when creating new subagents. It follows the Snow Patrol patterns and includes Skill + Instruction Integration sections automatically.
- **conductor.powder discovers skills dynamically** by scanning `.github/skills/*/SKILL.md` frontmatter before each delegation. You don't need to hardcode every mapping — but the mapping hints in conductor.powder help her match efficiently.
- **Instructions are pattern-matched**, not hardcoded. If you add an instruction with `applyTo: "**/*.ts"`, any agent editing TypeScript should pick it up — but only if the key mappings in the subagent files include it.
- **Test after changes**. After updating, try a small task through conductor.powder to verify the new skill or instruction gets injected into the right subagent's prompt.
- **Prompts are fire-and-forget**. Creating a new `.prompt.md` file makes it immediately available as a `/slash-command` in Copilot Chat. No other files need updating unless it's part of a documented workflow.
