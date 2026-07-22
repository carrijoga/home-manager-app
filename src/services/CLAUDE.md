# src/services/CLAUDE.md

All data access in the app flows through this directory. Components must never call `fetch` directly or import from `src/mocks/data.ts`.

## Dual-Mode Pattern (Mandatory)

Every service function must branch on `VITE_DATA_MODE`:

```ts
import { isMockMode } from '@services/api/config'
import { mockData } from '@/mocks/data'
import { httpClient } from '@services/api/httpClient'
import { ENDPOINTS } from '@services/api/endpoints'

export async function getThings(): Promise<Thing[]> {
  if (isMockMode) {
    await delay(100)
    return mockData.things
  }
  const data = await httpClient.get(ENDPOINTS.things.list)
  const result = ThingSchema.array().safeParse(data)
  if (!result.success) throw new ApiError('Parse error', 422)
  return result.data
}
```

The 100ms mock delay intentionally simulates network latency — keep it.

## HTTP Client (`api/config.js`)

Current HTTP layer lives in `api/config.js`. Never use raw `fetch` in service files — go through the helper there.

Planned migration target is `api/httpClient.ts`, which will add:
- `credentials: 'include'` on every request (cookie auth)
- Automatic single-retry token refresh on 401 (`/api/auth/refresh`)
- 10-second AbortController timeout
- `ApiError` class with `.status` on non-2xx

Planned `api/endpoints.ts` will centralize all URL strings — until then, keep URLs inside each service file.

## Service Files

| File | Responsibility |
|------|---------------|
| `authService.ts` | Login, register, logout, Google OAuth, token refresh |
| `taskService.js` | CRUD for tasks + status transitions |
| `shoppingService.js` | Shopping lists and items CRUD |
| `financialService.js` | Expenses and income CRUD |
| `futureItemsService.js` | Future purchase wish-list |
| `noticeService.js` | Family notice board (avisos) |

Migrate `.js` services to `.ts` gradually — only when editing them, not wholesale rewrites.

## Adding a New Service

1. Add endpoints to `api/endpoints.ts`
2. Add Zod schema in `src/schemas/` matching the API contract
3. Create `<feature>Service.ts` with mock + API branches
4. Add mock data entries in `src/mocks/data.ts`
5. Wire to `AppContext` if the data belongs to global state

## Error Handling

Services throw `ApiError` — callers (contexts/components) handle it. Do not swallow errors silently. Surface them via the toast system (`useToastNotifications`) at the component level.
