## Plan: Share My Want List

The share URL reads the user's live wants directly. A `/shares/{shareId}` lookup doc maps shareId → uid, and Firestore rules allow public reads on wants when sharing is enabled. No snapshots, no expiry, one list per user.

**Phases: 4**

1. **Phase 1: Data Model & Firestore Rules**
   - **Objective:** Add sharing fields to User, create `/shares/{shareId}` lookup collection, update Firestore rules
   - **Files/Functions to Modify/Create:** `src/types/sharedList.ts`, `src/types/index.ts`, `src/types/user.ts`, `firestore.rules`
   - **Steps:**
     1. Create `ShareInfo` type: `{ shareId, uid, ownerName, listName }`
     2. Add `shareId?`, `sharingEnabled?` to User type
     3. Update Firestore rules: public read on wants when `sharingEnabled == true`, public read on `/shares/{shareId}`, owner write
     4. Install `nanoid`

2. **Phase 2: Share Hooks & Dialog**
   - **Objective:** Create hooks for sharing + ShareListDialog component on MyListPage
   - **Files/Functions to Modify/Create:** `src/hooks/useSharedList.ts`, `src/components/app/ShareListDialog.tsx`, `src/pages/MyListPage.tsx`
   - **Steps:**
     1. `useEnableShare()` — generates nanoid, writes share doc, updates user doc
     2. `useDisableShare()` — deletes share doc, clears user doc fields
     3. `useShareInfo(shareId)` — reads share lookup doc
     4. Build ShareListDialog with name input + copy link + stop sharing
     5. Add share icon to MyListPage header

3. **Phase 3: Shared List Public Page**
   - **Objective:** Create `/shared/:shareId` public route showing live want list
   - **Files/Functions to Modify/Create:** `src/pages/SharedListPage.tsx`, `src/hooks/useSharedList.ts`, `src/App.tsx`
   - **Steps:**
     1. `useSharedWants(uid, eventId)` — reads another user's wants (allowed via rule)
     2. Create SharedListPage with header, release grid/list, hearts for logged-in users
     3. Add route to App.tsx (public, no ProtectedRoute)

4. **Phase 4: Polish & Deploy**
   - **Objective:** Edge cases, build, deploy
   - **Steps:**
     1. Disable share when no wants, handle deleted shares
     2. Build, commit, push, deploy app + Firestore rules
