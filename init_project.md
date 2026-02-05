# VS Code Agent Prompt: Build “RSD Wants” (Record Store Day Checklist App) with shadcn/ui

You are an implementation agent. Build a complete, working full-stack app (frontend + Firebase backend) using:

- Type safety: TypeScript (strict)
- App: Vite + React + React Router
- Styling: Tailwind CSS
- UI library: shadcn/ui (Radix + Tailwind)
- Icons: lucide-react
- Client state (UI-only): Zustand
- Server state: TanStack React Query
- Backend: Firebase Auth (Google, Facebook, Email), Firestore, Cloud Functions (Node 20), Hosting, Emulators
- Monorepo: pnpm workspace

Primary user story:
A record collector signs in, browses the current year Record Store Day (RSD) “Special Releases” list, saves items into “My Wants”, and checks them off while shopping so they move to “Acquired”. Must work great on mobile.

Reference source for releases:

- Listing: https://recordstoreday.com/SpecialReleases?view=all
- Detail pages have structured fields (example): https://recordstoreday.com/SpecialRelease/19959

Important: the official site may be JS-rendered or scraping-resistant. Implement a robust data pipeline with a non-blocking fallback (curated dataset in Firestore).

---

## 0) Decisions the agent must capture (A/B) and implement defaults

### Data source (highest risk)

A) Default: Curated dataset in Firestore + optional admin sync tool (recommended)

- App reads releases from Firestore
- Provide a seed JSON + import script for the current year
- Provide an admin-only sync function that tries to fetch/parse the official site and upsert into Firestore
- If sync fails, the app still works from seeded data

B) Live scrape + cache (higher risk)

- Scheduled Cloud Function scrapes daily and upserts into Firestore

Implement A by default.

### App framework

A) Vite + React Router (default)
B) Next.js App Router

Implement A.

### Offline / in-store mode (mobile)

A) Default: Firestore offline persistence + optimistic updates
B) Full PWA (service worker)

Implement A. Leave TODO for PWA.

---

## 1) MVP Requirements (functional)

### Auth + Onboarding

- Sign in methods:
  - Google OAuth
  - Facebook OAuth
  - Email/password
- First login flow:
  - Create user profile doc in Firestore
  - Prompt user to choose an avatar (preset avatar gallery)
- Account menu: profile, sign out

### RSD List (current year)

- Show “Latest RSD list” for current year by default:
  - year = new Date().getFullYear()
- List supports:
  - Grid view by album art (default on mobile)
  - Optional list view toggle
  - Search (artist/title)
  - Sorting (required): Artist A→Z / Z→A
- Each release card shows at minimum:
  - Album art, Artist, Title
  - Format + Release type (if available)
  - “Add to My Wants” toggle button

### My Wants List

- Route: /mylist
- Two sections:
  - Wanted (unchecked)
  - Acquired (checked)
- Interaction:
  - Checking an item sets status = ACQUIRED and moves it to Acquired
  - Unchecking returns it to Wanted
- Must be fast and usable one-handed on mobile:
  - Large touch targets
  - Sticky header with counts (Wanted count, Acquired count)

### Mobile UX

- Responsive, mobile-first
- Bottom tab navigation on small screens:
  - Home (RSD List)
  - My List
  - Account
- Desktop can use top nav

---

## 2) Non-goals (MVP)

- Payments, subscriptions
- Social sharing, public profiles
- Multi-tenant org model
- Advanced recommendations

---

## 3) Repository + Tooling

### Monorepo structure (pnpm workspace)

- apps/web (Vite React UI)
- apps/functions (Firebase Cloud Functions)
- packages/shared (types, zod schemas, constants, helpers)

### Quality gates

- ESLint + Prettier
- TypeScript strict
- Scripts:
  - pnpm lint
  - pnpm typecheck
  - pnpm test (minimal optional)
  - pnpm dev (web + emulators + functions watch)

### Firebase local dev

- Firebase Emulators: auth, firestore, functions, hosting
- Provide seed script to populate rsdReleases for current year

---

## 4) UI Library Requirement: shadcn/ui (hard requirement)

### Hard rules

1. Use shadcn/ui first for primitives:
   - Button, Card, Input, Badge, Tabs, Dialog, Sheet/Drawer, DropdownMenu, Avatar, Checkbox, ScrollArea, Separator, Skeleton, Toast/Sonner
2. Only build custom UI when shadcn does not provide it, and then:
   - Compose from shadcn primitives
   - No new visual patterns unless missing: if missing, implement minimally consistent with shadcn tokens
3. Mobile UX must be built from shadcn primitives (Sheet for menus, Tabs/segmented, etc).

### Setup requirements (agent must implement)

- Initialize shadcn/ui in Vite project:
  - Configure Tailwind per shadcn docs
  - Add `components.json` with:
    - style: "default"
    - rsc: false
    - tsx: true
    - tailwind: true
    - aliases: `@/components`, `@/lib`
- Install required deps:
  - class-variance-authority, clsx, tailwind-merge
  - Radix packages used by generated components
- Generate minimum component set via shadcn:
  - button
  - card
  - input
  - badge
  - tabs
  - dialog
  - sheet
  - dropdown-menu
  - avatar
  - checkbox
  - scroll-area
  - separator
  - skeleton
  - toast (or sonner)

### Shared UI composition

- Keep generated shadcn components in:
  - apps/web/src/components/ui/\*
- Create app-level composed components in:
  - apps/web/src/components/app/\*
    Required composed components:
- ReleaseCard (Card + Button + Badge)
- TopSearchSortBar (Input + DropdownMenu)
- BottomTabs (Buttons + nav, or Tabs if appropriate)
- SectionHeader (Separator + counts)
- EmptyState (Card + text + CTA)

### Theming

- Use shadcn CSS variables in globals.css (light theme default)
- Adjust tokens only (no custom color systems):
  - Set `--radius` (16–24px feel)
  - Subtle shadows and borders consistent with shadcn

---

## 5) Firestore Data Model

### Public releases (read-only to clients)

`/rsdReleases/{releaseId}`

- releaseId: string (prefer numeric id from official site)
- year: number
- eventName: string
- releaseDate: string | null (ISO date if possible)
- artist: string
- title: string
- format: string | null
- label: string | null
- quantity: number | null
- releaseType: string | null
- imageUrl: string | null
- detailsUrl: string | null
- createdAt: server timestamp
- updatedAt: server timestamp

Indexes:

- year + artist
- year
  (optional) year + title

### Users

`/users/{uid}`

- uid: string
- displayName: string | null
- email: string | null
- avatarId: string (preset key) OR avatarUrl: string | null
- authProviders: string[]
- createdAt, updatedAt

### User wants (denormalized for fast reads)

`/users/{uid}/wants/{wantId}`

- wantId = `${year}_${releaseId}`
  Fields:
- year: number
- releaseId: string
- artist: string
- title: string
- imageUrl: string | null
- format: string | null
- releaseType: string | null
- status: "WANTED" | "ACQUIRED"
- addedAt: server timestamp
- acquiredAt: server timestamp | null
- updatedAt: server timestamp

Rationale: avoids joins for /mylist rendering.

---

## 6) Security Rules (minimum bar)

Rules must enforce:

- Auth required for any user data reads/writes
- A user can only access their own user doc and subcollections
- Releases:
  - Read allowed for everyone OR authed users (default: everyone)
  - Writes denied to clients
- Validate status enum for wants
- Ensure uid is derived from request.auth.uid and path only (never payload)

---

## 7) Cloud Functions (backend)

### Admin gating approach (MVP)

Use a simple admin allowlist:

- functions config: ADMIN_UIDS="uid1,uid2"
- Or set custom claims via a one-time script (optional MVP+)

### Functions to implement

1. `syncRsdReleases(year)` (HTTPS endpoint or callable)

- Admin-only
- Best-effort scrape/parse official listing
- Upsert into `/rsdReleases`
- Return summary: inserted/updated/failed
- Fail gracefully: do not affect app runtime

2. `importRsdReleasesFromJson(year)` (local Node script)

- Loads `data/rsd/{year}.json`
- Writes to Firestore emulator or prod

Optional MVP+:

- Scheduled sync (daily) during pre-RSD period

---

## 8) Frontend Architecture (React Query + Zustand)

### React Query (all server/cache state)

Queries:

- `useRsdReleasesQuery({ year, search, sort })`
- `useMyWantsQuery({ year })` (or all years)

Mutations:

- `useToggleWantMutation()` (add/remove from wants)
- `useSetWantStatusMutation()` (WANTED ↔ ACQUIRED)

Requirements:

- All Firestore reads go through query hooks
- All writes go through mutations with optimistic updates
- Show toast on success/failure (shadcn toast/sonner)

### Zustand (UI-only ephemeral state)

- viewMode: "GRID" | "LIST"
- year: number
- sort: "ARTIST_ASC" | "ARTIST_DESC"
- search: string

---

## 9) UI/UX Requirements (mobile-first)

### Navigation

- Mobile (< md): bottom tab bar
  - RSD List
  - My List
  - Account
- Desktop: top nav with links + user menu

### /rsd screen

- Sticky top region:
  - Search input
  - Sort dropdown
  - Grid/List toggle (optional)
- Grid cards:
  - Album art with consistent aspect ratio
  - Add/Remove button
  - Badge for format/type

### /mylist screen

- Sticky header with counts:
  - Wanted: N
  - Acquired: M
- Sections:
  - Wanted first, Acquired second
- Each row has:
  - Large Checkbox
  - Album art thumbnail
  - Artist + Title
  - Status badge optional

### Accessibility

- All interactive elements labeled
- Keyboard focus visible
- Tap targets >= 44px on mobile

---

## 10) Routes

- `/` → redirect to `/rsd`
- `/auth` (sign in / sign up)
- `/rsd` (RSD list)
- `/mylist` (wanted/acquired)
- `/account` (avatar + sign out)
  Optional:
- `/release/:releaseId` (details)

---

## 11) Acceptance Criteria (definition of done)

1. New user can sign in with Google or Email, pick an avatar, land on /rsd.
2. /rsd shows current-year releases from Firestore in a grid with album art.
3. User can add items to My Wants; UI updates instantly and persists.
4. /mylist shows Wanted + Acquired. Checking moves item to Acquired and persists.
5. Mobile UX is strong: no tiny controls, no horizontal scroll, bottom tabs work.
6. Local dev works with one command (emulators + web), and seed script populates list.

---

## 12) Step-by-step Implementation Plan (tasks)

### Phase 1: Scaffold + shadcn

- Create pnpm workspace
- Scaffold apps/web (Vite React TS)
- Configure Tailwind
- Initialize shadcn/ui in Vite (aliases, components.json)
- Generate required shadcn components set
- Install: react-router-dom, @tanstack/react-query, zustand, firebase, zod, lucide-react

### Phase 2: Firebase + emulators

- Initialize Firebase project config in repo
- Configure emulators
- Implement Firestore rules
- Implement Auth providers + UI
- Add Firestore offline persistence
- Create seed script to load releases JSON

### Phase 3: Core features

- Build /rsd:
  - Query releases
  - Search/sort
  - Add/remove wants with optimistic updates
- Build /mylist:
  - Query wants
  - Toggle status wanted/acquired
- Build /account:
  - Avatar selector (preset list)
  - Update user doc

### Phase 4: Data pipeline

- Implement JSON import (local script)
- Implement admin sync function (best-effort scrape/parse)
- Add minimal admin tooling doc

### Phase 5: Polish

- Skeleton loading, error states, toasts
- Responsive nav + bottom tabs
- Basic a11y pass

---

## 13) Questions for Ryan (answer in docs/decisions.md, proceed with defaults)

1. Should the app support both April RSD and Black Friday lists as separate events, or only April RSD?
2. Should /rsd allow anonymous browsing, requiring login only to save, or require login immediately?
3. Current-year only in MVP, or add a year switcher?
4. Any per-item notes (priority, store, budget)?
5. Avatar: preset only, or allow upload?

Proceed with defaults:

- April RSD only
- Anonymous browsing allowed, login required to save
- Current-year only (with a simple year selector stub)
- No notes
- Preset avatars only

---

## 14) Deliverables (agent must output)

- Full working repo (apps/web, apps/functions, packages/shared)
- README with:
  - pnpm install
  - pnpm dev (web + emulators)
  - pnpm seed:rsd
  - pnpm deploy (optional)
- Firestore security rules
- Seed data format + example JSON for current year in data/rsd/{year}.json
- Functions endpoints and admin gating configuration
