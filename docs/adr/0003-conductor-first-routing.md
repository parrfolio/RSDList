# ADR 0003: Conductor-First Routing

## Status

Accepted

## Context

Snow Patrol has 35 agents. Users unfamiliar with the roster tend to address broad requests to whichever agent is currently active, bypassing the planning, gating, and review phases that produce quality output. This leads to:

- Implementation without a plan
- Code shipped without security or accessibility audits
- Single-agent work cascading into changes that touch multiple domains without coordination

The system needs a default routing mechanism that funnels broad requests through the orchestrator (`conductor.powder`) while still allowing experts to be called directly for narrow, well-scoped tasks.

## Decision

Implement conductor-first routing through two complementary mechanisms:

1. **Advisory routing hook** (`conductor-routing.sh`, registered on `userPromptSubmitted`) — injects a suggestion to route through `conductor.powder` unless the user explicitly names a specialist agent or uses a recognized specialist keyword. This is advisory: the LLM receives the suggestion but is not forced to comply.

2. **Strict delegation guard** (`conductor-delegation-guard` in `dispatcher.sh`, Guard 4 on `preToolUse`) — when activated, mechanically blocks the conductor from reading source files, writing non-plan files, or running non-whitelisted terminal commands. Activation requires either:
   - Environment variable: `SNOW_PATROL_CONDUCTOR_SESSION=true`
   - Sentinel file: `.conductor-session` in the project root

The advisory hook runs on every prompt. The strict guard is opt-in — teams enable it when they want mechanical enforcement of delegation discipline.

## Consequences

**Benefits:**

- Broad requests route through conductor by default — ensures planning, delegation, review, and gates happen
- Explicit `@agent-name` bypasses routing — specialists remain directly accessible for narrow asks
- Two enforcement tiers — advisory (always on) and strict (opt-in) — let teams choose their level of discipline
- Mechanical enforcement prevents the conductor from "just writing one file" before delegating the rest

**Tradeoffs:**

- Advisory routing is just a suggestion — LLMs can and do ignore it; the hook cannot force compliance at the prompt level
- Strict delegation guard requires explicit opt-in — teams that forget to enable it get advisory-only behavior
- The `SNOW_PATROL_CONDUCTOR_SESSION` env var and `.conductor-session` file are parallel activation mechanisms; either one works, which could cause confusion about which is active
