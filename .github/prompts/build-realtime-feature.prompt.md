---
description: "Build real-time features using Firestore live data capabilities"
agent: "conductor.powder"
---

# Build Real-Time Feature

You are implementing real-time functionality using Firestore live data capabilities.

Read the backend skill at `.github/skills/backend/SKILL.md` for backend-specific real-time patterns (listeners, subscriptions, channels, webhooks).

## Context

Use @conductor.powder to orchestrate:

1. **@engineering.implementation** — Backend data structure and security rules/policies for real-time access
2. **@frontend.implementation** — Frontend real-time UI updates
3. **@security.application** — Security audit of real-time data access

## Real-Time Patterns

### Live Data Integration

- Subscribe to data changes using Firestore real-time features
- Handle added, modified, and removed events
- Scope subscriptions to tenant data
- Clean up subscriptions on component unmount

### TanStack Query Integration

- Use `queryClient.setQueryData()` to update cache from live data subscriptions
- Combine subscription for real-time + Query for initial load
- Clean up subscriptions on component unmount

### UI Patterns

- Optimistic updates for user actions
- `aria-live="polite"` for real-time content changes
- Visual indicators for new/changed items (highlight briefly)
- Connection status indicator (online/offline/reconnecting)

## Security

- All subscriptions scoped to tenant
- Security rules/policies enforce read permissions
- Rate-aware design (don't subscribe to high-frequency data without limits)

## Instructions

1. Design the real-time data model
2. Implement security rules/policies for live access
3. Create subscription hooks with proper cleanup
4. Implement UI with optimistic updates and visual indicators
5. Handle offline/reconnection states
6. Security audit (security.application)
7. Accessibility check for dynamic content updates (frontend.accessibility)

## User Input

{{input}}
