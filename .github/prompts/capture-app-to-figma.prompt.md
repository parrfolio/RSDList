---
description: "Capture a running application into Figma using generate_figma_design with live browser capture"
---

# Capture Running App to Figma

You are faithfully reproducing a running application in Figma. The real, rendered UI is the source of truth — not code, not memory, not assumptions. Every screen must be captured from the live app using `generate_figma_design`, never reconstructed from code.

## Prerequisites

Before starting, verify:

- [ ] The application is running locally (e.g., `pnpm dev`, `npm run dev`) and accessible in a browser
- [ ] The Figma MCP server is connected — call `figma/whoami` to confirm. If it fails, STOP and tell the user.

## Route Discovery

Before capturing, discover all routes/pages in the application:

1. Read the app's router configuration (e.g., `app/routes/`, `src/routes.ts`, `next.config.js`, file-based routing)
2. List every primary route and what it displays
3. Present the route inventory to the user for confirmation
4. Note any routes that require authentication or special state

## Capture Workflow

For EACH route/page, follow this exact sequence:

### Step 1 — Call `generate_figma_design`

Call `figma/generate_figma_design` with the page URL. This returns a capture ID and capture parameters.

### Step 2 — Inject the Figma capture script

Find the app's root HTML template (`layout.tsx`, `index.html`, `app.html`, or equivalent) and inject this script tag inside `<head>`:

```html
<script
  src="https://mcp.figma.com/mcp/html-to-design/capture.js"
  async
></script>
```

**Only inject once** — if the script is already present from a previous capture, skip this step.

### Step 3 — Open the capture URL

Open the page URL with the Figma capture parameters appended:

```
open "http://localhost:3000/route#figmacapture={captureId}&figmaendpoint={endpointUrl}&figmadelay=3000"
```

The `figmadelay` gives the page time to fully render before capture.

### Step 4 — Wait for capture completion

Poll or wait for the capture to complete. The MCP will confirm when the page has been captured into Figma.

### Step 5 — Verify the capture

Call `figma/get_screenshot` to verify the captured screen looks correct. If the capture is blank or broken, retry with a longer `figmadelay`.

### Step 6 — Repeat for all routes

Repeat Steps 1 and 3-5 for each remaining route. The capture script (Step 2) only needs to be injected once.

## Post-Capture Cleanup (CRITICAL)

After ALL screens have been captured:

1. **Remove the Figma capture script** from the app's root HTML — revert the `<script>` tag injection. This is not optional. Do NOT leave the capture script in the source code.
2. Verify the app still runs correctly after removal.

## Post-Capture Refinement

After all screens are captured and the script is removed, use `figma/use_figma` to:

- Organize pages and frames with clear naming (one page per route/section)
- Extract repeated UI patterns into reusable Figma components (buttons, cards, nav items, form fields)
- Create component variants where props differ (e.g., button sizes, active/inactive states)
- Organize components on a dedicated **Components** page
- Apply auto-layout to captured frames where appropriate
- Sync CSS custom property tokens as Figma variables
- Clean up alignment artifacts from the capture

## Rules (Non-Negotiable)

- `generate_figma_design` is the ONLY method for capturing screens — never recreate screens manually with `use_figma`
- `use_figma` is ONLY for post-capture refinement and componentization
- If the app is not running → **STOP** and tell the user (do NOT fabricate screens from code)
- If a route fails to load → skip it, tell the user, and continue with remaining routes
- If the Figma MCP is disconnected → **STOP** and tell the user
- **Always revert the capture script injection** after all captures are complete
- Every Figma screen must come from a real browser capture, not from reading source code

## Gate

The workflow is **PASS** when:

- [ ] Every discovered route has a `generate_figma_design` capture in Figma (or is explicitly skipped with reason)
- [ ] The Figma capture script has been removed from the app source code
- [ ] `use_figma` was used ONLY for refinement, not screen creation
- [ ] No fabricated or placeholder screens exist in the Figma file
- [ ] Components are extracted and organized on a Components page
- [ ] Figma file is organized with clear page/frame naming

## User Input

{{input}}
