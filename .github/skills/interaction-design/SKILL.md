---
name: interaction-design
description: Design and implement microinteractions, motion design, transitions, and user feedback patterns. Use when adding polish to UI interactions, implementing loading states, or creating delightful user experiences.
agents:
  [
    "frontend.implementation",
    "design.visual-designer",
    "design.ux-engineer",
    "frontend.design-system",
  ]
---

# Interaction Design

Interaction patterns and decisions for motion, feedback, and state transitions
that enhance usability. This skill focuses on **what** to animate and **why** —
not raw animation code.

## Relationship to Other Skills

- **For animation implementation code** → use **animation-designer**.
- **For timing tokens, easing curves, colors, and fonts** → defer to **design-system**.
- **This skill** focuses on interaction PATTERNS and DECISIONS, not animation code.

## Defers to design-system

For token values (durations, easings, colors, fonts, spacing),
the **design-system** skill is the single source of truth.
NEVER define token values here.

## When to Use This Skill

- Deciding which UI state changes need motion feedback
- Choosing the right interaction pattern for a component
- Designing loading, error, and empty states
- Planning transitions between views or pages
- Adding hover, focus, and active feedback
- Implementing drag-and-drop interaction flows
- Designing notification and toast behavior

## Core Principles

### Purposeful Motion

Motion MUST communicate, NEVER merely decorate:

- **Feedback** — Confirm user actions occurred
- **Orientation** — Show where elements come from and go to
- **Focus** — Direct attention to important changes
- **Continuity** — Maintain context during transitions

### Timing Guidelines

| Duration   | Use Case                                            |
| ---------- | --------------------------------------------------- |
| 100–150 ms | Micro-feedback (hovers, button presses, toggles)    |
| 200–300 ms | Small transitions (dropdowns, tooltips, accordions) |
| 300–500 ms | Medium transitions (modals, page changes, drawers)  |
| 500 ms+    | Complex choreographed sequences (use sparingly)     |

- NEVER use durations below 100 ms — they feel instantaneous and waste CPU.
- NEVER use durations above 500 ms for single-element transitions — they feel sluggish.
- ALWAYS use timing token constants from design-system, not literal numbers.

### Easing Functions

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1); /* Decelerate — entering elements */
--ease-in: cubic-bezier(0.55, 0, 1, 0.45); /* Accelerate — exiting elements */
--ease-in-out: cubic-bezier(
  0.65,
  0,
  0.35,
  1
); /* Both — moving between positions */
--spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Overshoot — playful emphasis */
```

- MUST use `ease-out` for elements entering the viewport.
- MUST use `ease-in` for elements leaving the viewport.
- NEVER use `linear` for UI transitions (it feels mechanical).

## Interaction Patterns

### Loading States

- **Skeleton screens** MUST preserve the target layout dimensions.
  NEVER show a centered spinner when the final layout is a card grid.
- **Progress indicators** MUST be determinate when progress is known.
  NEVER show an indeterminate spinner if you have percentage data.
- All loading indicators MUST have `role="status"` and `aria-live="polite"`.

### State Transitions

- **Toggles and switches**: MUST animate the knob position, not just swap colors.
  The motion communicates that a value changed.
- **Accordions and drawers**: MUST animate height/reveal with clip or transform,
  NEVER with `display: none` toggling (which provides no transition).
- **Tabs**: MUST provide a visual indicator (underline slide, background morph)
  showing which tab is active and where it moved from.

### Page and View Transitions

- Entering content MUST animate in from a direction consistent with navigation.
  Forward navigation → content enters from the right or bottom.
  Backward navigation → content enters from the left or top.
- MUST use `<AnimatePresence>` to ensure the exiting view animates out
  before the entering view animates in.
- NEVER allow two views to be visible simultaneously without intentional overlap.

### Feedback Patterns

- **Button press**: MUST provide immediate tactile feedback (scale, color shift)
  within 100 ms of the press event.
- **Form submission**: MUST disable the submit button and show a loading indicator
  after submission. MUST show success or error feedback when complete.
- **Destructive actions**: MUST require confirmation. The confirmation UI
  MUST animate in to draw attention.
- **Hover states**: MUST be subtle (opacity, underline, slight scale).
  NEVER use hover-only information — it is inaccessible on touch devices.

### Gesture Interactions

- **Swipe to dismiss**: MUST provide a visual threshold indicator
  showing when the swipe will trigger dismissal.
- **Drag and drop**: MUST show a clear drop target highlight.
  The dragged element MUST have elevated shadow or opacity change.
- All gesture interactions MUST have a non-gesture alternative
  (button, menu) for keyboard and assistive technology users.

### Notification and Toast Behavior

- Toasts MUST auto-dismiss after 5–8 seconds for non-critical messages.
- Error and action-required toasts MUST persist until dismissed by the user.
- MUST stack toasts vertically, NEVER overlap them.
- MUST animate entry (slide from edge) and exit (fade + slide).

## Accessibility (NON-NEGOTIABLE)

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- EVERY interactive animation MUST respect `prefers-reduced-motion`.
- When reduced motion is active: transitions MUST complete instantly,
  but state changes MUST still be visually communicated (color, icon swap).
- NEVER rely on motion alone to convey meaning.
  ALWAYS pair motion with a non-motion cue (text, icon, color).

### Focus and Keyboard

- EVERY interactive element MUST have a visible focus indicator.
- Focus indicators MUST meet 3:1 contrast ratio against adjacent colors.
- Tab order MUST follow visual reading order.
- NEVER trap focus inside an animation sequence.

## Common Issues

| Issue                     | Cause                                                          | Fix                                                            |
| ------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| Janky animations          | Animating layout properties (`width`, `height`, `top`, `left`) | ONLY animate `transform` and `opacity`                         |
| Motion fatigue            | Too many simultaneous or gratuitous animations                 | Limit to ≤ 5 concurrent animations per viewport                |
| Blocked interactions      | Animations prevent user input                                  | NEVER block input during animations; ALWAYS allow interruption |
| Memory leaks              | Animation listeners not cleaned up on unmount                  | ALWAYS clean up subscriptions in `useEffect` return            |
| Flash of unstyled content | Content visible before animation starts                        | Use `initial` state to hide content before animation begins    |
| Inaccessible on touch     | Hover-only feedback patterns                                   | ALWAYS provide touch and keyboard alternatives                 |

## Best Practices

1. **Performance first** — ONLY animate `transform` and `opacity`.
2. **Respect reduced motion** — ALWAYS check `prefers-reduced-motion`.
3. **Consistent timing** — ALWAYS use design-system timing tokens.
4. **Natural physics** — Prefer spring animations over linear easing.
5. **Interruptible** — ALWAYS allow users to cancel long animations.
6. **Progressive enhancement** — The interface MUST work without animations.
7. **Test on real devices** — Performance varies significantly across hardware.
