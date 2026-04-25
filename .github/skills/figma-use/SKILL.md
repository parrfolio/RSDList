---
name: figma-use
description: Critical rules, patterns, and workflow for using the official Figma MCP `use_figma` tool to create and modify designs — components, tokens, layouts, and full screens. MUST be loaded before any `use_figma` call. Covers the Plugin API rules (color ranges, font loading, page switching, return patterns), incremental workflow, error recovery, pre-flight checklist, and screen composition from design system components. Use when creating Figma components, building screens, syncing design tokens, or writing any `use_figma` script.
metadata:
  tags: figma, mcp, use-figma, plugin-api, design-system, components, tokens, screens
  compatibility: Requires official Figma MCP server (mcp.figma.com)
agents: ["frontend.design-system", "design.visual-designer"]
---

# use_figma — Figma Plugin API Skill

Use the `use_figma` tool to execute JavaScript in Figma files via the Plugin API.
This skill is MANDATORY reading before any `use_figma` call. It contains critical
rules that prevent hard-to-debug failures.

Always pass `skillNames: "figma-use"` when calling `use_figma`. This is a logging
parameter — it does not affect execution.

## When to Use

- Creating components, component sets, or variants in Figma
- Creating or binding design tokens (variables, collections, modes)
- Building full-page screens from design system components
- Updating existing Figma designs or screens
- Syncing code-level design tokens into Figma
- Any task that calls `use_figma`

If the source of truth is a runnable localhost app or live web app and the goal is to faithfully mirror the real UI in Figma, `use_figma` is NOT the first step. Capture the live UI with `generate_figma_design` first for each reachable route/state, then use `use_figma` only for cleanup and structural refinement.

Do NOT use this skill when you only need to read from Figma — see
`figma-read-design` for `get_design_context`, `get_screenshot`, and
`get_metadata` workflows.

## Critical Rules (NON-NEGOTIABLE)

These 17 rules must be followed for every `use_figma` call. Violating any of
them causes silent failures, mangled output, or outright errors.

### Return and Output

1. **Use `return` to send data back.** The return value is JSON-serialized
   automatically. Do NOT call `figma.closePlugin()` or wrap code in an async
   IIFE — this is handled for you.
2. **Write plain JavaScript with top-level `await` and `return`.** Code is
   automatically wrapped in an async context. Do NOT wrap in
   `(async () => { ... })()`.
3. **`console.log()` is NOT returned.** Use `return` for all output. The agent
   sees ONLY what you `return`.
4. **MUST `return` ALL created/mutated node IDs.** Collect every affected node
   ID and return them: `return { createdNodeIds: [...], mutatedNodeIds: [...] }`.

### Forbidden APIs

5. **`figma.notify()` throws "not implemented."** Never use it.
6. **`getPluginData()` / `setPluginData()` are not supported.** Use
   `getSharedPluginData()` / `setSharedPluginData()` instead, or track node IDs
   by returning them.

### Colors and Paints

7. **Colors are 0–1 range (NOT 0–255).** `{r: 1, g: 0, b: 0}` = red.
8. **Paint `color` objects use `{r, g, b}` only.** No `a` field. Opacity goes
   at the paint level: `{ type: 'SOLID', color: {...}, opacity: 0.5 }`.
9. **Fills/strokes are read-only arrays.** Clone, modify, then reassign.
10. **`setBoundVariableForPaint` returns a NEW paint.** Must capture and
    reassign.

### Text and Fonts

11. **Font MUST be loaded before any text operation:**
    `await figma.loadFontAsync({family, style})`. Use
    `await figma.listAvailableFontsAsync()` to discover available fonts and
    exact style strings. If `loadFontAsync` fails, call
    `listAvailableFontsAsync()` and pick a fallback.

### Pages

12. **Use `await figma.setCurrentPageAsync(page)` to switch pages.** The sync
    setter `figma.currentPage = page` does NOT work — it throws. Always use the
    async method.
13. **`figma.currentPage` resets to the first page at the start of each
    `use_figma` call.** If your workflow targets a non-default page, call
    `setCurrentPageAsync` at the start of each invocation.

### Layout

14. **`layoutSizingHorizontal/Vertical = 'FILL'` MUST be set AFTER
    `parent.appendChild(child)`.** Setting before append throws. Same applies
    to `'HUG'` on non-auto-layout nodes.
15. **`resize()` resets sizing modes to FIXED.** Call `resize()` BEFORE setting
    sizing modes.

### Positioning and Variables

16. **Position new top-level nodes away from (0,0).** Scan
    `figma.currentPage.children` to find clear space.
17. **Always set `variable.scopes` explicitly.** The default `ALL_SCOPES`
    pollutes every property picker. Use specific scopes like
    `["FRAME_FILL", "SHAPE_FILL"]`.

### Async Safety

18. **`await` every Promise.** Unawaited async calls fire-and-forget, causing
    silent failures or race conditions.

### Error Handling

19. **On `use_figma` error, STOP.** Do NOT immediately retry. Failed scripts
    are atomic — if a script errors, no changes are made. Read the error
    message, fix the script, then retry.
20. **Do NOT reconstruct live app screens with `use_figma` when live capture is available.** If a running localhost app or live web app is the source of truth, `generate_figma_design` is the authoritative first step for each reachable route/state.
21. **If live capture prerequisites are missing, BLOCK.** When the request is to faithfully mirror the real running UI and the app is unavailable or the Figma MCP is disconnected, do NOT fabricate substitute screens with `use_figma`.

## Incremental Workflow (MANDATORY)

The most common cause of bugs is trying to do too much in a single `use_figma`
call. Work in small steps and validate after each one.

### The Pattern

1. **Inspect first.** Run a read-only `use_figma` to discover what exists —
   pages, components, variables, naming conventions. Match what's there.
2. **Do one thing per call.** Create variables in one call, create components
   in the next, compose layouts in another.
3. **Return IDs from every call.** You need these as inputs to subsequent calls.
4. **Validate after each step.** Use `get_metadata` for structure. Use
   `get_screenshot` after major milestones.
5. **Fix before moving on.** Don't build on a broken foundation.

### Suggested Step Order

```text
Step 1: Inspect file — discover pages, components, variables, conventions
Step 2: Create tokens/variables (if needed) → validate with get_metadata
Step 3: Create individual components → validate with get_metadata + get_screenshot
Step 4: Compose layouts from component instances → validate with get_screenshot
Step 5: Final verification
```

## Pre-Flight Checklist

Before submitting ANY `use_figma` call, verify:

- [ ] `return` is used to send data back (NOT `figma.closePlugin()`)
- [ ] Code is NOT wrapped in an async IIFE
- [ ] `return` includes all created/mutated node IDs
- [ ] No `figma.notify()` usage
- [ ] No `console.log()` as output
- [ ] Colors use 0–1 range
- [ ] `{r, g, b}` only in paint color — no `a` field
- [ ] Fills/strokes reassigned as new arrays
- [ ] Page switches use `await figma.setCurrentPageAsync(page)`
- [ ] `layoutSizingVertical/Horizontal = 'FILL'` set AFTER `appendChild()`
- [ ] `loadFontAsync()` called BEFORE text property changes
- [ ] `lineHeight`/`letterSpacing` use `{unit, value}` format
- [ ] `resize()` called BEFORE setting sizing modes
- [ ] New top-level nodes positioned away from (0,0)
- [ ] Every async call is `await`ed

## Error Recovery

### When `use_figma` Returns an Error

1. **STOP.** Do not immediately retry.
2. Read the error message carefully.
3. If unclear, call `get_metadata` or `get_screenshot` to understand file state.
4. Fix the script based on the error message.
5. Retry the corrected script.

### Common Error Patterns

| Error                                        | Cause                               | Fix                                                |
| -------------------------------------------- | ----------------------------------- | -------------------------------------------------- |
| "not implemented"                            | Used `figma.notify()`               | Remove it — use `return`                           |
| "node must be an auto-layout frame..."       | Set FILL/HUG before append          | Move `appendChild` before `layoutSizingX = 'FILL'` |
| "Setting figma.currentPage is not supported" | Sync page setter                    | Use `await figma.setCurrentPageAsync(page)`        |
| Property value out of range                  | Color channel > 1                   | Divide by 255                                      |
| "Cannot read properties of null"             | Wrong node ID or page               | Check page context, verify ID                      |
| Script hangs                                 | Infinite loop or unresolved promise | Check for missing `await`                          |
| "The node with id X does not exist"          | Parent instance detached            | Re-discover nodes from stable parent               |

### When Script Succeeds but Result Looks Wrong

1. Call `get_metadata` for structural correctness.
2. Call `get_screenshot` for visual correctness — look for cropped text and
   overlapping elements.
3. Write a targeted fix script — don't recreate everything.

## Building Screens from Design System

When the task is to build or update a full screen, follow this workflow.

### Step 1: Understand the Screen

Before touching Figma, understand what you're building. Read source files,
identify major sections, list UI components per section.

### Step 2: Discover Design System

You need three things: **components**, **variables**, and **styles**.

**Components** — Inspect existing screens first:

```javascript
const frame = figma.currentPage.findOne((n) => n.name === "Existing Screen");
const uniqueSets = new Map();
frame
  .findAll((n) => n.type === "INSTANCE")
  .forEach((inst) => {
    const mc = inst.mainComponent;
    const cs = mc?.parent?.type === "COMPONENT_SET" ? mc.parent : null;
    const key = cs ? cs.key : mc?.key;
    const name = cs ? cs.name : mc?.name;
    if (key && !uniqueSets.has(key))
      uniqueSets.set(key, { name, key, isSet: !!cs, sampleVariant: mc.name });
  });
return [...uniqueSets.values()];
```

Fall back to `search_design_system` with `includeComponents: true` when the
file has no existing screens.

**Variables** — Use `search_design_system` with `includeVariables: true`.
Search broadly: "gray", "background", "space", "radius". Never conclude "no
variables exist" from `getLocalVariableCollectionsAsync()` alone — it only
returns local variables. Library variables require `search_design_system`.

**Styles** — Use `search_design_system` with `includeStyles: true` for text
and effect styles.

### Step 3: Create the Page Wrapper Frame

Create the wrapper first, then build sections inside it. Do NOT build sections
as top-level children and reparent later.

```javascript
let maxX = 0;
for (const child of figma.currentPage.children)
  maxX = Math.max(maxX, child.x + child.width);

const wrapper = figma.createAutoLayout("VERTICAL");
wrapper.name = "Homepage";
wrapper.primaryAxisAlignItems = "CENTER";
wrapper.counterAxisAlignItems = "CENTER";
wrapper.resize(1440, 100);
wrapper.layoutSizingHorizontal = "FIXED";
wrapper.x = maxX + 200;
wrapper.y = 0;
return { success: true, wrapperId: wrapper.id };
```

### Step 4: Build Each Section Inside the Wrapper

One section per `use_figma` call. At the start of each script, fetch the
wrapper by ID and append content to it.

- Import components with `figma.importComponentSetByKeyAsync(key)`.
- Import variables with `figma.variables.importVariableByKeyAsync(key)`.
- Import styles with `figma.importStyleByKeyAsync(key)`.
- Bind variables with `setBoundVariable()` for spacing and
  `setBoundVariableForPaint()` for colors.
- Apply text styles with `node.textStyleId = style.id`.
- Override instance text with `instance.setProperties()` using the property
  keys discovered in Step 2.
- Validate with `get_screenshot` after each section.

### Step 5: Validate the Full Screen

Screenshot individual sections by node ID (not just the full page). Check for:

- Cropped or clipped text
- Overlapping content
- Placeholder text still showing
- Wrong component variants
- Blank image placeholders

### Live App Capture Workflow with generate_figma_design (MANDATORY for faithful reproduction)

When the source is a running localhost app or live web app and the task is to mirror the real UI in Figma:

1. Verify the app is actually reachable and each target route/state can be exercised
2. Verify the Figma MCP is connected
3. Gather browser-verified route/state inventory and screenshots for nav-driven or multi-page work
4. Run `generate_figma_design` FIRST for each reachable route/state. This capture is authoritative.
5. Use `use_figma` ONLY AFTER capture to:

- clean up layers
- sync tokens
- organize components/pages
- create variants
- make structural edits around the captured output

6. Do NOT rebuild the captured screen from code, memory, or generic placeholders when the live capture exists
7. If the app is unavailable or the Figma MCP is disconnected, STOP and report BLOCKED

This is mandatory when the user wants a faithful representation of a running app. `use_figma` is a post-capture refinement tool in that workflow, not a substitute for capture.

## Discover Conventions Before Creating

Always inspect the Figma file before creating anything. Match existing naming,
variable structures, and component patterns.

### Quick Inspection Scripts

List all pages:

```javascript
const pages = figma.root.children.map(
  (p) => `${p.name} id=${p.id} children=${p.children.length}`,
);
return pages.join("\n");
```

List existing components:

```javascript
const results = [];
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  page.findAll((n) => {
    if (n.type === "COMPONENT" || n.type === "COMPONENT_SET")
      results.push(`[${page.name}] ${n.name} (${n.type}) id=${n.id}`);
    return false;
  });
}
return results.join("\n");
```

List variable collections:

```javascript
const collections = await figma.variables.getLocalVariableCollectionsAsync();
return collections.map((c) => ({
  name: c.name,
  id: c.id,
  varCount: c.variableIds.length,
  modes: c.modes.map((m) => m.name),
}));
```

## Editor Mode

`use_figma` works in design mode (`editorType: "figma"`, the default).

Available in design mode: Rectangle, Frame, Component, Text, Ellipse, Star,
Line, Vector, Polygon, BooleanOperation, Slice, Page, Section, TextPath.

Blocked in design mode: Sticky, Connector, ShapeWithText, CodeBlock, Slide,
SlideRow, Webpage. These are FigJam-only node types.

## Anti-Patterns

| Anti-Pattern                                                | Why                        | Do This Instead                                        |
| ----------------------------------------------------------- | -------------------------- | ------------------------------------------------------ |
| Doing everything in one `use_figma` call                    | Most common bug source     | One thing per call, validate after each                |
| Hard-coded hex colors                                       | Breaks design system       | Use tokens: `createToken()` + `setBoundVariable()`     |
| Reconstructing a live running screen with `use_figma` alone | Produces placeholder drift | Capture the real UI with `generate_figma_design` first |
| No convention inspection                                    | Breaks existing patterns   | Always inspect the file first                          |
| Colors in 0–255 range                                       | Wrong API contract         | Use 0–1 range (divide by 255)                          |
| `console.log()` for output                                  | Agent never sees it        | Use `return`                                           |
| Skipping font load                                          | Text renders wrong         | `loadFontAsync()` before text changes                  |
| Top-level nodes at (0,0)                                    | Overlaps existing content  | Scan children, position to the right                   |
| Moving nodes across calls                                   | Silently fails             | Build inside the wrapper from the start                |
| Retrying immediately on error                               | Wastes calls               | STOP, read error, fix, then retry                      |

## Cross-References

- For creating new Figma files → `figma-file-creation`
- For reading existing designs → `figma-read-design`
- For design token values and UI system consistency → `design-system`
- For component specs and visual artifacts → `product-designer`
- For accessibility requirements → `a11y.instructions.md`
- For legacy figma-pilot syntax → `figma-pilot` (historical reference only)
