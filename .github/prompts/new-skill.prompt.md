---
description: "Create a new agent skill and integrate it into the agent chain via platform.system-maintenance"
agent: "conductor.powder"
---

# Add a New Skill

You are creating a new skill for the agent architecture and integrating it into the awareness chain.

## Context

Skills live in `.github/skills/<skill-name>/SKILL.md` and provide domain-specific knowledge to agents. After creating the skill, **@platform.system-maintenance** handles integration automatically.

## Skill File Structure

```yaml
---
name: my-skill-name
description: "What this skill teaches agents to do (50-150 chars)"
agents: ["frontend.implementation", "engineering.implementation"]
---

# Skill Title

[Domain knowledge, patterns, procedures, templates]
[Examples and best practices]
[Decision frameworks for the domain]
```

## Available Target Agents

| Agent                          | Role                   | Good for skills about...                      |
| ------------------------------ | ---------------------- | --------------------------------------------- |
| **engineering.implementation** | Backend implementer    | Backend patterns, APIs, data models, testing  |
| **frontend.implementation**    | Frontend implementer   | UI patterns, components, styling, animations  |
| **`architecture.engineer`**    | Architectural engineer | Architecture, scaffolding, project structure  |
| **frontend.design-system**     | Design systems         | Design tokens, component libraries, Figma     |
| **design.ux-engineer**         | UX compliance          | UX patterns, flows, CRUD, Storybook           |
| **architecture.context**       | Research/planning      | Research methods, analysis frameworks         |
| **delivery.tpm**               | Autonomous planner     | Planning patterns, estimation, prioritization |
| **security.application**       | Security auditor       | Security patterns, threat models              |
| **frontend.accessibility**     | Accessibility auditor  | A11y patterns, WCAG techniques                |
| **quality.code-review**        | Code reviewer          | Review checklists, quality criteria           |

## Instructions

1. **Ask** what domain knowledge the skill should cover and which agents should receive it
2. **Create** `.github/skills/<skill-name>/SKILL.md` with proper YAML frontmatter including the `agents:` array
3. **Invoke @platform.system-maintenance** to integrate the skill into the awareness chain:
   - Adds to Skill Index table in `copilot.instructions.md`
   - Verifies conductor.powder's skill-agent mapping hints
   - Confirms target subagents have Skill Integration sections
   - Updates `agent-registry.json`
4. **Verify** platform.system-maintenance returns PASS before considering the task complete

## User Input

The skill I need: {{input}}
