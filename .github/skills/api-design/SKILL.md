---
name: API Design
description: >
  REST and GraphQL API design patterns — resource modeling, versioning, pagination,
  error contracts, idempotency, rate limiting, and HTTP semantics. Use when designing
  new API surfaces, refactoring existing endpoints, or reviewing API contracts.
agents: ["engineering.implementation", "architecture.engineer", "quality.code-review"]
tags: [api, rest, graphql, http, versioning, contracts, backend]
---

# API Design

Pragmatic guidance for designing APIs that are predictable, evolvable, and safe to consume.

## Core Principles

1. **Contracts first** — Define request/response shapes before implementation. Use OpenAPI/JSON Schema for REST, SDL for GraphQL.
2. **Resources, not verbs** — Model nouns (`/orders/:id/items`), let HTTP methods carry the verb.
3. **Evolve, don't break** — Additive changes only in stable versions. Breaking changes require a new version.
4. **Errors are a contract** — Error response shape is part of the API. Document it with the same rigor as success responses.
5. **Idempotency by default** — Design mutations so clients can safely retry. `PUT`, `DELETE` naturally idempotent; `POST` needs an `Idempotency-Key` header for critical operations.

## REST Resource Modeling

### URL structure

```
GET    /users                  # list
POST   /users                  # create
GET    /users/:id              # read one
PATCH  /users/:id              # partial update
DELETE /users/:id              # delete
GET    /users/:id/orders       # nested collection (only 1 level deep)
```

**Rules:**
- Use plural nouns for collections (`/users`, not `/user`)
- Use kebab-case for multi-word resources (`/user-profiles`)
- Nest at most one level deep — prefer `?userId=123` query params over `/users/:id/orders/:orderId/items`
- Avoid action endpoints (`/users/:id/activate`) unless the operation is genuinely non-CRUD — prefer `PATCH /users/:id { "status": "active" }`

### HTTP methods and status codes

| Method | Success | Client Error | Server Error |
|--------|---------|--------------|--------------|
| GET    | 200 OK  | 404 Not Found, 400 Bad Request | 500, 503 |
| POST (create) | 201 Created + Location header | 400, 409 Conflict, 422 Unprocessable | 500 |
| PUT / PATCH | 200 OK or 204 No Content | 400, 404, 409, 422 | 500 |
| DELETE | 204 No Content | 404, 409 | 500 |

**Never return 200 OK with an error body.** Use the correct status code.

## Versioning

Prefer **URL path versioning** for public APIs: `/v1/users`, `/v2/users`.

- Clear, cacheable, easy to debug
- Header versioning (`Accept: application/vnd.api+json;version=2`) is cleaner but harder for consumers
- Never version with query params (`?version=2`) — breaks caching

**When to bump versions:**
- Removing a field from a response
- Changing a field's type or semantics
- Making an optional request field required
- Changing an error code's meaning

**Safe additive changes (no version bump):**
- Adding new optional request fields
- Adding new response fields (clients must ignore unknown fields)
- Adding new endpoints
- Adding new optional headers

## Pagination

**Default: cursor-based pagination.** Offset-based breaks under concurrent writes and is O(n) on most databases.

```json
GET /orders?limit=50&cursor=eyJpZCI6MTIzNH0

{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTI4NH0",
    "hasMore": true
  }
}
```

**Rules:**
- Server decides max `limit` (cap at 100 or 200)
- Cursors are opaque to clients — base64-encode a JSON blob containing the sort key
- Return `nextCursor: null` or omit it when exhausted
- Include `hasMore` for clarity

## Error Contracts

Use a consistent error envelope across all endpoints:

```json
{
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email format is invalid",
    "field": "email",
    "requestId": "req_abc123"
  }
}
```

- `code` is a stable machine-readable string (SCREAMING_SNAKE_CASE). Clients switch on this, not on `message`.
- `message` is human-readable, safe to display to end users only for 4xx errors.
- `field` (optional) scopes validation errors to a specific input.
- `requestId` echoes the request trace ID for support.
- For 422 validation errors with multiple issues, return an array:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "issues": [
      { "field": "email", "code": "INVALID_FORMAT" },
      { "field": "age", "code": "OUT_OF_RANGE" }
    ]
  }
}
```

## Idempotency

For any non-GET request that creates resources or transfers value (payments, emails, bookings), require an `Idempotency-Key` header:

```
POST /payments
Idempotency-Key: 7f3a9b2c-...
```

Server stores `(key, response)` for 24h. Repeated requests with the same key return the cached response, not a duplicate action.

## Rate Limiting

Return `429 Too Many Requests` with headers:

```
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1699564800
Retry-After: 60
```

Always include `Retry-After`. Clients that respect it avoid thundering-herd retries.

## GraphQL Specifics

- **One endpoint, one method**: `POST /graphql`. No REST mixing.
- **Nullable fields** are the default for forward compatibility. Make fields `NonNull!` only when removal would be a breaking change.
- **Pagination**: use Relay Cursor Connections (`edges`, `pageInfo`, `cursor`).
- **Errors**: business errors go in the `errors` array OR as typed union results (`UserResult = User | NotFoundError`). Don't conflate with HTTP 500s.
- **Avoid deep nesting**: max 5-7 levels. Use dataloaders to prevent N+1.

## Authentication

- **Bearer tokens** in `Authorization: Bearer <token>` header. Never in query params (they leak to logs).
- **401 Unauthorized** = no/invalid credentials. **403 Forbidden** = valid credentials, insufficient permission.
- Rotate tokens regularly; support refresh tokens for long-lived sessions.
- For service-to-service, prefer mTLS or signed requests over long-lived API keys.

## Anti-patterns to avoid

- **Chatty endpoints**: requiring 3 round-trips to render one screen. Design endpoints around client needs, not normalized database tables.
- **Batch endpoints** that accept arrays without per-item error handling. Return a result array with `{success, error}` per item.
- **Stringly-typed enums** without an enum contract. Document allowed values in the schema.
- **Mutating GETs**. Never. GET must be safe and idempotent.
- **Returning IDs without hints**. Include `type` or embed sub-objects so clients don't need a second fetch to understand what the ID refers to.

## Review checklist

- [ ] All endpoints have documented OpenAPI/SDL schemas
- [ ] Error envelope is consistent across every endpoint
- [ ] Pagination uses cursors, not offsets
- [ ] Mutations have idempotency support where duplicates would cause harm
- [ ] Rate limits are documented and return proper headers
- [ ] Versioning strategy is clear and documented
- [ ] No PII in URLs, headers logs, or error messages
- [ ] Deprecation path exists for every endpoint (Sunset header, docs)
