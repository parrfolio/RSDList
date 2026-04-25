---
description: "Implement toast notifications, alerts, and real-time notification system"
agent: "conductor.powder"
---

# Build Notification System

You are implementing a notification system with toasts, alerts, and real-time updates.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** — Check for existing notification components
2. **@frontend.implementation** — Implement notification UI
3. **@engineering.implementation** — Implement backend notification logic (if persistent)
4. **@frontend.accessibility** — Accessibility audit

## Notification Types

### Toast Notifications (ephemeral)

- **Success**: Green accent, auto-dismiss after 5s
- **Error**: Red accent, manual dismiss (don't auto-dismiss errors)
- **Warning**: Amber accent, auto-dismiss after 8s
- **Info**: Blue accent, auto-dismiss after 5s
- **Action toast**: Include action button (e.g., "Undo")

### In-App Notifications (persistent)

- Notification bell with unread count badge
- Notification panel/drawer with list
- Mark as read/unread
- Firestore-backed for persistence across devices
- Real-time updates via Firestore real-time features

## Accessibility Requirements

- Toast announcements via `aria-live="polite"` (or `assertive` for errors)
- Toasts must be dismissible via keyboard (Escape or close button)
- Toasts must NOT steal focus from current task
- Notification badge announces count: `aria-label="3 unread notifications"`
- Notification panel navigable via keyboard

## Instructions

1. Check existing notification components (frontend.design-system)
2. Implement toast notification system:
   - Toast provider/context
   - Toast component with variants
   - Auto-dismiss and manual dismiss
   - Stack management (newest on top)
3. If persistent notifications needed:
   - Firestore collection for notifications
   - Cloud Functions for creating notifications
   - Real-time listener for new notifications
   - Notification bell with unread count
4. Verify accessibility (frontend.accessibility)

## User Input

{{input}}
