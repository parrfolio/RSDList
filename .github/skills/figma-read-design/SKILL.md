---
name: figma-read-design
description: Workflow for reading and understanding existing Figma designs via the official Figma MCP. Covers `get_design_context` for design-to-code extraction, `get_screenshot` for visual inspection, `get_metadata` for structural analysis, and `search_design_system` for component and token discovery. Use when translating Figma designs into code, auditing design system coverage, inspecting file structure, validating implemented UI against mocks, or discovering available components and variables.
metadata:
  tags: figma, mcp, read-design, get-design-context, get-screenshot, get-metadata, search-design-system, design-to-code
  compatibility: Requires official Figma MCP server (mcp.figma.com)
agents:
  [
    "frontend.design-system",
    "design.visual-designer",
    "frontend.implementation",
  ]
---

# Read Figma Designs — Official Figma MCP

Use this skill when the task involves reading, inspecting, or understanding
existing Figma designs. This covers the read side of the official Figma MCP —
extracting design context, capturing screenshots, inspecting metadata, and
discovering design system components and tokens.

## When to Use

- Translating a Figma design into code (design-to-code workflow)
- Inspecting an existing Figma file's structure before modifying it
- Auditing design system component and token coverage
- Capturing visual references for implementation or QA
- Discovering available components, variables, and styles in a library
- Validating implemented UI against the original Figma design
- Understanding a Figma file before creating new content with `use_figma`

Do NOT use this skill when the task is to create or modify Figma content — see
`figma-use` for write operations via `use_figma`.

## Required Tools

This skill uses these official Figma MCP tools:

| Tool                   | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `get_design_context`   | Extract design context (code, screenshot, hints) from a Figma node |
| `get_screenshot`       | Capture a visual screenshot of a Figma node or page                |
| `get_metadata`         | Inspect structural metadata (hierarchy, counts, properties)        |
| `search_design_system` | Discover components, variables, and styles across linked libraries |
| `whoami`               | Verify MCP connection and user context                             |

## Mandatory Pre-Flight

Before any read operation:

1. **Verify connection** — call `whoami` to confirm the Figma MCP is connected.
   If not connected, stop and tell the user to start the `figma` MCP server.
2. **Parse the Figma URL** — extract `fileKey` and `nodeId` from the URL:
   - `figma.com/design/:fileKey/:fileName?node-id=:nodeId` → convert `-` to
     `:` in nodeId
   - `figma.com/design/:fileKey/branch/:branchKey/:fileName` → use branchKey
     as fileKey
   - `figma.com/board/:fileKey/:fileName` → FigJam file
3. **Never fabricate `fileKey` or `nodeId`.** If the user did not provide a URL,
   ask for one.

## Tool Workflows

### get_design_context — Design-to-Code Extraction

**Primary tool for understanding a design and translating it to code.**

Returns enriched output including:

- Code representation (React + Tailwind by default)
- Screenshot of the node
- Contextual hints (Code Connect snippets, component docs, annotations, tokens)

**When to use:**

- The user provides a Figma URL and asks to implement it
- You need to understand what a design looks like and how it's structured
- You want code hints enriched with design system context

**Workflow:**

1. Call `get_design_context` with `fileKey` and `nodeId`.
2. Interpret the response:
   - **Code Connect snippets** → use the mapped codebase component directly
   - **Component documentation links** → follow them for usage context
   - **Design annotations** → follow notes, constraints, or instructions
   - **Design tokens as CSS variables** → map to the project's token system
   - **Raw hex colors / absolute positioning** → the design is loosely
     structured; rely more on the screenshot
3. **The output is a REFERENCE, not final code.** Always adapt to the target
   project's stack, components, and conventions.
4. Check the target project for existing components, layout patterns, and tokens
   that match the design intent. Reuse what exists.

### get_screenshot — Visual Inspection

**Capture a visual screenshot of any Figma node or page.**

**When to use:**

- Validating that `use_figma` output matches intent (post-write QA)
- Capturing visual references for implementation guidance
- Comparing implemented UI against the original design
- Inspecting individual sections for cropped text or overlapping elements

**Workflow:**

1. Call `get_screenshot` with the node ID (or file key + node ID).
2. Inspect the screenshot for:
   - Cropped or clipped text
   - Overlapping elements
   - Placeholder text that was not overridden
   - Wrong component variants
   - Missing images or blank frames
3. Screenshot individual sections (by node ID), not just full pages. Full-page
   screenshots at reduced resolution hide details.

**Best practices:**

- Take section-level screenshots after each `use_figma` build step
- Take a full-page screenshot for final validation
- Use screenshots alongside `get_metadata` for comprehensive QA

### get_metadata — Structural Analysis

**Inspect the structural details of a Figma node or file.**

Returns hierarchy, counts, node types, property definitions, and
structural relationships.

**When to use:**

- Understanding file structure before making modifications
- Verifying that `use_figma` created the correct hierarchy
- Checking component property definitions and variant names
- Counting nodes, pages, or components in a file
- Debugging layout issues (wrong parent, missing children)

**Workflow:**

1. Call `get_metadata` with the node ID.
2. Inspect the output for:
   - Node types and hierarchy (is the tree structure correct?)
   - Child counts (are all expected elements present?)
   - Component property definitions (what TEXT/VARIANT/BOOLEAN props exist?)
   - Variant names (do they match expected patterns?)
   - Auto-layout settings (direction, padding, gap)

### search_design_system — Component and Token Discovery

**Search across all linked libraries for components, variables, and styles.**

**When to use:**

- Before building screens — discover which components are available
- Before creating tokens — check if matching variables already exist
- Auditing design system coverage for a feature
- Finding the correct component key for `importComponentSetByKeyAsync()`

**Workflow:**

1. **Search broadly with multiple terms.** Libraries use inconsistent naming.
   Try synonyms and partial terms:
   - Components: "button", "input", "nav", "card", "accordion", "avatar",
     "toggle", "icon", "tag"
   - Colors: "gray", "red", "blue", "brand", "background", "foreground",
     "surface", "text"
   - Spacing: "space", "radius", "gap", "padding"

2. **Use the right filters:**
   - `includeComponents: true` — focus on components
   - `includeVariables: true` — focus on variables/tokens
   - `includeStyles: true` — focus on text/effect styles

3. **Run multiple short queries in parallel** rather than one compound query.
   Different naming conventions mean broad queries miss items.

4. **Important:** `search_design_system` searches across ALL linked libraries,
   including remote/published ones. This is the correct tool for discovering
   library items. Do NOT rely on `getLocalVariableCollectionsAsync()` alone —
   it only returns local variables.

## Design-to-Code Workflow (Complete)

When translating a Figma design to code:

1. **Get the design context** — call `get_design_context` with the node.
2. **Capture a screenshot** — call `get_screenshot` for visual reference.
3. **Adapt to the project** — the output is React + Tailwind enriched with
   hints. Adapt to the actual stack.
4. **Map to existing components** — check the codebase for components that
   match the design. Reuse them.
5. **Map tokens** — design tokens show as CSS variables. Map to the project's
   token system.
6. **Follow Code Connect** — if Code Connect snippets are present, use the
   mapped codebase component directly.
7. **Follow annotations** — designer notes, constraints, and instructions
   override generic code output.

## Validation Workflow (Post-Implementation QA)

When validating that implemented UI matches the original design:

1. **Capture screenshot of the Figma source** — `get_screenshot` on the
   original design node.
2. **Compare visually** against the running application or component.
3. **Check structural alignment** — `get_metadata` on the source to understand
   component hierarchy, then compare against the implemented component tree.
4. **Flag deviations** — categorize as CRITICAL (wrong layout, missing
   sections), MINOR (spacing, color shade), or ACCEPTABLE (framework-specific
   rendering differences).

## Anti-Patterns

| Anti-Pattern                                       | Why                                   | Do This Instead                                    |
| -------------------------------------------------- | ------------------------------------- | -------------------------------------------------- |
| Treating `get_design_context` output as final code | It's a reference, not production code | Adapt to the project's stack and conventions       |
| Only screenshotting full pages                     | Hides detail-level issues             | Screenshot individual sections by node ID          |
| Concluding "no variables" from local-only check    | Misses library variables              | Use `search_design_system` with `includeVariables` |
| Single search query for components                 | Libraries use inconsistent naming     | Run multiple queries with synonyms                 |
| Fabricating file keys or node IDs                  | Causes tool errors                    | Always parse from user-provided URL                |
| Skipping `whoami` check                            | May call tools with no connection     | Always verify connection first                     |

## Cross-References

- For creating new Figma files → `figma-file-creation`
- For writing to Figma (components, tokens, layouts) → `figma-use`
- For design token values and UI system consistency → `design-system`
- For component specs and visual artifacts → `product-designer`
- For legacy figma-pilot syntax → `figma-pilot` (historical reference only)
