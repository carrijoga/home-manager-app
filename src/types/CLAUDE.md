# src/types/CLAUDE.md

**Layer 2 of the type system** — Frontend-only types and enums that represent the app's domain model. These are derived from (but richer than) `src/schemas/` API contracts.

## index.ts

### Enums

**Business domain enums:**
- `Priority` — task priority (`alta`, `média`, `baixa`)
- `ApiPriority` — numeric API priority levels (0-3)
- `ApiCategory` — task category enum (Geral, Limpeza, etc.)
- `ModuleId` — route identifiers (DASHBOARD, TASKS, SHOPPING, etc.)
- `FutureItemStatus` — purchase status (planned, purchased)

**Why both `Priority` and `ApiPriority`?**
The backend uses numeric enums; the frontend displays them as strings. Both exist to bridge the two representations.

### Type Aliases and Interfaces

App-specific interfaces that extend or transform API schemas:

```ts
export type AppUser = {
  id: string
  name: string
  email: string
  // ... more fields from the User schema
}

export type Task = {
  id: string
  title: string
  priority: Priority
  dueDate?: Date
  // ... richer than the raw API Task schema
}
```

### Transformation Functions

Functions that convert API types to app types:

```ts
export function userProfileToAppUser(profile: UserSchema): AppUser {
  return {
    id: profile.id,
    name: profile.fullName,
    // ... map and transform fields
  }
}
```

Use these inside **services** after `Schema.safeParse()` succeeds, so **components always work with app types**, never raw schema types.

## Schema vs. Type Distinction

| Layer | File | What | Who Uses | When |
|-------|------|------|----------|------|
| 1 (API contract) | `src/schemas/` | Raw API shape as Zod | Services | After fetch, before transform |
| 2 (App domain) | `src/types/` | Enriched frontend types | Components, state | In components, in context state |

**Flow:**
```
API response → Schema.safeParse() → transform via userProfileToAppUser() → AppUser → component
```

## Rules

- Never use raw schema types in components — only app types
- Do not put computed values in types — compute locally in components
- Enums should be exhaustive — add to the enum rather than hardcoding strings
- Types live in this file — do not scatter them across component files

## Migration Path

As the codebase migrates from JSX to TSX, components will use these types directly. Maintain this layer as the source of truth for what the frontend domain looks like.
