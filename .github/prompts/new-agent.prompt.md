---
description: "Create a new standalone agent and integrate it into the agent system via platform.system-maintenance"
agent: "conductor.powder"
---

# Add a New Agent

You are creating a new **standalone agent** for the agent architecture and integrating it into the system via platform.system-maintenance.

## Context

Agents live in `.github/agents/<name>.agent.md`. Standalone agents are invoked directly by users or referenced in prompts — they are NOT orchestrated by conductor.powder. For agents that conductor.powder delegates work to, use `/new-subagent` instead.

## Agent File Structure

```yaml
---
description: "What this agent does (shown in chat menu, 50-150 chars)"
name: "Agent Display Name"
argument-hint: "Guidance for users on what to provide"
tools: ["read", "edit", "search"]
model: Claude Sonnet 4.5
---

# Agent Name — Role Title

[Identity statement: "You are a [role] specialized in [purpose]"]
[Core responsibilities and operating guidelines]
[Constraints and boundaries — what NOT to do]
[Output format specifications]
[Quality standards and success criteria]
```

## Tool Selection Guide

| Agent Type         | Recommended Tools                                           |
| ------------------ | ----------------------------------------------------------- |
| **Read-only**      | `search`, `read`, `web`                                     |
| **Planning**       | `search`, `read`, `web`, `todo`                             |
| **Implementation** | `edit`, `search`, `read`, `execute`, `todo`                 |
| **Review/Audit**   | `search`, `read`, `todo`                                    |
| **Full access**    | `edit`, `search`, `execute`, `read`, `web`, `agent`, `todo` |

## Existing Standalone Agents (avoid overlap)

| Agent                    | Purpose                                              |
| ------------------------ | ---------------------------------------------------- |
| **design.ux-engineer**   | CRUD completeness, flow standards, Storybook-first   |
| **Custom Agent Foundry** | Designs and creates new custom agents                |
| **Critical Thinking**    | Challenges assumptions, encourages rigorous analysis |

## Instructions

1. **Ask** what the agent should do, its target audience, and what tools it needs
2. **Check** existing agents for overlap — if the role is already covered, suggest extending the existing agent instead
3. **Create** `.github/agents/<name>.agent.md` with proper YAML frontmatter
4. **Include** in the agent body:
   - Clear identity statement and role definition
   - Core responsibilities (bullet list)
   - Operating guidelines and approach
   - Constraints and boundaries (what it must NOT do)
   - Output format specifications
   - Quality checklist (if applicable)
5. **Invoke @platform.system-maintenance** to integrate the agent into the system:
   - Adds to Agent Framework list in `copilot.instructions.md`
   - Adds to `agents/agent-registry.json`
   - Checks if existing skills should target this agent
   - Reports recommendations for user review
6. **Verify** platform.system-maintenance returns PASS before considering the task complete

## Checklist Before Creating

- [ ] Purpose is clear and distinct from existing agents
- [ ] Tool selection follows least-privilege (only what's needed)
- [ ] Description is concise and shows well in the chat menu
- [ ] Agent name follows naming convention (kebab-case filename)
- [ ] Not duplicating a role already filled by a subagent or standalone agent

## User Input

The agent I need: {{input}}
