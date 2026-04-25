---
description: "Generate realistic synthetic data for demos, testing, Storybook stories, and development environments"
agent: "conductor.powder"
---

# Generate Synthetic Data

Generate realistic synthetic data for your application — factory functions, seed scripts, Storybook fixtures, and development environment data.

Use @conductor.powder to orchestrate the synthetic data pipeline.

## The Pipeline

```
Step 1: Discovery ──── Scan data models, schemas, and types
Step 2: Strategy ───── Design generation approach and volume profiles
Step 3: Factories ──── Build typed factory functions with Faker.js
Step 4: Seeds ─────── Compose factories into seed scripts
Step 5: Fixtures ───── Export Storybook and test fixtures
Step 6: Integration ── Wire into dev server, tests, and Storybook
```

### Step 1: Schema Discovery

- **@architecture.exploration** — Scan the codebase for TypeScript interfaces, Zod schemas, Firestore document types, API response shapes
- Produce a data model map with entity relationships

### Step 2: Data Strategy

- **@data.synthetic** with synthetic-data skill — Design the generation strategy:
  - Entity list with fields and types
  - Relationship graph (which entities reference which)
  - Volume profiles (dev, demo, staging, load-test)
  - Distribution rules (status, activity, temporal)

### Step 3: Factory Functions

- **@data.synthetic** — Implement typed factory functions:
  - One factory per entity type
  - Faker.js-powered with deterministic seeding
  - Override support for customization
  - Relationship-aware (dependency order)

### Step 4: Seed Scripts

- **@data.synthetic** — Compose factories into seed scripts:
  - `dev-seed.ts` — Quick seed for local development
  - `demo-seed.ts` — Rich dataset for demos and presentations
  - Environment guards (never seed production)

### Step 5: Storybook and Test Fixtures

- **@data.synthetic** — Export fixture data for UI and tests:
  - Named exports for Storybook stories
  - Edge case collections (empty, max, special chars)
  - Test helper functions for suite setup/teardown

### Step 6: Integration

- **@engineering.implementation** — Wire seed scripts into dev workflow:
  - `pnpm seed` command in package.json
  - Dev server auto-seed option
  - Firebase emulator seed support
- **@quality.code-review** — Review all generated code

**Gate**: All factory types match schema types. Seed scripts run without errors. Fixtures render correctly in Storybook.

## Instructions

1. Start at Step 1 — work through every step in order
2. Each step builds on the previous — do not skip ahead
3. Factory functions must be type-safe and deterministic
4. All generated data must follow the safety rules (no real PII, `example.com` emails)
5. Seed scripts must have environment guards (never seed production)
6. conductor.powder orchestrates the pipeline and ensures quality gates pass

## User Input

The data I need generated: {{input}}
