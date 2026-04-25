---
name: animation-designer
description: Expert in web animations, transitions, and motion design using Framer Motion and CSS
version: 2.0.0
tags: [animation, framer-motion, css-animations, transitions, motion-design]
agents: ["frontend.implementation", "design.ux-engineer"]
---

# Animation Designer Skill

Hard constraints and architectural guidance for web animations using Framer Motion and CSS.
This skill defines the rules — not copy-paste recipes an LLM already knows.

## What I Do

- Page and component transitions (enter/exit/layout)
- Scroll-triggered and parallax animations
- Micro-interactions (hover, press, focus, drag feedback)
- Loading and progress animations
- Choreographed multi-element sequences

## Defers to design-system

For animation token values, timing scales, easing curves, font families, and color values,
defer to the **design-system** skill as the single source of truth.
NEVER invent font families, brand colors, or spacing values in animation code.

## Hard Constraints (MUST Follow)

### Performance

- MUST target 60 fps for all animations.
- ONLY animate `transform` and `opacity`.
  NEVER animate `width`, `height`, `top`, `left`, `margin`, or `padding`.
- MUST limit concurrent animations to **≤ 5 per viewport**.
- MUST use `LazyMotion` with `domAnimation` for bundle splitting (~32 KB → ~5 KB).
- MUST prefer `m` components (e.g., `m.div`) over `motion.div` when using `LazyMotion`.
- For simple fade/slide effects, MUST prefer Tailwind `animate-*` utilities
  before reaching for Framer Motion.
- MUST use `will-change` sparingly — apply only when profiling confirms
  a repaint bottleneck, and remove after the animation completes.

### Accessibility (NON-NEGOTIABLE)

- EVERY animation MUST respect `prefers-reduced-motion` via
  Framer Motion's `useReducedMotion()` hook.
- When reduced motion is preferred: set `duration` to `0`
  and keep opacity-only instant transitions.
- MUST include a CSS fallback rule:

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

- Loading and progress animations MUST have `role="status"` and `aria-live="polite"`.
- NEVER use infinite animations without a visible pause/stop control (WCAG 2.2.2).
- NEVER auto-play animation that flashes more than 3 times per second (WCAG 2.3.1).

### Timing Tokens

MUST use shared constants — NEVER ad-hoc magic-number durations or easings.

```typescript
// animation-tokens.ts — canonical values, defer to design-system for overrides
export const DURATION_FAST = 0.15;
export const DURATION_NORMAL = 0.3;
export const DURATION_SLOW = 0.5;
export const EASE_DEFAULT: [number, number, number, number] = [0.4, 0, 0.2, 1];
```

- ALWAYS import timing values from the shared tokens file.
- NEVER write literal duration numbers (e.g., `0.3`) directly in component files.
- Reference the **design-system** skill for the authoritative token definitions.

### Exit Animations

- ALL conditionally-rendered animated elements MUST use `<AnimatePresence>`
  with an `exit` prop.
- Each direct child of `<AnimatePresence>` MUST have a unique `key` prop.
- NEVER conditionally render an animated element without wrapping it
  in `<AnimatePresence>`.

### Anti-Patterns

| Anti-Pattern                                  | Why                                         | Do This Instead                                       |
| --------------------------------------------- | ------------------------------------------- | ----------------------------------------------------- |
| Animating `width`, `height`, `top`, `left`    | Triggers layout recalculation, causes jank  | Animate `transform` (`x`, `y`, `scale`) and `opacity` |
| Infinite animation without pause control      | Violates WCAG 2.2.2; causes motion sickness | ALWAYS provide a visible pause/stop button            |
| Missing `key` on `<AnimatePresence>` children | Exit animations silently break              | ALWAYS add a unique `key` to each direct child        |
| Ad-hoc duration values (`0.35`, `0.25`)       | Inconsistent timing across the app          | ALWAYS use shared timing token constants              |
| `motion.div` without `LazyMotion`             | Ships full Framer Motion bundle (~32 KB)    | Use `LazyMotion` + `domAnimation` + `m.div`           |
| `will-change: transform` on all elements      | Excess GPU memory, harms performance        | Apply only when profiling confirms need, remove after |
| Framer Motion for simple fade/slide           | Unnecessary bundle weight                   | Use Tailwind `animate-*` utilities first              |

## Reference Example: LazyMotion Setup

One correct pattern for initializing animations in this project:

```tsx
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { DURATION_NORMAL, EASE_DEFAULT } from "@/lib/animation-tokens";

export function AnimatedPanel({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <m.div
            key="panel"
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 8 }}
            transition={{
              duration: reduced ? 0 : DURATION_NORMAL,
              ease: EASE_DEFAULT,
            }}
          >
            {children}
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
```

## Best Practices

### Performance Verification

- ALWAYS profile animations in Chrome DevTools Performance tab before shipping.
- ALWAYS test on low-end devices (throttle CPU 4x in DevTools).
- MUST clean up animation listeners and subscriptions on component unmount.

### Animation Hierarchy

1. **CSS transitions** — for single-property state changes (hover, focus).
2. **Tailwind `animate-*`** — for simple keyframe animations (fade-in, pulse, spin).
3. **Framer Motion** — for orchestrated, interactive, or physics-based animations.

MUST pick the lightest tool that meets the requirement.

### Interruptibility

- MUST allow users to interrupt or cancel long-running animations.
- NEVER block user input during an animation.
- NEVER prevent navigation while a transition is playing.

### Progressive Enhancement

- Animations MUST be progressive enhancement —
  the interface MUST function without them.
- NEVER gate critical functionality behind animation completion.
