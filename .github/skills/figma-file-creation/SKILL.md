---
name: figma-file-creation
description: Official Figma MCP workflow for creating new Figma Design and FigJam files, choosing the correct team or organization plan, and bootstrapping a fresh Figma draft before writing components, tokens, or full view frames. Use when asked to create a new Figma file from scratch, start a design library, open a new FigJam board, or send a new app or feature into a fresh Figma file via the official Figma MCP.
metadata:
  tags: figma, mcp, file-creation, figjam, design-system, bootstrap
agents: ["frontend.design-system", "design.visual-designer"]
---

# Figma File Creation

Use this skill when the task is specifically about creating a brand-new Figma
file through the official Figma MCP. This skill is for file creation and
bootstrap workflow, not legacy figma-pilot scripting.

## When to Use

Use this skill when any of the following are true:

- The user asks to create a new Figma Design file or FigJam board.
- A design workflow needs a blank draft before components or screens are added.
- A feature needs its own dedicated Figma file instead of writing into an
  existing file.
- A design-system audit or visual-design task needs a fresh destination file
  for synced artifacts.

Do not use this skill when the user already provided an existing Figma file URL
and wants updates inside that file. In that case, work in the existing file
with the normal official Figma MCP flow.

## Required Tools

This skill assumes use of the official Figma MCP tools:

- `figma/whoami`
- `figma/create_new_file`
- `figma/use_figma`
- `figma/generate_figma_design`

## Mandatory Workflow

### 1. Verify Connection First

- Always call `figma/whoami` before attempting file creation.
- If the MCP is not connected, stop and tell the user to start or authenticate
  the `figma` MCP server.
- Never guess whether Figma is connected.

### 2. Resolve the Correct `planKey`

`figma/create_new_file` requires a `planKey`.

- If the user already provided a `planKey`, use it directly.
- Otherwise, read the available plans from `figma/whoami`.
- If exactly one plan is available, use its `key`.
- If multiple plans are available, ask the user which team or organization to
  use.
- Never invent a `planKey`.

### 3. Choose the Correct File Type

- Use `editorType: "design"` for product UI, component libraries, tokens,
  screens, and implementation handoff.
- Use `editorType: "figjam"` for workshops, mapping sessions, whiteboards,
  flows, or brainstorming boards.
- If the user does not specify which one they want and the intent is unclear,
  ask.

### 4. Name the File Deliberately

Good names are specific and reusable.

Preferred patterns:

- `<Product> Design System`
- `<Product> App Shell`
- `<Feature> Exploration`
- `<Feature> Flow Workshop`
- `<Project> Component Library`

Avoid vague names such as `New File`, `Untitled`, or `Test` unless the user
explicitly asked for a temporary draft.

### 5. Report the Result Clearly

After creation, report all of the following:

- file name
- file type (`design` or `figjam`)
- team or organization used
- returned file key
- returned file URL
- recommended next step

## After File Creation

Creating the file is only the bootstrap step. After the file exists:

- Use `figma/use_figma` when you need to create or edit frames, components,
  variants, variables, styles, or layout structure.
- Use `figma/generate_figma_design` when the task is to send a live UI or a
  generated screen into Figma as design layers.
- If the file is meant to mirror code artifacts, keep icon-library parity with
  the codebase and preserve token naming consistency.

If the file is being created to faithfully mirror a running localhost app or live web app, the next step is fail-closed:

- Verify the app is reachable and target routes/states can be exercised.
- Use `figma/generate_figma_design` as the authoritative first step for each reachable route/state.
- Use `figma/use_figma` only after capture for cleanup, token sync, component organization, variants, and structural edits.
- Do NOT reconstruct finished screens from code or memory when live capture is available.
- If localhost is unavailable or the Figma MCP is not connected, return BLOCKED rather than fabricating substitute screens.

## Decision Rules

| Situation                                                | Action                                                                                       |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| User wants a blank file only                             | Create the file and stop after reporting key and URL                                         |
| User wants a new design-system destination               | Create a `design` file, then seed tokens/components                                          |
| User wants a workshop board                              | Create a `figjam` file                                                                       |
| User supplied an existing Figma URL                      | Do not create a new file unless they explicitly ask                                          |
| Multiple Figma plans are available                       | Ask which plan to use before creating anything                                               |
| User wants the real running app mirrored in the new file | Create the file, then capture with `generate_figma_design` before any `use_figma` refinement |

## Anti-Patterns

- Never skip `figma/whoami` before file creation.
- Never fabricate `planKey`, file key, or file URL.
- Never create duplicate drafts as retries without telling the user.
- Never create a new file when the user asked to modify an existing file.
- Never leave the result ambiguous; always report what was created and where.
- Never rebuild a live running app screen from code alone when `generate_figma_design` capture is available.

## Output Template

Use this structure when reporting success:

```text
FIGMA FILE CREATED
- Name: <file name>
- Type: <design|figjam>
- Team/Org: <plan name>
- File Key: <file key>
- URL: <figma url>
- Next Step: <what should happen next>
```

## Cross-References

- For writing to Figma (components, tokens, layouts, screens) → `figma-use`
- For reading existing designs → `figma-read-design`
- For design token rules and UI system consistency → `design-system`
- For visual artifact planning and component specs → `product-designer`
- For legacy figma-pilot syntax → `figma-pilot` (historical reference only)
