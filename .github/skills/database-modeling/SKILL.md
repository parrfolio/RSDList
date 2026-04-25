---
name: Database Modeling
description: >
  Database schema design patterns for SQL and NoSQL — normalization, indexing,
  relationships, denormalization tradeoffs, Firestore document modeling,
  migrations, and query optimization. Use when designing new data models,
  refactoring schemas, or diagnosing query performance issues.
agents: ["engineering.implementation", "architecture.engineer", "quality.code-review"]
tags: [database, schema, firestore, sql, postgres, indexing, migrations]
---

# Database Modeling

Schema design for SQL (PostgreSQL) and document stores (Firestore, MongoDB). The goal: queries you need to run should be cheap; queries you don't need should be impossible or expensive-on-purpose.

## Core Principles

1. **Model queries, not entities** — Start from the access patterns. Schema serves the queries, not the other way around.
2. **Normalize for writes, denormalize for reads** — Default to normalized. Denormalize only when a specific query pattern demands it and you can keep copies consistent.
3. **Every field earns its place** — Nullable, optional, and "just in case" fields are technical debt. Delete them.
4. **Indexes are contracts** — An index is a promise about query shape. Breaking the index breaks the query.
5. **Migrations are code** — Version-controlled, reversible where possible, tested in a staging environment before production.

## SQL (PostgreSQL) Schema Design

### Column types

| Use Case | Type | Notes |
|----------|------|-------|
| Primary key | `uuid` (preferred) or `bigserial` | UUIDs are globally unique, safe to expose, no enumeration |
| Short text | `text` (never `varchar(n)` unless enforcing limit) | Postgres stores them identically |
| Timestamps | `timestamptz` | Always. Never `timestamp` without timezone |
| Money | `numeric(19,4)` | Never `float` / `real` for currency |
| Enums | `text` + CHECK constraint, or native `enum` | Native enum is faster but harder to add values to |
| JSON blobs | `jsonb` | Never `json`. `jsonb` is indexable and validated |

### Constraints

Enforce invariants at the schema level, not just the application:

```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_cents bigint NOT NULL CHECK (total_cents >= 0),
  status text NOT NULL CHECK (status IN ('pending','paid','cancelled','refunded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Always include:**
- `NOT NULL` on every column that shouldn't be null (default)
- `REFERENCES` with explicit `ON DELETE` behavior (`CASCADE`, `SET NULL`, or `RESTRICT`)
- `CHECK` constraints for value ranges and enum values
- `created_at` and `updated_at` on every mutable table
- Unique constraints on any field that should be unique (email, slug)

### Indexing

**The rule: every query in a hot path has an index that covers its WHERE + ORDER BY.**

```sql
-- Query: SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50;
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- Query: SELECT * FROM users WHERE email = $1;
CREATE UNIQUE INDEX idx_users_email ON users (email);

-- Query: SELECT * FROM events WHERE payload->>'type' = 'signup';
CREATE INDEX idx_events_type ON events ((payload->>'type'));
```

**Rules:**
- Multi-column index: order matters. Most selective (usually the equality predicate) first, then range/sort fields.
- `EXPLAIN ANALYZE` every slow query. If it says "Seq Scan" on a large table, add an index.
- Don't index everything. Each index costs write throughput and disk.
- Partial indexes are powerful: `CREATE INDEX ON orders (user_id) WHERE status = 'pending'`.

### Relationships

- **One-to-many**: foreign key on the "many" side. `orders.user_id -> users.id`.
- **Many-to-many**: junction table with composite primary key. Name it after the relationship (`user_roles`, not `users_roles`).
- **One-to-one**: foreign key + unique constraint on the "owns" side. Consider if you really need it — often just a column on the parent table.
- **Polymorphic**: avoid. If unavoidable, use separate FKs (`comment.post_id`, `comment.issue_id`) with a CHECK that exactly one is set.

## Firestore Document Modeling

Firestore is NOT a relational database. The rules are different.

### Collection structure

```
/users/{userId}
  - email: string
  - name: string
  - createdAt: timestamp

/users/{userId}/orders/{orderId}      ← subcollection, scoped to user
  - total: number
  - status: string
  - items: [{ sku, qty, priceCents }]  ← embedded array
```

**Subcollections:**
- Use for strong 1:many ownership (orders belong to user, user owns them).
- Documents in a subcollection are independent — you pay read cost per doc.
- You cannot query across subcollections by default — use `collectionGroup('orders')` for cross-user queries.

**Top-level collections:**
- Use for independent entities queried directly (`/products`, `/events`).
- Use for many:many (no ownership) — don't subcollection-nest.

### Denormalization

Firestore has no JOINs. If you need data from two collections on one screen, denormalize:

```typescript
// Document in /posts/{postId}
{
  title: "...",
  authorId: "user_123",
  authorName: "Alice",        // denormalized
  authorAvatar: "https://...", // denormalized
  createdAt: ...
}
```

**Rules:**
- Denormalize fields that rarely change (display name, avatar).
- Keep a source of truth in `/users/{userId}`.
- Use a Cloud Function to propagate updates: when `/users/{userId}` changes, update all `/posts` with `authorId == userId`.
- Accept eventual consistency for denormalized data.

### Document size limits

- Max 1 MiB per document.
- Max 20,000 fields per document.
- Arrays are fine for small bounded lists (< 100 items). For unbounded lists, use a subcollection.

### Composite indexes

Any query with multiple `where` + `orderBy` needs a composite index. Firestore will tell you in an error the first time you run it — copy the URL it gives you.

## Migrations

### SQL migrations

- Use a migration tool: Prisma Migrate, Flyway, Atlas, or plain SQL files in `migrations/NNNN_description.sql`.
- Every migration has an `up` and a `down` (if reasonably possible).
- Never modify a migration after it's been run in any environment. Add a new one.
- Test migrations against a production-sized snapshot before running in prod.
- For large tables: add columns with `DEFAULT NULL`, backfill in batches, then add `NOT NULL`. Never `ALTER TABLE foo ADD COLUMN bar NOT NULL DEFAULT ...` on a billion-row table.

### Firestore migrations

- Firestore is schemaless — "migration" means backfilling existing docs.
- Write a one-off script that pages through the collection and updates each doc. Run in small batches (500 writes/sec soft limit).
- Make application code tolerant of both old and new shapes during rollout.

## Query optimization

1. **Measure first**: `EXPLAIN ANALYZE` (Postgres), Firestore Query Explain (`explainOptions: "analyze"`).
2. **N+1 queries**: fix with `JOIN` (SQL) or batch reads / dataloaders (Firestore).
3. **Over-fetching**: select only the columns you need.
4. **Unbounded queries**: every list query needs a `LIMIT` or pagination cursor.
5. **Full-text search**: use `tsvector` + GIN index (Postgres) or a dedicated service (Algolia, Typesense) for Firestore.

## Review checklist

- [ ] Schema models the actual query patterns, not an idealized domain
- [ ] Every NOT NULL / CHECK / REFERENCES constraint in place
- [ ] Every hot query has a covering index
- [ ] Timestamps on every mutable table (`created_at`, `updated_at`)
- [ ] Foreign key ON DELETE behavior is explicit
- [ ] No unbounded list queries (every has LIMIT/cursor)
- [ ] Firestore denormalization has a Cloud Function keeping it consistent
- [ ] Migrations are reversible or have documented recovery steps
- [ ] Large table migrations tested on production-sized snapshot
