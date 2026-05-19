# src/mocks/CLAUDE.md

Mock data for development and testing when `VITE_DATA_MODE=mock`.

## data.ts

Single file containing all mock data for every API endpoint. Structure:

```ts
export const mockData = {
  user: { id: '...', name: '...', ... },
  nests: [ { id: '...', name: '...' }, ... ],
  tasks: [ { id: '...', title: '...' }, ... ],
  shoppingLists: [ { id: '...', name: '...' }, ... ],
  // ... all other entities
}
```

## Usage in Services

Every service file branches on `VITE_DATA_MODE`:

```ts
import { isMockMode } from '@services/api/config'
import { mockData } from '@/mocks/data'

export async function getTasks() {
  if (isMockMode) {
    await delay(100) // Simulate network latency
    return mockData.tasks
  }
  // ... API call
}
```

The 100ms delay is intentional — it lets you verify UI behavior under realistic conditions.

## Adding Mock Data

1. Add entity to `mockData` object with realistic values
2. Use consistent IDs across related entities (e.g., tasks belong to nests)
3. Include timestamps (`createdAt`, `updatedAt`) matching the API schema
4. Update all services that read that entity to branch on it

## Important

- **Never import `mockData` directly in components** — go through the service layer
- Keep mock data **in sync with Zod schemas** in `src/schemas/`
- Mock data is **for development only** — production builds should never use mock mode
