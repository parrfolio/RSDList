---
description: "Set up state management with Zustand stores and TanStack Query"
agent: "conductor.powder"
---

# Set Up State Management

You are configuring state management for the application.

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.context** — Research existing state patterns
2. **@engineering.implementation/@frontend.implementation** — Implement stores and hooks

## State Management Stack

### Client State: Zustand

- Lightweight stores for UI state
- No boilerplate (no reducers, actions, dispatchers)
- TypeScript-first with full type inference
- Middleware: `persist` for localStorage, `devtools` for debugging

### Server State: TanStack Query

- Firestore data fetching and caching
- Automatic background refetching
- Optimistic updates for mutations
- Cache invalidation strategies
- `keepPreviousData` for smooth pagination

### When to Use What

| State Type  | Solution        | Example                            |
| ----------- | --------------- | ---------------------------------- |
| UI state    | Zustand         | Sidebar open/closed, theme, modals |
| Form state  | react-hook-form | Form inputs, validation            |
| Server data | TanStack Query  | Firestore documents, API responses |
| Auth state  | React Context   | Current user, tenant, permissions  |
| URL state   | Router params   | Filters, pagination, sort order    |

## Patterns

### Zustand Store

```typescript
interface AppStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

### TanStack Query Hook

```typescript
function useDocuments(tenantId: string) {
  return useQuery({
    queryKey: ["documents", tenantId],
    queryFn: () => fetchDocuments(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## Instructions

1. Research existing state patterns (architecture.context)
2. Identify what state management is needed
3. Implement Zustand stores for client state
4. Implement TanStack Query hooks for server state
5. Set up React Context for auth/tenant state
6. Write tests for stores and hooks
7. Document state management patterns

## User Input

{{input}}
