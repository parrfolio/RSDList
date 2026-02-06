# Feature Specification: RSD Wants - Record Store Day Checklist App

**Feature Branch**: `001-rsd-wants-app`  
**Created**: 2026-02-05  
**Status**: Draft  
**Input**: User description: "Build a complete Record Store Day checklist app where record collectors can browse the current year's RSD special releases list, save items to a personal wants list, and check them off as acquired while shopping in-store."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse RSD Releases (Priority: P1)

A record collector opens the app and browses the current year's Record Store Day special releases to discover what's available. They can view releases as a visual grid of album art, search by artist or title, and sort alphabetically.

**Why this priority**: This is the core discovery experience. Without being able to browse releases, the app has no value. Users need to see what's available before they can decide what to want.

**Independent Test**: Can be fully tested by loading the app and verifying the release list displays with album art, search works, and sorting toggles between A→Z and Z→A.

**Acceptance Scenarios**:

1. **Given** a user opens the app, **When** the RSD list loads, **Then** they see the current year's releases displayed as a grid of album art cards showing artist, title, format, and release type.
2. **Given** a user is viewing the release list, **When** they type "Beatles" in the search field, **Then** only releases matching "Beatles" in artist or title are displayed.
3. **Given** a user is viewing the release list, **When** they select "Artist Z→A" from the sort dropdown, **Then** releases are reordered alphabetically by artist in descending order.
4. **Given** a user is on a mobile device, **When** they view the release list, **Then** releases display in a mobile-optimized grid that requires no horizontal scrolling.

---

### User Story 2 - Sign In and Onboard (Priority: P1)

A new user signs in using their preferred method (Google, Facebook, or email/password) and completes a quick onboarding flow by selecting a preset avatar. After onboarding, they are ready to start building their wants list.

**Why this priority**: Authentication is required for personal data persistence. Users must be able to create an account to save their wants list across devices and sessions.

**Independent Test**: Can be fully tested by completing the sign-in flow with each authentication method and verifying avatar selection persists to user profile.

**Acceptance Scenarios**:

1. **Given** a new user on the sign-in page, **When** they choose Google sign-in and authenticate, **Then** their account is created and they are prompted to select an avatar.
2. **Given** a new user on the sign-in page, **When** they choose Facebook sign-in and authenticate, **Then** their account is created and they are prompted to select an avatar.
3. **Given** a new user on the sign-in page, **When** they sign up with email and password, **Then** their account is created and they are prompted to select an avatar.
4. **Given** a user in the avatar selection flow, **When** they select a preset avatar, **Then** their choice is saved and they land on the RSD list.
5. **Given** a returning user, **When** they sign in, **Then** they bypass avatar selection and land directly on the RSD list.

---

### User Story 3 - Add Items to My Wants (Priority: P1)

A signed-in user browsing the RSD list adds releases to their personal "My Wants" list. The action is immediate and works offline for in-store use.

**Why this priority**: This is the core data capture feature. Users must be able to mark releases they want before Record Store Day arrives.

**Independent Test**: Can be fully tested by signing in, adding a release to wants, refreshing the page, and verifying the item persists in "My Wants."

**Acceptance Scenarios**:

1. **Given** a signed-in user viewing a release card, **When** they tap "Add to My Wants", **Then** the release is immediately added to their wants list with visual confirmation.
2. **Given** a user has added an item to wants, **When** they view the same release card, **Then** the button shows "Remove from Wants" instead of "Add."
3. **Given** a signed-in user adds an item while offline, **When** they return online, **Then** the addition syncs automatically without data loss.
4. **Given** an anonymous user viewing a release card, **When** they tap "Add to My Wants", **Then** they are prompted to sign in first.

---

### User Story 4 - Manage Wants and Acquired While Shopping (Priority: P1)

A user at the record store opens their "My List" to see what they want. As they find items, they check them off to move them to "Acquired." If they change their mind, they can uncheck to move back to "Wanted."

**Why this priority**: This is the shopping day experience—the moment of highest value. Users need to quickly check off items one-handed on their phone while browsing store bins.

**Independent Test**: Can be fully tested by adding items to wants, navigating to My List, checking an item, and verifying it moves to the Acquired section instantly.

**Acceptance Scenarios**:

1. **Given** a user opens My List, **When** they have items in their wants, **Then** they see two sections: "Wanted" (unchecked items) and "Acquired" (checked items) with counts displayed.
2. **Given** a user views an item in the Wanted section, **When** they tap the checkbox, **Then** the item immediately moves to the Acquired section.
3. **Given** a user views an item in the Acquired section, **When** they uncheck it, **Then** the item immediately moves back to the Wanted section.
4. **Given** a user is on a mobile device, **When** they interact with My List, **Then** checkboxes and touch targets are large enough for easy one-handed use.
5. **Given** a user checks off an item while offline, **When** they return online, **Then** the status change syncs automatically.

---

### User Story 5 - Account Management (Priority: P2)

A user accesses their account page to view their profile, change their avatar, or sign out.

**Why this priority**: Important for user control but not blocking for core functionality.

**Independent Test**: Can be fully tested by navigating to account page, changing avatar, and verifying the change persists after page refresh.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they navigate to the Account page, **Then** they see their display name, email, and current avatar.
2. **Given** a user on the Account page, **When** they select a new avatar, **Then** their profile updates immediately with visual confirmation.
3. **Given** a signed-in user, **When** they tap "Sign Out", **Then** they are signed out and returned to the landing/sign-in page.

---

### Edge Cases

- What happens when a release is removed from the official RSD list after a user has added it to wants? (Item remains in user's wants with indication it may no longer be available)
- How does the system handle network connectivity loss mid-action? (Optimistic updates with background sync when connectivity returns)
- What happens if a user tries to add the same release twice? (Action is prevented; UI shows item is already in wants)
- How does the system handle very long artist or title names? (Text truncation with full text available on tap/hover)

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & User Management**
- **FR-001**: System MUST support sign-in via Google OAuth
- **FR-002**: System MUST support sign-in via Facebook OAuth
- **FR-003**: System MUST support sign-in via email and password
- **FR-004**: System MUST create a user profile upon first sign-in
- **FR-005**: System MUST prompt first-time users to select a preset avatar
- **FR-006**: System MUST allow users to sign out from any authenticated page

**RSD Release Browsing**
- **FR-007**: System MUST display the current year's RSD releases by default
- **FR-008**: System MUST display each release with album art, artist, title, format, and release type
- **FR-009**: System MUST support search filtering by artist name or title
- **FR-010**: System MUST support sorting by artist name (A→Z and Z→A)
- **FR-011**: System MUST display releases in a responsive grid optimized for mobile
- **FR-012**: System MUST allow anonymous browsing of the release list
- **FR-012a**: System MUST support both April RSD and Black Friday RSD events
- **FR-012b**: System MUST allow users to switch between events (April/Black Friday)
- **FR-012c**: System MUST display the active event name prominently

**Wants List Management**
- **FR-013**: System MUST allow signed-in users to add releases to their personal wants list
- **FR-014**: System MUST allow users to remove items from their wants list
- **FR-015**: System MUST persist wants list data across sessions and devices
- **FR-015a**: System MUST maintain separate wants lists per event (users have distinct April and Black Friday lists)
- **FR-016**: System MUST display wants in two sections: Wanted and Acquired
- **FR-017**: System MUST display counts for Wanted and Acquired items
- **FR-018**: System MUST support toggling item status between WANTED and ACQUIRED
- **FR-019**: System MUST move items between sections immediately upon status change

**Mobile & Offline Experience**
- **FR-020**: System MUST provide responsive mobile-first layout
- **FR-021**: System MUST display bottom tab navigation on mobile devices
- **FR-022**: System MUST provide touch targets of at least 44 pixels for mobile
- **FR-023**: System MUST support offline data access for viewing wants list
- **FR-024**: System MUST sync offline changes when connectivity is restored

**Data Management**
- **FR-025**: System MUST read release data from a managed data store
- **FR-026**: System MUST provide a mechanism to seed release data for the current year
- **FR-027**: System MUST provide admin-only capability to update release data

**Security & Privacy**
- **FR-028**: System MUST collect only minimal user data required for functionality (name, email, avatar preference, wants list)
- **FR-029**: System MUST rely on OAuth providers for password security (no custom password storage)

**UX & Design System**
- **FR-030**: System MUST display friendly empty states with illustration and CTA when lists have no items
- **FR-031**: System MUST use design system components built by UX subagents for consistent visual language

**Observability**
- **FR-032**: System MUST capture and report production errors for debugging
- **FR-033**: System MUST notify users via toast when remote data changes are detected (real-time sync)

### Key Entities

- **Event**: An RSD event identified by pattern `rsd_{year}_{season}` (e.g., `rsd_2026_spring`, `rsd_2026_fall`). Two events per year: Spring (April) and Fall (Black Friday).
- **Release**: A Record Store Day special release with artist, title, album art, format (vinyl, CD, etc.), release type, label, quantity, and associated event. Identified by external ID from recordstoreday.com when available.
- **User**: An authenticated user with display name, email, avatar selection, and authentication provider information
- **Want**: A user's saved release with status (WANTED or ACQUIRED), scoped to a specific event. Contains denormalized release information for fast display.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account creation and avatar selection in under 2 minutes
- **SC-002**: Users can browse and find a specific release in under 30 seconds using search
- **SC-003**: Users can add an item to wants with visual confirmation in under 1 second
- **SC-004**: Users can check off an item as acquired with visual feedback in under 1 second
- **SC-005**: My List page loads and displays all wants within 3 seconds on mobile networks
- **SC-006**: Application remains usable (read wants, toggle status) during network interruption
- **SC-007**: All interactive elements are accessible via keyboard navigation
- **SC-008**: Touch targets meet 44px minimum on mobile devices
- **SC-009**: 95% of user actions complete successfully without error
- **SC-010**: Local development environment can be started with a single command

## Assumptions

- Both April RSD and Black Friday RSD events are supported from MVP
- Users maintain separate wants lists per event (two per year)
- Releases are generated when official lists are published
- Preset avatar gallery is sufficient; custom upload is not needed for MVP
- Current year releases only; historical year browsing is out of scope for MVP
- No per-item notes, priority, or budget tracking needed for MVP
- Social features (sharing, public profiles) are out of scope for MVP
- Release data source may be unreliable; curated fallback dataset is acceptable

## Clarifications

### Session 2026-02-05

- Q: What level of user data protection is required? → A: Standard authentication security with minimal data collection (name, email, avatar preference, wants list)
- Q: How should empty states be handled? → A: Friendly illustration with call-to-action button, using design system components built by UX subagents
- Q: How many RSD events per year? → A: Two events (April ~April 20th, Black Friday after Thanksgiving). Users create separate wants lists per event. Releases generated when official lists are published.
- Q: Event/release identifier format? → A: Events use pattern `rsd_{year}_{season}` (e.g., `rsd_2026_spring`, `rsd_2026_fall`). Releases use external ID from recordstoreday.com when available.
- Q: How to handle concurrent edits across devices? → A: Last write wins; show toast notification when remote changes are detected via real-time sync.
- Q: What observability is needed for MVP? → A: Basic error tracking only (Sentry or Firebase Crashlytics). Usage analytics deferred to post-MVP.
