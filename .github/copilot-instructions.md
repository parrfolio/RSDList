# RSD Wants — AI Agent Instructions

Record Store Day checklist app. Users browse RSD releases, build a wants list, mark items acquired while shopping, and optionally share their list.

## Tech Stack

TypeScript strict · React 18 + Vite + React Router v7 · Tailwind CSS + shadcn/ui (`new-york`, dark-only) · lucide-react icons · Zustand (UI state, persisted) · TanStack React Query (server state) · Firebase Auth/Firestore/Storage/Functions/Hosting · Zod v4 (schemas) · sonner (toasts) · pnpm

## Project Layout

```
src/
├── components/ui/      # shadcn/ui primitives — DO NOT hand-edit
├── components/app/     # Domain components composing shadcn + logic
├── hooks/              # React Query hooks + useAuth context
├── lib/                # firebase.ts, auth.ts, firestore.ts, errorMessages.ts, utils.ts
├── pages/              # Route components (BrowsePage, MyListPage, AccountPage, etc.)
├── stores/             # Zustand store (uiStore.ts)
└── types/              # Zod schemas + inferred TS types (barrel: types/index.ts)
functions/src/          # Firebase Cloud Functions (Node 20, ES modules)
firestore.rules         # Security rules with field-level validation
```

## Commands

```bash
pnpm dev                # Vite dev server (no emulators by default)
pnpm build              # tsc -b && vite build → dist/
pnpm typecheck          # tsc --noEmit (always run before committing)
pnpm lint               # ESLint
firebase deploy         # Deploy hosting + functions + rules + storage
```

## Architecture Patterns

### Data Flow: Firestore → React Query → UI
Hooks call Firestore SDK directly in `queryFn` (not via `lib/firestore.ts` helpers). Query keys are simple arrays: `['releases', eventId]`, `['wants', uid, eventId]`. Mutations call `queryClient.invalidateQueries()` on success. QueryClient: `retry: 1`, `refetchOnWindowFocus: false`.

### State Distribution
| Where | What | Example |
|---|---|---|
| React Query | Server data | Releases, wants, events, shares |
| Zustand (`persist`) | UI prefs | `viewMode`, `sortOrder`, `activeEventId` |
| Zustand (transient) | Search state | `searchQuery`, `activeTags` |
| React Context | Auth | `firebaseUser`, `user`, `loading`, `isAdmin` |
| `useState` | Component-local | Dialog open, form inputs, loading flags |

### Type Definitions
Define Zod schema first, infer the type: `export const FooSchema = z.object({...}); export type Foo = z.infer<typeof FooSchema>;` — all in `src/types/`. Barrel-export from `types/index.ts`. Timestamps use `z.any().optional()`.

### Auth Context (`useAuth`)
`AuthProvider` wraps the app. Listens to `onAuthStateChanged` + Firestore `onSnapshot` on `users/{uid}`. Admin check via `admins/{email}` doc existence (no custom claims). `ProtectedRoute` redirects unauthenticated users to `/auth`.

### Cloud Functions
- `onCall` with `enforceAppCheck: true` for callable functions
- Auth: check `request.auth`, then `assertAdmin(email)` for admin-only operations
- Batch writes: groups of 500 (Firestore limit), loop with `db.batch()`
- Client calls via `httpsCallable(functions, 'functionName')` — see `CreateEventDialog.tsx` and `auth.ts`
- Region: `us-central1` everywhere

### Error Handling
Use `friendlyError(err, fallback)` from `lib/errorMessages.ts` — maps Firebase error codes to user-friendly strings. Display with `toast.error()`. Cloud Functions throw `HttpsError` with safe messages; never expose internal errors.

## UI Conventions

### Component Composition
shadcn components (`src/components/ui/`) are never modified directly. App components (`src/components/app/`) compose them with domain logic. Use `cn()` from `lib/utils.ts` for conditional classes.

### Dialogs
Always controlled — parent owns `open`/`onOpenChange` state. Reset local state in `onOpenChange` when closing. For destructive actions: prevent dismiss during loading via `onInteractOutside`/`onEscapeKeyDown` handlers.

### Loading/Error States
Inline conditionals, not separate components: `{isLoading && <Skeleton />}`, then empty state check, then data render. Toasts via `sonner`: `toast.success()`, `toast.error(friendlyError(err))`.

### Styling
Dark-only theme (no toggle). Primary: gold/amber `hsl(37 80% 55%)`. All imports use `@/` alias. Icons from `lucide-react` only, sized `h-4 w-4` with `mr-2` when paired with text.

## Security Checklist

- Firestore rules use `isOwner(uid)` guard + `keys().hasOnly([...])` field allowlists + `affectedKeys().hasOnly([...])` for updates
- User doc deletion blocked in rules (`allow delete: if false`) — handled server-side via admin SDK
- Storage: owner-only writes, 2MB max, image types only
- CSP headers configured in `firebase.json` — update when adding new external services
- App Check: ReCaptchaV3 in prod, debug token in dev
- All user-facing errors sanitized through `friendlyError()`

## Firestore Collections

```
/admins/{email}                    # Admin roster (admin SDK only)
/events/{eventId}                  # RSD events: rsd_{year}_{season}
/releases/{releaseId}              # Public release catalog
/users/{uid}                       # User profiles
/users/{uid}/wants/{wantId}        # Wants (wantId = eventId_releaseId)
/shares/{shareId}                  # Share metadata (nanoid)
```

## Adding a New Feature — Checklist

1. Define Zod schema + type in `src/types/`, export from `index.ts`
2. Add React Query hook in `src/hooks/` (query key convention: `['entity', ...params]`)
3. If Cloud Function needed: add `onCall`/`onRequest` in `functions/src/index.ts` with `enforceAppCheck: true`
4. Update `firestore.rules` with field allowlists for new collections
5. Build UI in `src/components/app/` composing shadcn + domain logic
6. Wire into page in `src/pages/`, add route in `App.tsx` if needed
7. Run `pnpm typecheck && pnpm lint` before committing
8. Deploy with `firebase deploy`
