# src/schemas/CLAUDE.md

Schemas in this directory are **Layer 1 of the type system** — they represent the exact shape of API responses and requests as defined in `docs/api.json`. They are the contract boundary between the backend and the frontend.

## Rules

- **Always `safeParse()`, never `.parse()`** — `.parse()` throws; `.safeParse()` returns a result object so errors can be handled gracefully.
- Schemas mirror `docs/api.json` exactly. When the API changes, update the schema first.
- Do not add frontend-only fields to schemas. App-specific transformations belong in `src/types/index.ts`.
- Export schemas and their inferred types from the same file.

```ts
export const ThingSchema = z.object({ ... })
export type Thing = z.infer<typeof ThingSchema>
```

## Schema Files

| File | Covers |
|------|--------|
| `auth.ts` | Login/register request + response shapes |
| `user.ts` | User profile and nest member shapes |
| `tasks.ts` | Task and subtask shapes |
| `shopping.ts` | Shopping list and item shapes |
| `financial.ts` | Expense and income shapes |
| `bank-account.ts` | Bank account shape |
| `category.ts` | Category shape (shared by financial + shopping) |
| `notices.ts` | Notice/aviso shape |
| `settingsSchemas.ts` | User and nest settings shapes |
| `shared.ts` | Reusable sub-schemas (pagination, timestamps, IDs) |
| `enums.ts` | Zod enums matching backend enum types |
| `index.ts` | Barrel export |

## Enums

All enums are defined in `enums.ts` as `z.enum([...])`. Import from there — do not redeclare the same values elsewhere.

## Shared Sub-schemas

`shared.ts` contains reusable building blocks:
- `TimestampsSchema` — `createdAt`, `updatedAt`
- `PaginatedResponseSchema` — wraps list responses with `total`, `page`, `pageSize`
- `IdSchema` — UUID string

Compose these instead of repeating the same field definitions.

## Relation to App Types

Schemas produce the raw API shape. `src/types/index.ts` defines richer frontend interfaces and transformation functions (e.g., `userProfileToAppUser()`). The conversion happens in services after `safeParse()` succeeds — components always work with app types, never raw schema types.
