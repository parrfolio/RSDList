---
description: "Add polished animations and transitions to UI components"
agent: "conductor.powder"
---

# Add UI Animations

You are adding animations and transitions to the application using Framer Motion and CSS.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.implementation** with animation-designer skill — Implement animations
2. **@frontend.accessibility** — Verify accessibility (reduced motion support)

## Animation Standards (from animation-designer skill)

### Performance Rules

- ONLY animate `transform` and `opacity` (GPU-accelerated)
- Duration sweet spots: 200-400ms for UI transitions
- Use `will-change` sparingly and remove after animation
- Test with 6x CPU slowdown in DevTools

### Easing Choices

- **Entrances**: `easeOut` (fast start, gentle finish)
- **Exits**: `easeIn` (gentle start, fast finish)
- **Continuous**: `easeInOut`
- **Bouncy/playful**: Spring physics

### Accessibility (MANDATORY)

- ALWAYS implement `useReducedMotion` hook
- When `prefers-reduced-motion: reduce` is set:
  - Disable decorative animations
  - Keep essential motion (e.g., page transitions) but reduce duration to <100ms
  - Never disable opacity transitions (they don't cause vestibular issues)

## Animation Categories

| Type                | Library                         | Duration      |
| ------------------- | ------------------------------- | ------------- |
| Page transitions    | Framer Motion `AnimatePresence` | 200-300ms     |
| Component entrances | Framer Motion `motion`          | 150-250ms     |
| Stagger lists       | Framer Motion `staggerChildren` | 50ms per item |
| Micro-interactions  | CSS `transition`                | 100-200ms     |
| Loading states      | CSS `@keyframes`                | 1-2s loops    |
| Hover effects       | CSS `transition`                | 150ms         |
| Scroll effects      | Framer Motion `useScroll`       | Scroll-driven |

## Instructions

1. Identify which elements need animation
2. Choose appropriate animation type and library
3. Implement with proper easing and duration
4. Add `useReducedMotion` support
5. Test performance (no janky frames)
6. Verify accessibility (frontend.accessibility)

## User Input

{{input}}
