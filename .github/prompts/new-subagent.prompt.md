---
description: "Create a new conductor.powder-orchestrated subagent with full awareness chain integration via platform.system-maintenance"
agent: "conductor.powder"
---

# Add a New Subagent

You are creating a new **subagent** that conductor.powder orchestrates as part of the framework's development lifecycle. This is more involved than creating a standalone agent — subagents must integrate into conductor.powder's delegation protocol, awareness chain, and gate system.

## Context

Subagents live in `.github/agents/<domain>.<role>.agent.md` and are invoked by conductor.powder during her Plan → Implement → Review → Commit cycle. For standalone agents invoked directly by users, use `/new-agent` instead.

## Subagent File Structure

```yaml
---
description: "What this subagent does when delegated work by conductor.powder (50-150 chars)"
tools: ["edit", "search", "read", "execute", "todo", "agent/runSubagent"]
name: "domain.role"
model: Claude Opus 4.6 (copilot)
---

# Name — Role Subagent

[Identity: "You are a [ROLE] SUBAGENT. You receive tasks from a CONDUCTOR parent agent (conductor.powder)."]

## Skill Integration

When conductor.powder provides skill file references in your task prompt:

1. **Read first**: Use `read_file` to read each referenced SKILL.md file before beginning work
2. **Apply knowledge**: Use the patterns, procedures, and templates from the skill to inform your work
3. **Reference skills**: When applying a skill's patterns, briefly note which skill influenced the approach
4. **Skill priority**: If multiple skills provide conflicting guidance, prefer the most specific one

## Instruction Integration

Before editing any file, check which instruction files from `.github/instructions/` apply based on the file type:

1. **Check applicability**: Match the target file's extension/path against instruction `applyTo` patterns
2. **Read instructions**: Use `read_file` to read each applicable instruction file before making changes
3. **Follow rules**: Apply the coding standards, patterns, and constraints from those instructions
4. **Key mappings**:
   - All files → `a11y`, `no-heredoc`, `context-engineering`
   - [Add file-type specific mappings based on what this subagent edits]
5. **conductor.powder may pre-inject**: If conductor.powder includes instruction file paths in the task prompt, read those first

[Core responsibilities, approach, constraints, output format]
```

## Existing Subagents (check for overlap)

| Subagent                        | Role                             | Called By                                                          | Orchestration Layer |
| ------------------------------- | -------------------------------- | ------------------------------------------------------------------ | ------------------- |
| **architecture.context**        | Research & context gathering     | conductor.powder                                                   | Planning            |
| **delivery.tpm**                | Autonomous plan writing          | conductor.powder                                                   | Planning            |
| **architecture.exploration**    | Codebase exploration             | conductor.powder, architecture.context, engineering.implementation | Planning            |
| **engineering.implementation**  | Backend / core implementation    | conductor.powder                                                   | Implementation      |
| **frontend.implementation**     | Frontend UI/UX implementation    | conductor.powder                                                   | Implementation      |
| **`architecture.engineer`**     | Architecture scaffolding         | conductor.powder                                                   | Implementation      |
| **quality.code-review**         | Code review                      | conductor.powder                                                   | Review              |
| **security.application**        | Security audit (PASS/FAIL)       | conductor.powder                                                   | Gate                |
| **frontend.accessibility**      | Accessibility audit (PASS/FAIL)  | conductor.powder                                                   | Gate                |
| **frontend.design-system**      | Design system audit              | conductor.powder                                                   | Specialist          |
| **billing.stripe**              | Stripe billing architecture      | conductor.powder                                                   | Specialist          |
| **platform.pce**                | Legal document drafting          | conductor.powder                                                   | Specialist          |
| **platform.system-maintenance** | System integration & maintenance | conductor.powder                                                   | Specialist          |

## Required Sections in Every Subagent

Every subagent MUST include these sections — platform.system-maintenance will verify and add them if missing:

1. **Skill Integration** — How to read and apply skill files conductor.powder injects
2. **Instruction Integration** — How to read and apply instruction files by file type, with key mappings specific to what files this subagent edits

## Instructions

### Phase 1: Discovery

1. **Ask** what role the subagent fills and what work conductor.powder will delegate to it
2. **Check overlap** against the table above — if the role is already covered, suggest extending the existing subagent instead
3. **Determine orchestration layer**: Is this a Planner, Implementer, Reviewer, Gate, or Specialist?
4. **Identify file types** the subagent will create or edit (determines instruction key mappings)

### Phase 2: Design the Subagent

5. **Determine tools** needed:
   - **Planners/Researchers**: `search`, `read`, `web`, `todo`
   - **Implementers**: `edit`, `search`, `read`, `execute`, `todo`, `agent/runSubagent`
   - **Reviewers/Auditors**: `search`, `read`, `todo` (read-only)
   - **Gate agents**: `search`, `read`, `todo` (read-only, return PASS/FAIL)
   - **Specialists**: Depends on domain — tailor accordingly

6. **Determine instruction key mappings** based on file types the subagent edits:

   | File Types           | Instructions to Include                                                                                       |
   | -------------------- | ------------------------------------------------------------------------------------------------------------- |
   | `*.ts`               | `typescript-5-es2022`, `reactjs`, `tailwind-v4-vite`, `tanstack-start-shadcn-tailwind`, `object-calisthenics` |
   | `*.tsx`              | `reactjs`, `tailwind-v4-vite`, `tanstack-start-shadcn-tailwind`                                               |
   | `*.js, *.mjs, *.cjs` | `nodejs-javascript-vitest`, `reactjs`, `tailwind-v4-vite`                                                     |
   | `*.css, *.scss`      | `tailwind-v4-vite`, `html-css-style-color-guide`                                                              |
   | `*.html`             | `html-css-style-color-guide`                                                                                  |
   | `*.md`               | `markdown`                                                                                                    |
   | `**/Makefile`        | `makefile`                                                                                                    |
   | `**/package.json`    | `typescript-mcp-server`                                                                                       |
   | All files            | `a11y`, `no-heredoc`, `context-engineering`                                                                   |

7. **Determine skills** — check `.github/skills/*/SKILL.md` frontmatter to see if any existing skills should target this subagent. Flag recommendations.

8. **Determine gate requirements** — should conductor.powder run security.application, frontend.accessibility, or both after this subagent's work?

### Phase 3: Create the Agent File

9. **Create** `.github/agents/<domain>.<role>.agent.md` with:
   - YAML frontmatter (description, tools, name, model)
   - Identity statement referencing conductor.powder as the conductor
   - Skill Integration section (standard template)
   - Instruction Integration section with file-type-specific key mappings
   - Core responsibilities and approach
   - Output format (what to report back to conductor.powder)
   - Constraints (scope, what NOT to do)

### Phase 4: Integrate via platform.system-maintenance

10. **Invoke @platform.system-maintenance** to integrate the subagent into the awareness chain:
    - Verifies Skill Integration and Instruction Integration sections exist
    - Adds to Agent Framework list in `copilot.instructions.md`
    - Adds to `agents/agent-registry.json`
    - **Updates conductor.powder.agent.md**:
      - Adds to subagent enumeration list (with number and role description)
      - Adds delegation instructions in `<subagent_instructions>` block
      - If the subagent is a **gate agent**: adds an orchestration section (like security.application/frontend.accessibility sections)
      - If the subagent edits **specific file types**: adds to conductor.powder's instruction-to-file mapping hints
    - Checks if existing skills should add this subagent to their `agents:` arrays
    - Reports PASS/FAIL/NEEDS_REVIEW

11. **Verify** platform.system-maintenance returns PASS before considering the task complete

### Phase 5: Validate

12. **Confirm** the following checklist is complete:

## Integration Checklist

- [ ] Agent file created with Skill Integration + Instruction Integration sections
- [ ] Instruction key mappings are correct for the file types this subagent edits
- [ ] No role overlap with existing subagents
- [ ] `copilot.instructions.md` — Agent Framework list updated
- [ ] `agents/agent-registry.json` — entry added with calledBy, tools, skills, status
- [ ] `conductor.powder.agent.md` — added to subagent enumeration list
- [ ] `conductor.powder.agent.md` — delegation block added in `<subagent_instructions>`
- [ ] `conductor.powder.agent.md` — orchestration section added (if gate or specialist with gate rules)
- [ ] Existing skills checked for targeting recommendations
- [ ] Gate requirements documented (which gates run after this subagent's work)
- [ ] platform.system-maintenance returned PASS

## Naming Convention

Subagent filenames follow the pattern: `<domain>.<role>.agent.md`

All framework agents are named after the Alien franchise. Suggest a thematic name that fits the role:

- Ships: billing.stripe, engineering.implementation, frontend.design-system, frontend.accessibility, delivery.tpm
- Locations: architecture.context, `architecture.engineer` (`architecture.engineer`'s Hope)
- Vessels: frontend.implementation (dropship), quality.code-review (shuttle)
- Characters: platform.system-maintenance (synthetic), frontend.storybook, platform.git, quality.test-architecture, frontend.marketing-site
- Entities: security.application (not canon but fits), architecture.exploration

## User Input

The subagent I need: {{input}}
