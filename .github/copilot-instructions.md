# Copilot Instructions for Ninho

**Ninho** is a Brazilian Portuguese home management PWA built with React. The app helps families organize tasks, shopping lists, expenses, and future purchases.

## Critical Architecture Patterns

### Service Layer Pattern (Mandatory)

ALL data operations MUST go through services (`src/services/`). Never access mock data or API directly from components.

```typescript
//  CORRECT: Use service
import * as taskService from "@services/taskService";
const tasks = await taskService.getAllTasks();

//  WRONG: Direct data access
import { mockTasks } from "@/mocks/data";
```

Each service implements dual-mode data access controlled by `VITE_DATA_MODE` env var:

- `mock` (default): Returns promises with 100ms delay from `src/mocks/data.ts`
- `api`: Makes HTTP requests via `httpClient` in `src/services/api/httpClient.ts`

Services handle ID generation, data transformation, and error handling. Pattern: check `DATA_MODE` (from `src/services/api/config.ts`), return Promise in mock mode, or call `httpClient`.

### HTTP Client (Mandatory for API calls)

ALL API requests MUST use `httpClient` from `src/services/api/httpClient.ts`. Never use `fetch` directly.

```typescript
import { httpClient, ApiError } from "@/services/api/httpClient";

const data = await httpClient.get<MyType>(ENDPOINTS.something.list);
```

Features: automatic token refresh (singleton), `credentials: 'include'`, `AbortSignal.timeout(10s)`, `ApiError` on non-2xx.

### Schema & Type System (Two-layer)

**Layer 1  API contracts**: `src/schemas/`  all Zod schemas derived from `docs/api.json`.
- Import with: `import { LoginRequestSchema } from "@/schemas"`
- Always use `Schema.safeParse()`  never `Schema.parse()`  for API responses.

**Layer 2  App-internal types**: `src/types/index.ts`  pure TypeScript interfaces for frontend state (Task, Notice, ShoppingList, FutureItem, AppUser, etc.).
- Import with: `import type { Task, AppUser } from "@/types"`
- Do NOT put API shapes here.

```typescript
// Validating an API response
const result = SomeSchema.safeParse(rawData);
if (!result.success) {
  if (import.meta.env.DEV) console.warn('Schema mismatch', result.error);
  // use rawData as fallback or throw
} else {
  use(result.data);
}
```

### State Management

- **Global state**: Lives in `src/contexts/AppContext.tsx` via `AppProvider` / `useApp()` hook
- **Theme**: `ThemeContext` (use `useTheme()` hook)
- **No Redux/Zustand**: Keep state management simple with context + hooks

### Module System

Tab-based navigation:

- `App.jsx` manages `currentModule` state
- `Navigation.tsx` renders tabs and switches modules
- Each module is a self-contained component in `src/components/modules/`
- Module IDs: `ModuleId` enum in `src/types/index.ts`

## TypeScript Migration Status

Project is **mostly migrated**. Config: `allowJs: true`, `checkJs: false`.

**TypeScript (`.tsx`/`.ts`)**: All services, schemas, types, contexts, pages, config files, shadcn/ui components, `src/main.tsx`

**Still JavaScript (`.jsx`)**: Most React module components (`src/components/modules/`), `App.jsx`

**When editing**: Always use TypeScript for new files. Import app types from `@/types`, API schemas from `@/schemas`.

```typescript
// App-internal types
import type { Task, AppUser, Priority } from "@/types";

// API schema types (Zod inferred)
import type { LoginRequest, UserProfileResponse } from "@/schemas";
```

Never create a resume document summarizing the changes has maded.

**Documentation structure**: All docs are in `docs/` folder:
- `docs/ENVIRONMENTS.md` - Environment configuration
- `docs/DEPLOY.md` - Deployment guides
- `docs/ROADMAP.md` - Feature roadmap

## Component Organization

- `components/common/` - Reusable UI (Button, Card, Input, Header, Logo, ThemeToggle)
- `components/ui/` - shadcn/ui components (button, card, dialog, select, etc.)
- `components/modules/` - Feature modules (Dashboard, Tasks, ShoppingList, Financial, FutureItems, Calendar)
- `components/skeletons/` - Loading skeletons for async data

**shadcn/ui pattern**: Import from `@/components/ui` barrel export (`src/components/ui/index.ts`)

## Forms (react-hook-form + Zod)

All forms use `react-hook-form` with `zodResolver`. Login and Register pages are the reference implementation.

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequestSchema, type LoginRequest } from "@/schemas";

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginRequest>({
  resolver: zodResolver(LoginRequestSchema),
  mode: 'onChange',
});
```

## Styling System

**Tailwind with custom theme** (`tailwind.config.ts`):

- **Primary colors**: `indigo`, `purple`, `cyan`, `emerald` (modern, vibrant)
- **Dark mode**: Class strategy (`class`), managed by ThemeContext
- **Dark-specific tokens**: `dark.bg.*`, `dark.text.*`, `dark.border.*`, `dark.accent.*`
- **Custom animations**: `animate-fade-in`, `animate-slide-in`, `animate-scale-in`, `animate-pulse-soft`

**Utility function**: `cn()` from `@/lib/utils` for conditional classes (uses `clsx` + `tailwind-merge`)

## Development Workflow

```bash
npm run dev          # Start dev server (localhost:3000, auto-opens)
npm run build        # Production build (includes TypeScript type-check)
npm run type-check   # Type-check only (no build)
npm run lint         # ESLint on .js, .jsx, .ts, .tsx
npm run format       # Prettier formatting
```

**No test suite configured** - manual testing only.

**Port**: Dev server runs on 3000 (configured in `vite.config.ts`)

## Path Aliases

Configured in both `vite.config.ts` and `tsconfig.json`:

```typescript
@/*             src/*
@components/*   src/components/*
@services/*     src/services/*
@types/*        src/types/*
@utils/*        src/utils/*
@lib/*          src/lib/*
```

## PWA Features

- **Manifest**: `/public/manifest.json` defines app metadata and icons
- **Service Worker**: `/public/sw.js` handles offline caching, registered in `src/main.tsx`
- **Icons**: Multiple sizes in `/public/icons/`
- **Updates**: SW checks every 60 seconds when running

## Environment Configuration

Create `.env` file (see project root for `.env.example`):

```bash
VITE_DATA_MODE=mock                    # 'mock' or 'api'
VITE_API_URL=http://localhost:5026     # API base URL (when using API mode)
```

## Language & Context

**All user-facing text is in Brazilian Portuguese**. UI labels, button text, categories, and error messages should use Portuguese. Code comments and variable names can be English or Portuguese (mixed codebase).

## Key Files Reference

- `src/App.jsx` - Main component, router setup
- `src/contexts/AppContext.tsx` - Global state, `useApp()` hook (notices, tasks, shopping, expenses, futureItems, user)
- `src/types/index.ts` - App-internal TypeScript types (Task, AppUser, Notice, ShoppingList, FutureItem, etc.)
- `src/schemas/index.ts` - Zod schemas for all API contracts (re-exports from `src/schemas/`)
- `src/services/api/httpClient.ts` - Unified HTTP client with refresh token
- `src/services/api/endpoints.ts` - All real API route strings (no phantom routes)
- `src/services/api/config.ts` - Env config only (DATA_MODE, API_BASE_URL)
- `src/mocks/data.ts` - Typed mock data using `satisfies` operator
- `tailwind.config.ts` - Custom theme colors and dark mode tokens
- `docs/api.json` - Source of truth for all real API endpoints and schemas

## Common Patterns

**Adding a new feature module**:

1. Create service in `src/services/` (`.ts`) with mock/API dual mode using `httpClient`
2. Add module state and handlers to `src/contexts/AppContext.tsx`
3. Create module component in `src/components/modules/`
4. Add module ID to `ModuleId` enum in `src/types/index.ts`
5. Update `Navigation.tsx` with new tab

**Accessing global state in components**:

```typescript
import { useApp } from "@/contexts/AppContext";

const { tasks, addTask, deleteTask } = useApp();
```

**Toast notifications**: Use `sonner` (`toast.success`, `toast.error`)
