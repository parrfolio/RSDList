---
description: "Scaffold a new full-stack application with Firebase + React + TypeScript"
agent: "conductor.powder"
---

# Scaffold New Application

You are setting up a new full-stack application using the framework's standard stack.

Append `--auto` to the user request when you want Powder to continue past soft planning or review pauses while still respecting hard hooks. Powder records orchestration state in `plans/powder-active-task-plan.md`.

## Context

Use @architecture.engineer to scaffold the project. The standard stack is:

- **Frontend**: React 18+, Vite, TypeScript strict, Tailwind CSS v4, shadcn/ui, Zustand, TanStack Query
- **Backend**: Firebase (Firebase Auth, Firestore, Cloud Functions, Hosting)
- **Package Manager**: pnpm workspaces (monorepo)
- **Validation**: Zod schemas
- **Testing**: Vitest
- **Icons**: Lucide React

## Instructions

1. Ask the user for: app name, description, and whether it needs multi-tenant support
2. Invoke @architecture.engineer to scaffold the monorepo structure with:
   - `apps/web` — React frontend
   - `packages/shared` — shared types, schemas, utilities
   - `packages/firebase` — Firestore rules, Cloud Functions
3. Generate architecture documentation (9 required sections per `architecture.engineer`'s protocol)
4. Set up Firebase project configuration
5. Configure Tailwind v4 with `@tailwindcss/vite` plugin (NO `tailwind.config.js`)
6. Install shadcn/ui components
7. Set up Vitest for both frontend and functions
8. Create `.env.example` with Firebase config placeholders
9. Initialize git and create initial commit

## User Input

The application I want to build: {{input}}
