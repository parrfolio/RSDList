## Phase 1 Complete: Data Model, Types & Firestore Rules

Established the foundation for the Share List feature: Zod-validated ShareInfo type, extended User type with sharing fields, and hardened Firestore security rules with field-level validation.

**Files created/changed:**

- src/types/sharedList.ts (created)
- src/types/user.ts (modified)
- src/types/index.ts (modified)
- firestore.rules (modified)

**Functions created/changed:**

- ShareInfoSchema (Zod schema with shareId, uid, ownerName, listName, timestamps)
- ShareInfo type export
- User type extended with shareId (nullable) and sharingEnabled (boolean)
- isSharingEnabled(uid) Firestore helper function

**Tests created/changed:**

- N/A (Firestore rules tested via manual rule validation; types validated by TypeScript build)

**Review Status:** APPROVED with minor hardening applied (hasOnly field validation on shares create/update)

**Git Commit Message:**

```
feat: share list data model, types, and Firestore rules

- Add ShareInfo Zod schema and type (sharedList.ts)
- Extend User type with shareId and sharingEnabled fields
- Add /shares collection rules with public read access
- Add isSharingEnabled() helper for conditional wants read
- Harden shares create/update with field-level validation
- Install nanoid v5.1.6 for share ID generation
```
