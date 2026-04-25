---
description: "Build navigation with sidebar, breadcrumbs, and responsive mobile menu"
agent: "conductor.powder"
---

# Build Navigation

You are creating the application's navigation system.

## Context

Use @conductor.powder to orchestrate:

1. **@frontend.design-system** — Check for existing nav components
2. **@design.ux-engineer** — Validate flow standards
3. **@frontend.implementation** — Implement navigation
4. **@frontend.accessibility** — Accessibility audit
5. **@frontend.browsertesting** — Browser verification of primary navigation coverage

## Navigation Requirements

### Semantic Structure

```html
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li>
      <button aria-expanded="false">Settings</button>
      <ul>
        <!-- submenu -->
      </ul>
    </li>
  </ul>
</nav>
```

### Navigation Patterns

- **Sidebar**: Collapsible side navigation with icons + labels
- **Top bar**: App header with user menu and global actions
- **Breadcrumbs**: Show location in hierarchy (not for top-level pages)
- **Mobile menu**: Hamburger → slide-in panel or full-screen overlay
- **Skip link**: First focusable element, jumps to `<main>`

### Keyboard Requirements

- `Tab`/`Shift+Tab` for navigation links
- `Enter`/`Space` to activate links and toggle submenus
- `Escape` to close open submenus
- `aria-expanded` on collapsible sections
- `aria-current="page"` on the active link

### Responsive Behavior

- Desktop (>1024px): Full sidebar + top bar
- Tablet (768-1024px): Collapsed sidebar (icons only) + top bar
- Mobile (<768px): Hidden sidebar + hamburger menu in top bar

## Instructions

1. Check existing navigation components (frontend.design-system)
2. Design the navigation hierarchy and information architecture
3. Implement sidebar with collapsible sections
4. Implement top bar with user menu
5. Implement breadcrumbs
6. Implement responsive mobile menu
7. Add skip link
8. Verify flow standards (design.ux-engineer)
9. Produce a Main Navigation Coverage Matrix for every primary destination
10. Verify accessibility (frontend.accessibility)
11. Run browser testing to click every primary navigation item and confirm each destination is reachable and distinct

## User Input

{{input}}
