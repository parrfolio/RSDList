---
description: "Generate or update API documentation, README, and architecture docs"
agent: "conductor.powder"
---

# Generate Documentation

You are creating or updating project documentation.

## Context

Use @conductor.powder to orchestrate:

1. **@architecture.exploration** — Explore codebase for documentation targets
2. **@engineering.implementation** — Write/update documentation files
3. **@quality.code-review** — Review documentation accuracy

## Documentation Types

### README.md

- Project name and description
- Quick start guide (install → configure → run)
- Tech stack overview
- Project structure
- Available scripts/commands
- Environment variables
- Contributing guidelines
- License

### API Documentation

- Endpoint/function name and description
- Request parameters (with types and validation rules)
- Response format (with examples)
- Error codes and messages
- Authentication requirements
- Rate limits
- Usage examples

### Architecture Documentation

- System overview with diagrams
- Component relationships
- Data flow diagrams
- Technology decisions and rationale
- Security architecture
- Deployment architecture

### CHANGELOG.md

- Semantic versioning (MAJOR.MINOR.PATCH)
- Sections: Added, Changed, Deprecated, Removed, Fixed, Security
- Link to PRs/issues

## Documentation Rules

- Keep code examples compilable and up-to-date
- Use consistent formatting across all docs
- Auto-update docs when code changes (per update-docs-on-code-change instruction)
- API docs must match actual implementation (verified by quality.code-review)

## Instructions

1. Explore codebase to identify what needs documentation (architecture.exploration)
2. Generate/update the requested documentation
3. Include code examples where appropriate
4. Verify accuracy against actual codebase (quality.code-review)

## User Input

{{input}}
