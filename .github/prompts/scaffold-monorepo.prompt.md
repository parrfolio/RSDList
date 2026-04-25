---
description: "Set up a pnpm monorepo workspace with shared packages"
agent: "conductor.powder"
---

# Scaffold Monorepo

You are setting up a pnpm monorepo workspace structure.

## Context

Use @architecture.engineer for architecture and scaffolding. Follow the standard monorepo pattern:

```
root/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── mobile/       # (optional) React Native
├── packages/
│   ├── shared/       # Types, schemas, utilities
│   ├── ui/           # Shared UI components
    └── backend/      # Firestore rules/policies, Cloud Functions
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## Instructions

1. Ask the user which apps and packages they need
2. Create `pnpm-workspace.yaml` with workspace definitions
3. Create root `package.json` with workspace scripts
4. Create `tsconfig.base.json` with shared compiler options (TypeScript 5.x, ES2022)
5. Scaffold each app/package with its own `package.json` and `tsconfig.json`
6. Set up path aliases (`@/` for each package)
7. Configure shared ESLint and Prettier
8. Add Vitest workspace configuration

## User Input

{{input}}
