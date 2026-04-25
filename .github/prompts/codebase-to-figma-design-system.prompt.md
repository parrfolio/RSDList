description: "Capture a running localhost app into Figma, then extract tokens, components, patterns, and all layouts"

## Codebase to Figma Design System

## Intro

Capture the currently running localhost app into Figma first, then turn that
captured application into a structured design system in the same Figma file.
The running app is the primary source of truth. Use code and routing files only
to discover routes, confirm states, and extract system structure that is
already implemented.

This prompt is broader than `capture-app-to-figma`. That prompt is the narrower
screen-capture workflow. This prompt must capture the live app and then build
out the full design-system structure from the captured result, including tokens,
primitives, components, patterns, layouts, and screens.

## Prerequisites

Before starting, verify all of the following:

- [ ] Call `figma/whoami` first to confirm the Figma MCP server is connected
- [ ] The application is currently running on localhost and reachable in a
      browser
- [ ] A destination Figma file exists, or create one with
      `figma/create_new_file`
- [ ] The app's route discovery sources are available from the running app,
      the codebase routing configuration, or both
- [ ] You understand whether the user wants a new Figma file or an existing
      file updated

If `figma/whoami` fails, STOP and tell the user.

If the localhost app is not running or is not reachable, STOP and tell the
user.

## Source of Truth

- The currently running localhost app is the primary source of truth
- Use `figma/generate_figma_design` to capture what the app actually renders
- Use the codebase and routing configuration to discover reachable routes,
  clarify layout relationships, and extract tokens and reusable structure that
  the running app already expresses
- Keep all captured screens in the Figma file as layouts, artboards, or pages;
  do not reduce the result to a few representative examples
- Do not invent hidden routes, states, variants, or patterns that cannot be
  justified from the running app or code
- When something is missing, blocked, or non-inferable, report the gap instead
  of fabricating an answer

## Workflow

1. Verify Figma access and destination

   - Call `figma/whoami` first
   - If the user did not provide a target Figma file, create a new design file
     with `figma/create_new_file`
   - Use one destination Figma file for both the captures and the design-system
     buildout

2. Discover routes, pages, and screen states

   - Inventory all reachable routes and primary screens from the running app
   - Read router configuration, route manifests, file-based routing folders, or
     equivalent code paths to confirm coverage
   - Identify layouts, nested routes, auth-gated areas, modal flows, tabs, and
     meaningful state-dependent screens that are actually reachable
   - Report any blocked routes or prerequisites needed to access them

3. Capture every reachable screen with live capture

   - For every reachable route or screen, call `figma/generate_figma_design`
   - Capture all reachable pages, layouts, and major screen states into the
     same Figma file
   - Preserve each captured result as a layout, artboard, or page in Figma
   - Do not collapse the output down to representative coverage only

4. Verify capture quality as you go

   - After each capture or small capture batch, verify the result before moving
     on
   - Confirm the screen is complete, legible, and corresponds to the actual app
   - Retry or note gaps when a route fails, a screen is incomplete, or a state
     cannot be reached
   - Keep a running coverage list so no reachable screen is skipped silently

5. Extract the design-system structure from the captured app

   - After capture coverage is established, use `figma/use_figma` in the same
     Figma file to extract and organize the app's design system
   - Create token collections and variables for colors, typography, spacing,
     radius, shadows, borders, motion, and layout scales when supported by the
     app and code
   - Extract primitives such as buttons, inputs, icons, avatars, badges, and
     structural shells
   - Create reusable components and component sets from recurring captured UI
   - Extract higher-level patterns such as headers, navigation, cards, forms,
     tables, filters, dialogs, and empty states
   - Preserve layouts and screen-level compositions as distinct design assets,
     not just as component fragments

6. Organize the Figma file section by section

   - Create and maintain clear Figma pages such as `Tokens`, `Primitives`,
     `Components`, `Patterns`, `Layouts`, and `Screens`
   - Move each extracted asset type onto the correct page as it is completed
   - Keep naming aligned with the product and codebase where practical

7. Work incrementally and verify each section before continuing

   - Complete one page or section at a time
   - Verify `Tokens` before `Primitives`
   - Verify `Primitives` before `Components`
   - Verify `Components` before `Patterns`
   - Verify `Patterns`, `Layouts`, and `Screens` before declaring completion
   - Report unresolved gaps at the section where they appear instead of hiding
     them until the end

## Rules

- Always treat the currently running localhost app as the primary source of
  truth
- Always call `figma/whoami` before any Figma file creation, capture, or edits
- Always discover routes from the running app and-or the codebase routing
  configuration before capture begins
- Always use `figma/generate_figma_design` to capture reachable routes, pages,
  screens, and layouts
- Always keep captured screens in Figma as layouts, artboards, or pages
- After capture, always use `figma/use_figma` to extract token collections,
  variables, primitives, components, component sets, patterns, layouts, and
  screen organization in the same Figma file
- Work incrementally and verify one capture batch or one Figma page at a time
- Do not invent hidden states, tokens, or routes that are not inferable from
  the running app or the code
- When the live app and code disagree, treat the running app as primary and
  report the mismatch
- This prompt is not limited to capture; it must build a usable design-system
  structure from the captured application

## Gate

The workflow is PASS when:

- [ ] `figma/whoami` was called successfully before any Figma work
- [ ] The localhost application was used as the primary source of truth
- [ ] Reachable routes and screens were discovered from the running app,
      routing config, or both
- [ ] All reachable routes, pages, screens, and layouts were captured using
      `figma/generate_figma_design`
- [ ] Capture quality was verified incrementally as the workflow progressed
- [ ] Captured screens remain in the Figma file as layouts, artboards, or pages
- [ ] `figma/use_figma` was used after capture to build `Tokens`, `Primitives`,
      `Components`, `Patterns`, `Layouts`, and `Screens`
- [ ] Token collections or variables were created from inferable app structure
- [ ] Reusable primitives, components, and component sets were extracted and
      organized
- [ ] Patterns and layouts were extracted and organized
- [ ] Gaps, blocked routes, or non-inferable states were reported instead of
      invented

## User Input

{{input}}