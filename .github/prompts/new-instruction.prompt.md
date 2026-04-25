---
description: "Create a new coding instruction file and integrate it into the agent chain via platform.system-maintenance"
agent: "conductor.powder"
---

# Add a New Instruction

You are creating a new instruction file for the agent architecture and integrating it into the awareness chain.

## Context

Instructions live in `.github/instructions/<name>.instructions.md` and define coding standards that agents follow when editing matching files. After creating the instruction, **@platform.system-maintenance** handles integration automatically.

## Instruction File Structure

```yaml
---
description: "What coding standards this enforces (50-150 chars)"
applyTo: "**/*.ts, **/*.tsx"
---

# Instruction Title

[Coding standards, rules, and constraints]
[Examples of correct and incorrect patterns]
[When to apply and when to skip]
```

## Common applyTo Patterns

| Pattern                       | Matches                        |
| ----------------------------- | ------------------------------ |
| `**`                          | All files (global instruction) |
| `**/*.ts`                     | All TypeScript files           |
| `**/*.tsx`                    | All TSX/React component files  |
| `**/*.js, **/*.mjs, **/*.cjs` | All JavaScript files           |
| `**/*.css, **/*.scss`         | All stylesheets                |
| `**/*.md`                     | All Markdown files             |
| `**/*.html`                   | All HTML files                 |
| `**/Makefile, **/*.mk`        | All Makefiles                  |
| `**/*.json`                   | All JSON files                 |
| `**/SKILL.md`                 | All skill files                |
| `**/*.prompt.md`              | All prompt files               |
| `**/*.instructions.md`        | All instruction files          |

## Instructions

1. **Ask** what coding standards the instruction should enforce and which file types it applies to
2. **Create** `.github/instructions/<name>.instructions.md` with proper YAML frontmatter including the `applyTo` glob pattern
3. **Invoke @platform.system-maintenance** to integrate the instruction into the awareness chain:
   - Adds to Instruction Index table in `copilot.instructions.md`
   - Adds to conductor.powder's instruction-to-file mappings
   - Updates Instruction Integration key mappings in all affected subagent files
4. **Verify** platform.system-maintenance returns PASS before considering the task complete

## Which Subagents Edit Which Files

platform.system-maintenance uses this to know which subagents need their key mappings updated:

| File Types           | Subagents                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `*.ts, *.tsx`        | engineering.implementation, frontend.implementation, `architecture.engineer`                               |
| `*.js, *.mjs, *.cjs` | engineering.implementation                                                                                 |
| `*.css, *.scss`      | frontend.implementation                                                                                    |
| `*.md`               | engineering.implementation, frontend.implementation, platform.pce, billing.stripe, `architecture.engineer` |
| `*.html`             | frontend.implementation                                                                                    |
| `**` (all files)     | All subagents                                                                                              |

## User Input

The instruction I need: {{input}}
