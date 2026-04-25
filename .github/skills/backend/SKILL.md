---
name: "backend-firebase"
description: "Backend knowledge for Firebase — Firestore data modeling, Firebase Auth, Cloud Functions, security rules, real-time listeners, Emulator Suite testing, Hosting deployment, and cost optimization. Use when building serverless apps on Firebase, writing Firestore security rules, configuring Cloud Functions triggers, or diagnosing Firebase billing."
agents:
  - "architecture.engineer"
  - "security.application"
  - "billing.stripe"
  - "engineering.implementation"
  - "data.synthetic"
  - "platform.pce"
---

# Firebase Backend Knowledge

Firebase is Google's serverless application platform. Choose Firebase when you need rapid prototyping, real-time data sync, built-in auth, and zero server management. It excels at mobile-first and real-time collaborative apps where Firestore's document model fits the access patterns.

## When to Use This Skill

- Designing Firestore document schemas and subcollection hierarchies
- Writing or auditing Firestore Security Rules
- Implementing Cloud Functions (HTTP, callable, triggers, scheduled)
- Configuring Firebase Auth providers and custom claims
- Setting up the Firebase Emulator Suite for local development
- Diagnosing cold starts, billing spikes, or performance issues
- Deploying to Firebase Hosting with rewrites and App Check

---

## Data Modeling

Firestore is a document-oriented NoSQL database. Design schemas around **query patterns**, not entity relationships.

### Document and Collection Design

- Store data close to where it is read — denormalization is expected
- Use subcollections for 1:N relationships where the child is always queried in context of the parent
- Use root-level collections when entities are queried independently
- Keep documents under 1 MB; aim for under 20 KB for read performance
- Use document references (`/users/{uid}`) for loose coupling between collections

### Composite Indexes

- Firestore auto-creates single-field indexes
- Create composite indexes for queries that filter or sort on multiple fields
- Define indexes in `firestore.indexes.json` and deploy with `firebase deploy --only firestore:indexes`
- Avoid over-indexing — each index costs storage and increases write latency

### Patterns

```
users/{uid}                          # User profile
users/{uid}/settings/{settingId}     # User-scoped settings (subcollection)
organizations/{orgId}                # Org root
organizations/{orgId}/members/{uid}  # Membership (subcollection)
organizations/{orgId}/projects/{pid} # Org-scoped projects
```

### Anti-Patterns

- Deeply nested subcollections (more than 2 levels) make cross-collection queries impossible
- Storing large arrays that grow unbounded — use subcollections instead
- Using sequential document IDs — causes hotspots in Firestore

---

## Authentication

Firebase Auth provides turnkey identity with multiple providers.

### Supported Providers

- Email/password, email link (passwordless)
- Google, GitHub, Microsoft, Apple, Twitter OAuth
- Phone (SMS OTP)
- Anonymous auth (upgrade later)
- SAML and OIDC for enterprise SSO

### Custom Claims for RBAC

- Set custom claims via Admin SDK: `auth.setCustomUserClaims(uid, { role: 'admin', orgId: 'org123' })`
- Claims propagate on next token refresh (force with `user.getIdToken(true)`)
- Keep claims payload under 1000 bytes
- Use claims in Security Rules: `request.auth.token.role == 'admin'`
- Common pattern: `{ role: 'owner' | 'admin' | 'member' | 'viewer', orgId: string }`

### Session Management

- Firebase Auth uses short-lived ID tokens (1 hour) with long-lived refresh tokens
- For server-side sessions, use `auth.createSessionCookie()` with configurable expiry
- Revoke refresh tokens with `auth.revokeRefreshTokens(uid)` on password change or account compromise

---

## Serverless Functions / API Layer

Cloud Functions for Firebase run on Google Cloud Functions (2nd gen recommended).

### Function Types

| Type | Trigger | Use Case |
| --- | --- | --- |
| `onRequest` | HTTP | REST endpoints, webhooks |
| `onCall` | Client SDK | Authenticated RPCs with auto-deserialization |
| `onDocumentCreated/Updated/Deleted` | Firestore | Data-driven workflows |
| `onSchedule` | Cron (Cloud Scheduler) | Periodic jobs, cleanups |
| `onObjectFinalized` | Cloud Storage | File processing pipelines |

### Cold Starts

- 2nd gen functions have lower cold start times than 1st gen
- Set `minInstances: 1` for latency-critical functions (costs more)
- Keep function bundles small — tree-shake dependencies
- Use lazy initialization for heavy SDKs

### Error Handling

- Throw `HttpsError` with appropriate codes for callable functions
- Use structured logging with `functions.logger` (not `console.log`)
- Implement idempotency for Firestore triggers — triggers can fire more than once
- Use `runWith({ timeoutSeconds, memory })` to control resource limits

### Middleware Patterns

- Validate auth in `onRequest` handlers: check `req.headers.authorization` bearer token
- Use `onCall` when possible — auth context (`context.auth`) is automatic
- Rate-limit with App Check enforcement or Cloud Armor

---

## Security

Firestore Security Rules are the primary access control mechanism.

### Rules DSL

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    match /organizations/{orgId} {
      allow read: if request.auth.token.orgId == orgId;
      match /projects/{pid} {
        allow read: if request.auth.token.orgId == orgId;
        allow write: if request.auth.token.role in ['admin', 'owner'];
      }
    }
  }
}
```

### Security Patterns

- Always validate `request.auth != null` before any read/write
- Use custom claims for org-scoped and role-based access
- Validate incoming data shape with `request.resource.data` assertions
- Restrict field-level writes: `request.resource.data.diff(resource.data).affectedKeys()`
- Never trust client-provided document IDs for authorization
- Use `get()` and `exists()` sparingly — each costs a read

### Common Vulnerabilities

- Open rules (`allow read, write: if true`) left from development
- Missing validation on document fields allows injection of unexpected data
- Not checking `request.auth.uid` allows cross-user data access
- Admin SDK bypasses rules — secure Cloud Functions with their own auth checks

---

## Real-Time

Firestore provides real-time listeners natively.

### Listener Patterns

- `onSnapshot` on documents or queries for live updates
- Use `where` + `orderBy` + `limit` to scope listeners — avoid listening to entire collections
- Detach listeners on component unmount to prevent memory leaks and unnecessary reads
- Use `snapshotMetadata.hasPendingWrites` to distinguish local optimistic writes from server-confirmed data

### Offline Support

- Firestore SDK caches data locally by default on mobile and web
- Writes queue offline and sync when connectivity returns
- Use `enablePersistence()` (web) or it is automatic (mobile SDKs)
- Set cache size limits to prevent unbounded local storage growth

---

## Testing

The Firebase Emulator Suite provides local emulation for Firestore, Auth, Functions, Storage, and Hosting.

### Emulator Setup

```bash
firebase init emulators
firebase emulators:start
```

### Test Patterns

- Use `@firebase/rules-unit-testing` for Security Rules tests
- Use `firebase-functions-test` for Cloud Functions unit tests
- Seed Firestore emulator with test data before each test run
- Test both allowed and denied access patterns in rules tests
- Run emulators in CI with `firebase emulators:exec "npm test"`

### Test Data Seeding

- Use Admin SDK against emulator to seed data (bypasses rules)
- Create factory functions for common document shapes
- Clear data between tests: `clearFirestoreData({ projectId })`
- Export/import emulator state for reproducible test fixtures

---

## Deployment

### Firebase CLI

```bash
firebase deploy                         # Deploy everything
firebase deploy --only firestore:rules  # Rules only
firebase deploy --only functions        # Functions only
firebase deploy --only hosting          # Hosting only
```

### Hosting

- Static hosting with global CDN
- Configure `firebase.json` rewrites to route SPAs or proxy to Cloud Functions
- Use preview channels for PR previews: `firebase hosting:channel:deploy pr-123`
- Enable App Check to protect backend resources from abuse

### CI/CD Integration

- Use `firebase-tools` in GitHub Actions with a service account token
- Store `FIREBASE_TOKEN` or use workload identity federation for keyless auth
- Run emulator tests in CI before deploying
- Use `--project` flag to target staging vs production

---

## Cost Optimization

Firebase bills per operation — reads, writes, deletes, bandwidth, and function invocations.

### Pricing Model

| Resource | Cost Driver |
| --- | --- |
| Firestore reads | Per document read |
| Firestore writes | Per document write |
| Firestore deletes | Per document delete |
| Bandwidth | Egress beyond free tier |
| Cloud Functions | Invocations + compute time (GB-seconds) |
| Auth | Free for most providers; phone auth costs per SMS |

### Common Cost Traps

- Unbounded `onSnapshot` listeners on large collections generate massive read counts
- Firestore triggers that write back to the same document create infinite loops (and infinite cost)
- Not using pagination — reading 10,000 documents when you display 20
- Cloud Functions with high memory allocation sitting idle (use `minInstances` wisely)
- Storing files in Firestore instead of Cloud Storage

### Optimization Patterns

- Use `select()` to return only needed fields (still 1 read, but less bandwidth)
- Aggregate data in Cloud Functions and store summaries to avoid client-side aggregation reads
- Use Firestore Bundles for cacheable query results
- Cache frequently-read documents in CDN or client-side
- Set billing alerts and budget caps in Google Cloud Console

---

## Common Pitfalls

1. **Modeling relational data in Firestore** — Firestore is not SQL. Do not normalize. Denormalize around read patterns
2. **Ignoring composite index limits** — 200 composite indexes per database. Plan index strategy early
3. **Not handling offline state** — Firestore queues writes offline, but UI must handle pending states gracefully
4. **Trigger loops** — A Firestore trigger that writes to the document it listens to creates an infinite loop. Use sentinel fields or conditional checks
5. **Large batch operations** — Firestore batches are limited to 500 operations. Use `bulkWriter` for large imports
6. **Security rules complexity** — Deeply nested rules become unreadable. Extract helper functions with `function` keyword in rules DSL
7. **Cold start latency** — First function invocation after idle period is slow. Use 2nd gen functions and warmup strategies
8. **Not scoping listeners** — Listening to root collections without filters reads every document on every change
9. **Storing timestamps as strings** — Use Firestore `Timestamp` type for queries and ordering
10. **Ignoring the Emulator Suite** — Testing against production Firestore is slow, costly, and risks data corruption
