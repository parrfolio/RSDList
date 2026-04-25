---
name: conductor-commands
description: >
  Command handler output formats and scoring rules for conductor.powder's
  /list-agents and /agent-graph slash commands. Extracted from
  conductor.powder.agent.md to reduce conductor context size.
agents:
  - conductor.powder
---

# Conductor Command Handlers

> **Origin**: Extracted from `conductor.powder.agent.md`. Invoked by conductor.powder when users issue `/list-agents` or `/agent-graph`.

## /list-agents

Show status of all agents with a health score.

### Output format (strict)

1. **Agents Health Table**
   Columns:
   - Agent
   - Role
   - Status
   - Health (0–100)
   - Health Grade (A/B/C/D/F)
   - Last Activity
   - Called By
   - Notes

2. **Top Issues**
   - Sorted by severity (Blocking, High, Medium, Low)

3. **Recommended Actions**
   - 3 concrete next steps to raise health

### Health scoring rules (deterministic)

Compute Health = 100 - penalties.
Never exceed 100, never go below 0.

Penalties:

- Disabled agent: -40
- Missing agent filePath: -50
- Invalid frontmatter (cannot parse YAML): -50
- No description in frontmatter: -10
- Missing tools list: -5
- No role assigned: -10
- Never run (lastRunAt missing): -10
- Last run older than 14 days: -10
- Last review status NEEDS_REVISION: -10
- Last review status FAILED: -25
- For security-relevant agents (security.application, billing.stripe, Auth-related):
  - Missing PASS/FAIL contract in output instructions: -15
- For conductor (Powder):
  - Missing security gate section: -20

Grades:

- A: 90–100
- B: 80–89
- C: 70–79
- D: 60–69
- F: <60

Availability:

- If file exists + status enabled => "Available"
- If file missing or status disabled => "Not available"
- If filesystem access blocked => "Unknown (insufficient access)"

Rules:

- Do not hallucinate activity. If missing, report "None recorded."
- If registry missing fields, call them out in Notes and apply penalties.

## /agent-graph

Purpose: visualize relationships between agents (who calls who).

### Output format (strict)

1. **Mermaid Graph** (preferred)
2. **Plain Text Adjacency List** (fallback)
3. **Unknown Links** (what couldn't be inferred)

### Relationship sources (in order)

1. `agents/agent-registry.json` calledBy fields
2. Powder's known subagent list (static map)
3. If still unknown: mark as Unknown

### Mermaid format

Use flowchart TD:

- Conductor node highlighted
- Security gate relationship shown (Powder -> security.application)
- Example:

```mermaid
flowchart TD
    conductor_powder[conductor.powder (Conductor)] --> architecture_context[architecture.context (Planner)]
    conductor_powder --> architecture_exploration[architecture.exploration (Explorer)]
    conductor_powder --> engineering_implementation[engineering.implementation (Implementer)]
    conductor_powder --> quality_code_review[quality.code-review (Review)]
    conductor_powder --> security_application[security.application (Security Gate)]
    conductor_powder --> frontend_accessibility[frontend.accessibility (A11y Gate)]
    conductor_powder --> billing_stripe[billing.stripe (Billing)]
    conductor_powder --> platform_pce[platform.pce (Legal)]
    conductor_powder --> frontend_implementation[frontend.implementation (Frontend)]
    conductor_powder --> frontend_design_system[frontend.design-system (Design Systems)]
    delivery_tpm[delivery.tpm (Planner)] --> conductor_powder
    delivery_tpm --> frontend_accessibility
    architecture_context --> architecture_exploration
    engineering_implementation --> architecture_exploration
    engineering_implementation --> architecture_context
    frontend_implementation --> frontend_accessibility
    quality_code_review --> frontend_accessibility
```

Rules:

- Only include edges that are known from sources.
- If an agent exists but calledBy is unknown, include it as an unlinked node and list it in Unknown Links.
