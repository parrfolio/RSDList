---
name: ux-researcher-designer
description: >
  UX research and design toolkit for data-driven persona generation, journey
  mapping, usability testing frameworks, and research synthesis. Use for user
  research, persona creation, journey mapping, and design validation. ALWAYS
  state data sources, sample sizes, and confidence levels in every deliverable.
agents: ["design.ux-engineer", "architecture.context"]
---

## UX Researcher and Designer

Research methodology and deliverable framework for user-centered design.
Every output MUST be grounded in data or explicitly labeled as hypothesis.

## Research Method Decision Tree

| User Need                       | Method              | Minimum Data                                   |
| ------------------------------- | ------------------- | ---------------------------------------------- |
| "Who are our users?"            | Persona generation  | ≥ 5 interviews OR ≥ 100 behavioral data points |
| "What's the user experience?"   | Journey mapping     | ≥ 3 user interviews covering full flow         |
| "Is this usable?"               | Usability testing   | 5–8 participants per round                     |
| "What do users prefer?"         | A/B testing         | ≥ 30 per variant for statistical significance  |
| "How should info be organized?" | Card sorting        | ≥ 15 (open sort), ≥ 30 (closed sort)           |
| "What are pain points?"         | Survey + interviews | Survey: ≥ 30 responses; Interviews: ≥ 5        |

If minimum data thresholds are not met, MUST label findings as
"Low confidence — below minimum sample size (N=X, minimum=Y)."

## Hard Constraints

### Data Integrity (NON-NEGOTIABLE)

- **NEVER** present synthetic or assumed data as real research findings
- **ALWAYS** state: data source, sample size, confidence level
- Every persona MUST be labeled: "Data-backed (N=X)" or "Hypothesis (needs validation)"
- Journey maps MUST include pain points AND the data source for each pain point
- **NEVER** extrapolate beyond what the data supports without explicit caveat
- **ALWAYS** distinguish between observation ("Users did X") and interpretation ("Users likely feel Y")

### Privacy and Ethics

- **NEVER** include PII in deliverables unless anonymized
- **ALWAYS** note consent status and data handling approach in research artifacts
- **MUST** define inclusion/exclusion criteria for participant recruitment
- **MUST** document compensation approach for research participants

## Deliverable Templates

### Persona

Every persona MUST include:

- **Name**: Fictional, representative
- **Photo**: Placeholder only (NEVER use real photos without consent)
- **Demographics**: Age range, role, relevant context
- **Goals**: 3+ goals with priority ranking
- **Frustrations**: 3+ pain points with severity
- **Behaviors**: Key actions, tool usage, workflows
- **Scenarios**: 2+ realistic usage scenarios
- **Design implications**: Concrete impact on product decisions
- **Evidence basis**: Data source, sample size, collection method
- **Confidence score**: High (N ≥ 20) / Medium (N = 5–19) / Low (N < 5 or hypothesis)

### Journey Map

Every journey map MUST include:

- **Stages**: Named phases of the experience
- **Actions**: What the user does at each stage
- **Touchpoints**: Systems, channels, people involved
- **Emotions**: Emotional state with evidence source
- **Pain points**: With data source citation for each
- **Opportunities**: Prioritized by impact and feasibility
- **Failure paths**: MUST include at least one non-happy-path per stage

### Research Synthesis

Every synthesis MUST include:

- **Research questions**: What we set out to learn
- **Methodology**: Method used, participant count, duration, tools
- **Key findings**: Each with supporting evidence and confidence level
- **Recommendations**: Prioritized by impact, with effort estimate
- **Limitations**: What this research does NOT answer
- **Next steps**: Follow-up research needs

## Scripts

### persona_generator.py

Creates research-backed personas from user data and interviews.

**Usage**: `python scripts/persona_generator.py [json]`

Analyzes user behavior patterns, identifies archetypes, extracts
psychographics, generates scenarios, and provides confidence scoring.

## Accessibility in Research (NON-NEGOTIABLE)

- Usability tests MUST include at least one assistive-technology scenario
  (screen reader, keyboard-only, magnification, or voice control)
- Persona sets SHOULD include at least one persona with accessibility needs
- Journey maps MUST note accessibility barriers at each touchpoint
- Recruitment criteria MUST NOT exclude participants with disabilities
  unless there is a documented, justified reason

## Anti-Patterns

| Anti-Pattern                         | Why It's Wrong               | Do This Instead                                          |
| ------------------------------------ | ---------------------------- | -------------------------------------------------------- |
| Generating personas from zero data   | Presents fiction as research | Label as "Hypothesis (needs validation)"                 |
| Happy-path-only journey maps         | Ignores real user struggles  | Include failure paths at every stage                     |
| "Research" that's desk research only | Not primary user data        | Label as "Secondary research — needs primary validation" |
| No confidence levels on findings     | Hides data quality           | ALWAYS include confidence level                          |
| Skipping recruitment criteria        | Biased sample risk           | Define inclusion/exclusion criteria                      |
| Extrapolating beyond sample          | Overstates findings          | State limitations explicitly                             |
| No accessibility scenario in testing | Excludes disabled users      | Include ≥ 1 assistive-tech scenario                      |

## Integration Points

| Direction         | Agent / Skill        | What Flows                                   |
| ----------------- | -------------------- | -------------------------------------------- |
| Outputs feed into | product-designer     | Research findings, personas, journey maps    |
| Outputs feed into | bug-fix agents       | Usability bugs discovered in testing         |
| Receives from     | value-realization    | Product viability assessment, market context |
| Defers to         | a11y.instructions.md | Accessibility requirements for research      |
