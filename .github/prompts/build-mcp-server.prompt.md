---
description: "Build an MCP server with tools, resources, and prompts using TypeScript SDK"
agent: "conductor.powder"
---

# Build MCP Server

You are building a Model Context Protocol (MCP) server using the TypeScript SDK.

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.context** — Research MCP SDK documentation
2. **@engineering.implementation** — Implement the server with TDD
3. **@quality.code-review** — Code review

## MCP Server Stack

- **SDK**: `@modelcontextprotocol/sdk` (latest)
- **Language**: TypeScript strict
- **Validation**: Zod 3
- **Transport**: `StreamableHTTPServerTransport` (HTTP) or stdio

## MCP Concepts

| Concept       | Purpose                   | Example                             |
| ------------- | ------------------------- | ----------------------------------- |
| **Tools**     | Actions AI can perform    | `createUser`, `searchDocs`          |
| **Resources** | Data AI can read          | `users://list`, `config://settings` |
| **Prompts**   | Reusable prompt templates | `summarize`, `analyze-code`         |

## Implementation Standards

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "my-server",
  version: "1.0.0",
});

// Register a tool with title, schema, and handler
server.registerTool(
  "tool-name",
  {
    title: "Tool Display Name",
    description: "What this tool does",
    inputSchema: { param: z.string().describe("Parameter description") },
  },
  async ({ param }) => {
    // Implementation
    return { content: [{ type: "text", text: "result" }] };
  },
);
```

## Security Requirements

- DNS rebinding protection for local servers
- Input validation on ALL tool parameters (Zod)
- Error results use `isError: true`
- New `StreamableHTTPServerTransport` per HTTP request
- No credentials in responses unless explicitly needed

## Instructions

1. Research MCP SDK documentation (architecture.context)
2. Define the server's tools, resources, and prompts
3. Write tests for each tool handler
4. Implement the server:
   - `McpServer` initialization
   - `registerTool()` for each tool
   - `registerResource()` for each resource
   - `registerPrompt()` for each prompt
   - `completable()` for UX completions
5. Set up transport (HTTP or stdio)
6. Test with MCP Inspector
7. Code review (quality.code-review)
8. Document available tools/resources/prompts

## User Input

The MCP server I need: {{input}}
