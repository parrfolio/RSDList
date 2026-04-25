---
description: "Guidelines for building TanStack Start applications"
applyTo: "**/app/**/*.{ts,tsx}, **/routes/**/*.{ts,tsx}, **/components/**/*.{tsx}, **/components.json, **/vite.config.{ts,js}, **/tailwind.config.{ts,js}, **/src/styles/**/*.css"
---

# TanStack Start with Shadcn/ui Development Guide

You are an expert TypeScript developer specializing in TanStack Start applications with modern React patterns.

## Tech Stack

- TypeScript (strict mode)
- TanStack Start (routing & SSR)
- Shadcn/ui (UI components)
- Tailwind CSS (styling)
- Zod (validation)
- TanStack Query (client state)

## shadcn/ui & Radix UI

shadcn/ui is NOT a traditional component library — it's a collection of reusable, copy-paste components you add directly to your project. Under the hood, shadcn/ui components are thin styled wrappers around **Radix UI primitives**.

### The Dependency Chain

```
Radix UI (unstyled, accessible primitives)
  └── shadcn/ui (styled components built on Radix)
       └── Your design system (themed with brand tokens via CSS custom properties)
```

### What Radix UI Provides

Radix UI provides the **building blocks** — unstyled, accessible primitive components:

- Dialog, AlertDialog, Popover, Tooltip, HoverCard
- Select, Combobox, DropdownMenu, ContextMenu, Menubar
- Tabs, Accordion, Collapsible, NavigationMenu
- Checkbox, Radio, Switch, Slider, Toggle, ToggleGroup
- Avatar, AspectRatio, ScrollArea, Separator, Progress

These primitives handle all accessibility concerns (keyboard navigation, ARIA attributes, focus management, screen reader support) out of the box.

### What shadcn/ui Adds

shadcn/ui takes Radix primitives and adds:

- Tailwind CSS styling with design tokens
- Composable component APIs (`variants`, `sizes` via `class-variance-authority`)
- Dark mode support
- Consistent visual patterns across the component set

### Rules

- **Always prefer shadcn/ui components** over building custom components from scratch
- **Never install competing UI libraries** (MUI, Chakra, Mantine, Ant Design) — shadcn/ui + Radix is the standard
- **`@radix-ui/*` packages in `package.json` are expected** — they are dependencies of shadcn/ui components, not separate installations
- **Use Radix primitives directly** only when you need a custom composition that shadcn/ui doesn't provide (e.g., a custom multi-select combobox built on `@radix-ui/react-popover` + `@radix-ui/react-command`)
- **Do not re-implement accessibility** that Radix already provides — if using a Radix-based shadcn component, keyboard nav and ARIA are already handled
- **Install shadcn components via the CLI**: `npx shadcn@latest add <component>` — this copies the source into your project for customization

### MCP Servers for Component Discovery

Two MCP servers are available for component research and discovery:

**shadcn MCP** (`mcp_shadcn_*` tools):

- Search, browse, and get install commands for shadcn/ui styled components
- View component examples from registries
- Get audit checklists and project registry info

**Radix UI MCP** (`radix-ui` tools):

- `themes_list_components` / `themes_get_component_source` / `themes_get_component_documentation` — Radix Themes (styled components with built-in design system)
- `primitives_list_components` / `primitives_get_component_source` / `primitives_get_component_documentation` — Radix Primitives (unstyled, accessible components)
- `colors_list_scales` / `colors_get_scale` / `colors_get_scale_documentation` — Radix Colors (semantic color scales with dark mode)

**When to use which:**

- Use **shadcn MCP** when looking for ready-to-use styled components to add to your project
- Use **Radix UI MCP** when you need to understand the primitive layer, build custom compositions, or work with the Radix color system directly

## Code Style Rules

- NEVER use `any` type - always use proper TypeScript types
- Prefer function components over class components
- Always validate external data with Zod schemas
- Include error and pending boundaries for all routes
- Follow accessibility best practices with ARIA attributes

## Component Patterns

Use function components with proper TypeScript interfaces:

```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={cn(buttonVariants({ variant }))}>
      {children}
    </button>
  );
}
```

## Data Fetching

Use Route Loaders for:

- Initial page data required for rendering
- SSR requirements
- SEO-critical data

Use React Query for:

- Frequently updating data
- Optional/secondary data
- Client mutations with optimistic updates

```typescript
// Route Loader
export const Route = createFileRoute("/users")({
  loader: async () => {
    const users = await fetchUsers();
    return { users: userListSchema.parse(users) };
  },
  component: UserList,
});

// React Query
const { data: stats } = useQuery({
  queryKey: ["user-stats", userId],
  queryFn: () => fetchUserStats(userId),
  refetchInterval: 30000,
});
```

## Zod Validation

Always validate external data. Define schemas in `src/lib/schemas.ts`:

```typescript
export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  role: z.enum(["admin", "user"]).default("user"),
});

export type User = z.infer<typeof userSchema>;

// Safe parsing
const result = userSchema.safeParse(data);
if (!result.success) {
  console.error("Validation failed:", result.error.format());
  return null;
}
```

## Routes

Structure routes in `src/routes/` with file-based routing. Always include error and pending boundaries:

```typescript
export const Route = createFileRoute('/users/$id')({
  loader: async ({ params }) => {
    const user = await fetchUser(params.id);
    return { user: userSchema.parse(user) };
  },
  component: UserDetail,
  errorBoundary: ({ error }) => (
    <div className="text-red-600 p-4">Error: {error.message}</div>
  ),
  pendingBoundary: () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  ),
});
```

## UI Components

Always prefer Shadcn/ui components over custom ones:

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>User Details</CardTitle>
  </CardHeader>
  <CardContent>
    <Button onClick={handleSave}>Save</Button>
  </CardContent>
</Card>
```

Use Tailwind for styling with responsive design:

```typescript
<div className="flex flex-col gap-4 p-6 md:flex-row md:gap-6">
  <Button className="w-full md:w-auto">Action</Button>
</div>
```

## Accessibility

Use semantic HTML first. Only add ARIA when no semantic equivalent exists:

```typescript
// ✅ Good: Semantic HTML with minimal ARIA
<button onClick={toggleMenu}>
  <MenuIcon aria-hidden="true" />
  <span className="sr-only">Toggle Menu</span>
</button>

// ✅ Good: ARIA only when needed (for dynamic states)
<button
  aria-expanded={isOpen}
  aria-controls="menu"
  onClick={toggleMenu}
>
  Menu
</button>

// ✅ Good: Semantic form elements
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />
{errors.email && (
  <p role="alert">{errors.email}</p>
)}
```

## File Organization

```
src/
├── components/ui/    # Shadcn/ui components
├── lib/schemas.ts    # Zod schemas
├── routes/          # File-based routes
└── routes/api/      # Server routes (.ts)
```

## Import Standards

Use `@/` alias for all internal imports:

```typescript
// ✅ Good
import { Button } from "@/components/ui/button";
import { userSchema } from "@/lib/schemas";

// ❌ Bad
import { Button } from "../components/ui/button";
```

## Adding Components

Install Shadcn components when needed:

```bash
npx shadcn@latest add button card input dialog
```

## Common Patterns

- Always validate external data with Zod
- Use route loaders for initial data, React Query for updates
- Include error/pending boundaries on all routes
- Prefer Shadcn components over custom UI
- Use `@/` imports consistently
- Follow accessibility best practices
