# src/services/CLAUDE.md

All data access in the app flows through this directory. Components must never call `fetch` directly or import from `src/mocks/data.ts`.

## Dual-Mode Pattern (Mandatory)

Every service function must branch on `VITE_DATA_MODE`:

```ts
import { isMockMode } from '@services/api/config';
import { mockData } from '@/mocks/data';
import { httpClient } from '@services/api/httpClient';
import { ENDPOINTS } from '@services/api/endpoints';

export async function getThings(): Promise<Thing[]> {
  if (isMockMode) {
    await delay(100);
    return mockData.things;
  }
  const data = await httpClient.get(ENDPOINTS.things.list);
  const result = ThingSchema.array().safeParse(data);
  if (!result.success) throw new ApiError('Parse error', 422);
  return result.data;
}
```

The 100ms mock delay intentionally simulates network latency — keep it.

## HTTP Client & Endpoints (`api/httpClient.ts` & `api/endpoints.ts`)

The active HTTP client lives in `api/httpClient.ts`. All API calls must use it instead of raw `fetch`:

- `credentials: 'include'` on every request (cookie-based auth)
- Automatic single-retry token refresh on 401 (`/api/auth/refresh`) via a shared refresh promise
- 10-second `AbortController` timeout on all requests
- Custom `ApiError` class exposing status code, status text, and backend payload
- Endpoints are centralized in `api/endpoints.ts`

## Service Files

All 16 services in this directory are fully typed TypeScript modules (`.ts`):

| File                    | Responsibility                                       |
| ----------------------- | ---------------------------------------------------- |
| `authService.ts`        | Login, register, logout, Google OAuth, token refresh |
| `bankAccountService.ts` | Bank accounts CRUD and balances                      |
| `calendarService.ts`    | Calendar events                                      |
| `categoryService.ts`    | Category management for shopping and finances        |
| `dashboardService.ts`   | Dashboard KPI summaries and activity feeds           |
| `financialService.ts`   | Expenses, income transactions, and balances          |
| `futureItemsService.ts` | Future purchase wish-list                            |
| `goalsService.ts`       | Financial savings and expense goals                  |
| `nestService.ts`        | Nests management, invitations, and member access     |
| `noticeService.ts`      | Family notice board (avisos)                         |
| `paymentCardService.ts` | Credit and debit card management and card statements |
| `settingsService.ts`    | User and nest preferences                            |
| `shoppingService.ts`    | Shopping lists and item CRUD                         |
| `taskService.ts`        | CRUD for tasks, subtasks, and status transitions     |
| `userService.ts`        | User profile and credentials management              |
| `weatherService.ts`     | Weather forecasts for home location                  |

## Adding a New Service

1. Add endpoints to `api/endpoints.ts`
2. Add Zod schema in `src/schemas/` matching the API contract
3. Create `<feature>Service.ts` with mock + API branches
4. Add mock data entries in `src/mocks/data.ts`
5. Wire to `AppContext.tsx` if the data belongs to global state

## Error Handling

Services throw `ApiError` — callers (contexts/components) handle it. Do not swallow errors silently. Surface them via the toast notification system (`useToastNotifications` or `sonner`) at the component level.
