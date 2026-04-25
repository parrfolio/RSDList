---
name: synthetic-data
description: "Strategies and patterns for generating realistic synthetic data for demos, testing, Storybook stories, and development environments. Use when seeding databases, creating mock data, building demo environments, populating UI with realistic content, or generating test fixtures. Covers Faker.js factory patterns, relationship graphs, volume profiles, temporal consistency, and domain-realistic distributions."
agents: ["data.synthetic", "engineering.implementation", "frontend.implementation", "frontend.storybook", "quality.test-architecture"]
---

# Synthetic Data Generation

> Strategies and patterns for generating realistic synthetic data for demos, testing, Storybook stories, and development environments.

## When to Apply This Skill

- Creating seed data for local development databases
- Populating demo environments with realistic content
- Generating Storybook fixtures for component stories
- Building test data factories for unit and integration tests
- Creating dev environment data that looks production-like
- Populating Firebase local dev tools with sample documents
- Building load-test datasets at scale
- Generating fixture data for E2E test suites

---

## 1. Data Generation Architecture

### Directory Structure

Organize synthetic data files in a predictable structure:

```
src/lib/data/
├── factories/          # Entity factory functions
│   ├── index.ts        # Barrel export
│   ├── user.factory.ts
│   ├── project.factory.ts
│   └── task.factory.ts
├── seeds/              # Composed seed scripts
│   ├── dev-seed.ts     # Small dataset for development
│   ├── demo-seed.ts    # Medium dataset for demos
│   └── load-seed.ts    # Large dataset for load testing
├── fixtures/           # Static fixtures for Storybook/tests
│   ├── index.ts
│   └── dashboard.fixtures.ts
└── README.md           # Usage documentation
```

### Naming Conventions

| File Type  | Pattern                    | Example                |
| ---------- | -------------------------- | ---------------------- |
| Factory    | `<entity>.factory.ts`      | `user.factory.ts`      |
| Seed       | `<profile>-seed.ts`        | `demo-seed.ts`         |
| Fixture    | `<context>.fixtures.ts`    | `dashboard.fixtures.ts`|
| Barrel     | `index.ts`                 | `factories/index.ts`   |

---

## 2. Factory Function Patterns

### Base Factory Template

Every factory follows this typed pattern with override support and deterministic seeding:

```typescript
import { faker } from "@faker-js/faker";

interface CreateUserOptions {
  overrides?: Partial<User>;
  seed?: number;
}

export function createUser(options: CreateUserOptions = {}): User {
  const { overrides = {}, seed } = options;

  if (seed !== undefined) {
    faker.seed(seed);
  }

  return {
    id: faker.string.uuid(),
    displayName: faker.person.fullName(),
    email: faker.internet.email({
      provider: "example.com",
    }),
    avatarUrl: faker.image.avatar(),
    role: faker.helpers.weightedArrayElement([
      { value: "member", weight: 70 },
      { value: "admin", weight: 20 },
      { value: "owner", weight: 10 },
    ]),
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent({ days: 30 }),
    ...overrides,
  };
}
```

### Batch Factory

Generate multiple entities at once:

```typescript
export function createUsers(
  count: number,
  options: Omit<CreateUserOptions, "seed"> & { baseSeed?: number } = {},
): User[] {
  const { overrides = {}, baseSeed } = options;

  if (baseSeed !== undefined) {
    faker.seed(baseSeed);
  }

  return Array.from({ length: count }, () =>
    createUser({ overrides }),
  );
}
```

### Relationship Factory

Factories that reference parent entities accept parent IDs as parameters:

```typescript
interface CreateTaskOptions {
  projectId: string;
  assigneeId?: string;
  overrides?: Partial<Task>;
}

export function createTask(options: CreateTaskOptions): Task {
  const { projectId, assigneeId, overrides = {} } = options;
  const createdAt = faker.date.past({ years: 1 });

  return {
    id: faker.string.uuid(),
    projectId,
    assigneeId: assigneeId ?? faker.string.uuid(),
    title: faker.hacker.phrase(),
    description: faker.lorem.paragraph(),
    status: faker.helpers.weightedArrayElement([
      { value: "open", weight: 30 },
      { value: "in-progress", weight: 25 },
      { value: "completed", weight: 35 },
      { value: "archived", weight: 10 },
    ]),
    priority: faker.helpers.weightedArrayElement([
      { value: "low", weight: 20 },
      { value: "medium", weight: 50 },
      { value: "high", weight: 25 },
      { value: "critical", weight: 5 },
    ]),
    createdAt,
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
    ...overrides,
  };
}
```

### Factory Composition

Build complex object graphs by composing factories:

```typescript
interface CreateProjectWithTasksOptions {
  workspaceId: string;
  memberIds: string[];
  taskCount?: number;
}

export function createProjectWithTasks(
  options: CreateProjectWithTasksOptions,
): { project: Project; tasks: Task[] } {
  const { workspaceId, memberIds, taskCount = 10 } = options;

  const project = createProject({
    workspaceId,
    ownerId: faker.helpers.arrayElement(memberIds),
  });

  const tasks = Array.from({ length: taskCount }, () =>
    createTask({
      projectId: project.id,
      assigneeId: faker.helpers.arrayElement(memberIds),
    }),
  );

  return { project, tasks };
}
```

---

## 3. Relationship Graph Strategies

### Dependency Order

Always create entities in dependency order — parents before children:

```
1. Workspaces     (no dependencies)
2. Users          (no dependencies, but memberships link to workspaces)
3. Memberships    (depends on: workspaces, users)
4. Projects       (depends on: workspaces, users)
5. Tasks          (depends on: projects, users)
6. Comments       (depends on: tasks, users)
7. Activity Log   (depends on: all above)
```

### Reference Integrity

All foreign keys must point to existing entities. Never generate orphaned references:

```typescript
// CORRECT — assigneeId comes from the known users array
const task = createTask({
  projectId: project.id,
  assigneeId: faker.helpers.arrayElement(teamMembers).id,
});

// WRONG — random UUID that doesn't match any user
const task = createTask({
  projectId: project.id,
  assigneeId: faker.string.uuid(), // orphaned reference
});
```

### Realistic Cardinality

Not every parent has the same number of children. Use distributions:

| Relationship              | Distribution             | Example                         |
| ------------------------- | ------------------------ | ------------------------------- |
| Users per workspace       | Normal, mean=8, sd=3     | Most have 5-11, few have 1-20  |
| Projects per workspace    | Normal, mean=5, sd=2     | Most have 3-7, few have 1-12   |
| Tasks per project         | Log-normal, median=15    | Most have 5-30, few have 50+   |
| Comments per task         | Power law                | Most have 0-3, few have 10+    |

```typescript
function gaussianInt(mean: number, sd: number, min: number): number {
  const value = faker.number.float({ min: 0, max: 1 }) +
    faker.number.float({ min: 0, max: 1 }) +
    faker.number.float({ min: 0, max: 1 });
  const gaussian = ((value / 3) - 0.5) * 2; // approximate normal
  return Math.max(min, Math.round(mean + gaussian * sd));
}
```

### Graph Patterns

Choose the right graph pattern for each relationship type:

- **Hierarchical** — Workspaces → Projects → Tasks → Subtasks (strict tree)
- **Star** — One workspace hub, many project spokes (common for single-team setups)
- **Mesh** — Users belong to multiple workspaces with overlapping project membership
- **Chain** — Sequential dependencies (task A blocks task B blocks task C)

---

## 4. Volume Profiles

### Standard Profiles

| Profile     | Records per Entity | Use Case                    | Seed Time Target |
| ----------- | ------------------ | --------------------------- | ---------------- |
| `dev`       | 5-20               | Fast local iteration        | < 2 seconds      |
| `demo`      | 50-200             | Realistic browsing/demos    | < 10 seconds     |
| `staging`   | 500-2,000          | Performance validation      | < 60 seconds     |
| `load-test` | 10,000-100,000     | Stress testing              | < 10 minutes     |

### CLI Argument Pattern

Support profile selection via command-line or environment variable:

```typescript
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    profile: {
      type: "string",
      default: process.env.SEED_PROFILE ?? "dev",
    },
  },
});

const volumeProfiles = {
  dev: { workspaces: 2, usersPerWs: 5, projectsPerWs: 3, tasksPerProject: 8 },
  demo: { workspaces: 5, usersPerWs: 15, projectsPerWs: 8, tasksPerProject: 25 },
  staging: { workspaces: 10, usersPerWs: 50, projectsPerWs: 20, tasksPerProject: 80 },
  "load-test": { workspaces: 50, usersPerWs: 200, projectsPerWs: 100, tasksPerProject: 500 },
} as const;

type Profile = keyof typeof volumeProfiles;
const profile = volumeProfiles[values.profile as Profile] ?? volumeProfiles.dev;
```

---

## 5. Temporal Consistency

### Date and Time Rules

Generated dates must be internally consistent and realistic:

| Rule                        | Implementation                                                          |
| --------------------------- | ----------------------------------------------------------------------- |
| `createdAt < updatedAt`     | Generate `createdAt` first, then `updatedAt` between `createdAt` and now |
| `startDate < endDate`       | Generate `startDate` first, add realistic duration                       |
| `deletedAt > createdAt`     | Only set on archived/deleted entities, after creation date               |
| Spread across time          | Not all entities created today — spread across weeks/months              |

### Temporal Spread Pattern

```typescript
function createRealisticTimestamps(options: {
  historyMonths?: number;
  recentBias?: boolean;
} = {}): { createdAt: Date; updatedAt: Date } {
  const { historyMonths = 12, recentBias = true } = options;

  const createdAt = recentBias
    ? faker.date.recent({ days: historyMonths * 30 })
    : faker.date.past({ years: historyMonths / 12 });

  const updatedAt = faker.date.between({
    from: createdAt,
    to: new Date(),
  });

  return { createdAt, updatedAt };
}
```

### Activity Patterns

Realistic activity follows predictable patterns:

- **Weekday bias** — 80% of activity on weekdays, 20% on weekends
- **Business hours** — 70% during 9am-6pm local time, 30% outside
- **Timezone diversity** — Distribute users across 3-4 timezones
- **Burst patterns** — Some entities cluster around events (project kickoff, sprint end)

---

## 6. Domain-Realistic Distributions

### Status Distributions

Never use uniform random for status fields. Real-world data is skewed:

```typescript
// CORRECT — weighted toward active states
const status = faker.helpers.weightedArrayElement([
  { value: "active", weight: 60 },
  { value: "completed", weight: 25 },
  { value: "archived", weight: 10 },
  { value: "draft", weight: 5 },
]);

// WRONG — uniform random gives unrealistic distributions
const status = faker.helpers.arrayElement(["active", "completed", "archived", "draft"]);
```

### Common Distribution Patterns

| Field Type       | Distribution   | Example                                                |
| ---------------- | -------------- | ------------------------------------------------------ |
| Status/state     | Weighted       | 60% active, 25% completed, 10% archived, 5% draft     |
| Team size        | Normal         | Mean=7, sd=3 (most teams 4-10)                         |
| User activity    | Power law      | 10% very active, 30% moderate, 60% low                 |
| Revenue/amounts  | Log-normal     | Most $10-100, some $1k-10k, rare $50k+                 |
| Names            | Locale mixing  | 40% en, 20% de, 15% ja, 15% es, 10% other             |
| Task effort      | Fibonacci-like | 1h (30%), 2h (25%), 4h (20%), 8h (15%), 16h (10%)     |

### Locale Mixing for Cultural Diversity

```typescript
import { faker, fakerDE, fakerJA, fakerES } from "@faker-js/faker";

function diverseName(): string {
  const localeFaker = faker.helpers.weightedArrayElement([
    { value: faker, weight: 40 },
    { value: fakerDE, weight: 20 },
    { value: fakerJA, weight: 15 },
    { value: fakerES, weight: 15 },
  ]);
  return localeFaker.person.fullName();
}
```

---

## 7. Storybook and Test Fixtures

### Named Exports for Stories

Export specific fixture sets that Storybook stories can import directly:

```typescript
// fixtures/dashboard.fixtures.ts
import { createUser, createProject, createTask } from "../factories";

export const dashboardUser = createUser({
  seed: 42,
  overrides: { displayName: "Alex Rivera", role: "admin" },
});

export const dashboardProjects = Array.from({ length: 5 }, (_, i) =>
  createProject({ seed: 100 + i, workspaceId: "ws-demo-1" }),
);

export const recentTasks = Array.from({ length: 8 }, (_, i) =>
  createTask({
    projectId: dashboardProjects[i % dashboardProjects.length].id,
    overrides: { status: i < 3 ? "in-progress" : "open" },
  }),
);
```

### Edge Case Collections

Always provide fixture sets for boundary conditions:

```typescript
// fixtures/edge-cases.fixtures.ts

/** Empty state — no items to display */
export const emptyProjectList: Project[] = [];

/** Single item — test singular/plural labels */
export const singleProject = [createProject({ seed: 1 })];

/** Maximum display — test pagination/overflow */
export const maxProjects = Array.from({ length: 100 }, (_, i) =>
  createProject({ seed: 200 + i }),
);

/** Special characters — test rendering safety */
export const specialCharProject = createProject({
  overrides: {
    name: 'Project "Alpha" <Beta> & Gamma\'s',
    description: "Contains `backticks`, **markdown**, and emoji 🚀",
  },
});

/** Long content — test truncation and overflow */
export const longNameProject = createProject({
  overrides: {
    name: "A".repeat(255),
    description: faker.lorem.paragraphs(10),
  },
});
```

### Time-Sensitive Fixtures

Provide fixtures relative to "now" for testing temporal UI:

```typescript
// fixtures/time-sensitive.fixtures.ts

/** Task due today */
export const dueTodayTask = createTask({
  projectId: "project-1",
  overrides: {
    dueDate: new Date(),
    status: "in-progress",
  },
});

/** Task overdue by 3 days */
export const overdueTask = createTask({
  projectId: "project-1",
  overrides: {
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: "open",
  },
});

/** Task due next week */
export const upcomingTask = createTask({
  projectId: "project-1",
  overrides: {
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "open",
  },
});

/** Task completed yesterday */
export const recentlyCompletedTask = createTask({
  projectId: "project-1",
  overrides: {
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "completed",
  },
});
```

### Loading and Error State Data

Export descriptors for non-happy-path states:

```typescript
// fixtures/states.fixtures.ts

/** Simulated loading state */
export const loadingState = { isLoading: true, data: undefined, error: undefined };

/** Simulated error state */
export const errorState = {
  isLoading: false,
  data: undefined,
  error: new Error("Failed to fetch projects"),
};

/** Simulated empty state after successful fetch */
export const emptyState = { isLoading: false, data: [], error: undefined };
```

---

## 8. Safety and Compliance Rules

### Email Domains

Always use safe, non-deliverable domains for generated emails:

```typescript
// CORRECT — safe domains
faker.internet.email({ provider: "example.com" });
faker.internet.email({ provider: "test.example.com" });

// WRONG — real domains that could receive mail
faker.internet.email(); // may generate @gmail.com, @yahoo.com
```

### No Real PII

- Use Faker-generated names, not real people's names
- Use Faker-generated addresses, not real addresses
- Use Faker-generated company names, not real companies
- Use `555-xxxx` format or Faker phone methods for phone numbers

### Synthetic Data Markers

Where data is visible to users (demo environments, presentations), mark it clearly:

```typescript
// Add [DEMO] prefix for demo-visible data
function demoProjectName(): string {
  return `[DEMO] ${faker.company.buzzPhrase()}`;
}
```

### Environment Guards

Seed scripts must never run against production:

```typescript
function assertNotProduction(): void {
  const env = process.env.NODE_ENV;
  if (env === "production") {
    console.error("ABORT: Seed scripts must not run in production.");
    process.exit(1);
  }
}

// Call at the top of every seed script
assertNotProduction();
```

### Data Retention

- Never commit generated seed data files to version control (add to `.gitignore`)
- Seed scripts themselves are committed; their output is not
- Fixtures are committed (they are small, deterministic, and version-controlled)

---

## 9. Integration Patterns

### Dev Server Auto-Seed

Automatically seed the database on dev server startup when empty:

```typescript
// src/lib/data/auto-seed.ts
export async function autoSeedIfEmpty(db: Firestore): Promise<void> {
  if (process.env.NODE_ENV === "production") return;

  const snapshot = await db.collection("workspaces").limit(1).get();
  if (!snapshot.empty) return;

  console.log("[auto-seed] Database empty, seeding dev data...");
  await runDevSeed(db);
  console.log("[auto-seed] Done.");
}
```

### Storybook Decorators

Inject fixture data into Storybook stories via decorators:

```typescript
// .storybook/decorators/withFixtureData.tsx
import { dashboardUser, dashboardProjects } from "../src/lib/data/fixtures";

export function withFixtureData(Story: React.ComponentType) {
  return (
    <DataContext.Provider
      value={{ user: dashboardUser, projects: dashboardProjects }}
    >
      <Story />
    </DataContext.Provider>
  );
}
```

### Test Helpers

Create helper functions for test suite setup and teardown:

```typescript
// src/lib/data/test-helpers.ts
import { createUser, createProject, createTask } from "./factories";

export function seedTestData(options: { taskCount?: number } = {}) {
  const user = createUser({ seed: 1 });
  const project = createProject({
    seed: 2,
    workspaceId: "test-ws",
    ownerId: user.id,
  });
  const tasks = Array.from({ length: options.taskCount ?? 5 }, (_, i) =>
    createTask({ projectId: project.id, assigneeId: user.id }),
  );

  return { user, project, tasks };
}
```

### CI Seed for Integration Tests

Run seed scripts in CI before integration test suites:

```json
{
  "scripts": {
    "seed": "tsx src/lib/data/seeds/dev-seed.ts",
    "seed:demo": "SEED_PROFILE=demo tsx src/lib/data/seeds/demo-seed.ts",
    "seed:ci": "SEED_PROFILE=dev tsx src/lib/data/seeds/dev-seed.ts",
    "test:integration": "pnpm seed:ci && vitest run --config vitest.integration.config.ts"
  }
}
```

### Backend-Specific Seeding

Seed the Firebase local dev environment. See the backend skill at `.github/skills/backend/SKILL.md` for backend-specific seeding patterns.
