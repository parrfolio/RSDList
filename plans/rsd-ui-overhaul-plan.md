## Plan: RSD Wants UI Overhaul

Overhaul the RSD Wants app across 6 phases: redesign list/grid views with richer display, add tag-based filtering, simplify want actions to a single toggle, combine My List tabs into a unified checklist, add tags to the detail panel, and redesign the account page with Google avatar support and image upload.

**Phases (6 phases)**

### 1. Phase 1: List View & Grid View Updates
- **Objective:** Redesign `ReleaseListItem` for richer display (2 lines of description, Title - Artist heading, multiple tag labels, 2x larger album art). Simplify `ReleaseCard` grid view to show only thumbnail and Artist - Title with no tags.
- **Files/Functions to Modify/Create:**
  - `src/components/app/ReleaseListItem.tsx`
  - `src/components/app/ReleaseCard.tsx`
- **Steps:**
  1. Update `ReleaseListItem` — increase thumbnail to ~96px, change heading to `{title} - {artist}`, add 2-line description (`line-clamp-2`), render label/format/releaseType as multiple Badge tags
  2. Update `ReleaseCard` — remove Badge components, display `{artist} - {title}` below thumbnail
  3. Verify both views render correctly in BrowsePage

### 2. Phase 2: Tag-Based Search/Filter System
- **Objective:** Make tags clickable to filter releases. Clicking a tag adds it to active filter set. Multiple tags stack. Clearing search clears all tag filters.
- **Files/Functions to Modify/Create:**
  - `src/stores/uiStore.ts`
  - `src/pages/BrowsePage.tsx`
  - `src/components/app/ReleaseListItem.tsx`
- **Steps:**
  1. Add `activeTags`, `addTag`, `removeTag`, `clearTags` to uiStore
  2. Update BrowsePage filtering to include tag matching
  3. Render active filter chips above the list
  4. Wire `onTagClick` on ReleaseListItem badges
  5. When search input is cleared, also clear active tags

### 3. Phase 3: Remove Toasts + Simplify Want Actions
- **Objective:** Remove all toast notifications for want actions. Simplify RSD browse action to single toggle: "Want" (heart) ↔ "Added" (check).
- **Files/Functions to Modify/Create:**
  - `src/hooks/useWants.ts`
  - `src/components/app/ReleaseCard.tsx`
  - `src/components/app/ReleaseListItem.tsx`
- **Steps:**
  1. Remove all toast calls from useWants.ts mutations
  2. Update ReleaseCard/ReleaseListItem action to single toggle button
  3. Remove "Got It", "Remove" buttons from browse view

### 4. Phase 4: My RSD Wants List Redesign
- **Objective:** Rename to "My RSD Wants", combine tabs into single checklist ordered by addedAt. X removes, "Found!" toggles acquired (orange). Grid/list toggle. Keep progress bar.
- **Files/Functions to Modify/Create:**
  - `src/pages/MyListPage.tsx`
  - `src/components/app/AppLayout.tsx`
- **Steps:**
  1. Remove Tabs, render single combined list sorted by addedAt
  2. Add grid/list view toggle
  3. Redesign item actions: X removes, "Found!" toggles acquired
  4. Keep progress bar, update title

### 5. Phase 5: Detail Panel Updates
- **Objective:** Make album covers clickable to detail page. Add all tags. Use simple Want/Added toggle at bottom.
- **Files/Functions to Modify/Create:**
  - `src/pages/ReleaseDetailPage.tsx`
  - `src/components/app/ReleaseCard.tsx`
  - `src/components/app/ReleaseListItem.tsx`
  - `src/pages/MyListPage.tsx`
- **Steps:**
  1. Wrap album art in Link to /release/{releaseId} in all components
  2. Add label badge to detail page
  3. Replace detail page actions with Want/Added toggle

### 6. Phase 6: Account Page Redesign
- **Objective:** Redesign per screenshot: Google avatar, avatar upload, editable display name, remove providers and preset avatars.
- **Files/Functions to Modify/Create:**
  - `src/pages/AccountPage.tsx`
  - `src/types/user.ts`
  - `src/lib/auth.ts`
- **Steps:**
  1. Add photoURL to UserSchema and ensureUserDoc
  2. Create updateUserProfile function
  3. Redesign AccountPage with centered avatar, upload, editable name
  4. Remove preset avatar and providers sections
