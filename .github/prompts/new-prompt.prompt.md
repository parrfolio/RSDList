---
description: "Create a new prompt file and optionally integrate it into workflows via platform.system-maintenance"
agent: "conductor.powder"
---

# Add a New Prompt

You are creating a new prompt file for the agent architecture.

## Context

Prompts live in `.github/prompts/<name>.prompt.md` and are user-facing slash commands. They work immediately after creation — no agent file updates required. **@platform.system-maintenance** is invoked only to verify consistency and check if the prompt should be referenced in workflows.

## Prompt File Structure

```yaml
---
description: "What this prompt does (shown in slash command menu)"
agent: "conductor.powder"
---

# Prompt Title

[Context — which agents to use and why]
[Requirements — what the output must include]
[Instructions — step-by-step workflow]
[User Input section with {{input}} placeholder]
```

## Agent Attribute Values

| Value              | When to Use                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| `conductor.powder` | Multi-step tasks requiring orchestrated agent work (default)            |
| `agent`            | Generic agent mode without conductor.powder orchestration (rarely used) |
| `edit`             | Inline code edits in the editor                                         |
| `ask`              | Informational questions, no file changes                                |

## Available Agents to Reference

| Agent                            | Use When...                                   |
| -------------------------------- | --------------------------------------------- |
| **@conductor.powder**            | Complex multi-step orchestrated work          |
| **@engineering.implementation**  | Direct backend implementation (simple tasks)  |
| **@frontend.implementation**     | Direct frontend implementation (simple tasks) |
| **@delivery.tpm**                | Autonomous planning                           |
| **@architecture.context**        | Research and context gathering                |
| **@architecture.exploration**    | Codebase exploration                          |
| **@quality.code-review**         | Code review                                   |
| **@security.application**        | Security audit                                |
| **@frontend.accessibility**      | Accessibility audit                           |
| **@frontend.design-system**      | Design system audit                           |
| **@platform.system-maintenance** | Agent system integration                      |
| **@design.ux-engineer**          | UX compliance and flow standards              |

## Instructions

1. **Ask** what the prompt should do, which agents it should invoke, and what user input it needs
2. **Create** `.github/prompts/<name>.prompt.md` with proper YAML frontmatter
3. **Update** `docs/available-prompts.md` — add the new prompt to the appropriate category table, update the total count and category count
4. **Invoke @platform.system-maintenance** for consistency check:
   - Checks if the prompt should be referenced in `ship-application.prompt.md`
   - Checks if docs need updating
   - Reports PASS (prompts don't require agent file changes)
5. **If the prompt is part of a workflow**, update the master workflow prompt or documentation as platform.system-maintenance recommends

## User Input

The prompt I need: {{input}}
