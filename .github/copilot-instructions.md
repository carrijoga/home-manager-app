# Copilot Instructions for Ninho

**Ninho** is a Brazilian Portuguese home management PWA built with React. The app helps families organize tasks, shopping lists, expenses, and future purchases.

## Critical Architecture Patterns

### Service Layer Pattern (Mandatory)

ALL data operations MUST go through services (`src/services/`). Never access mock data or API directly from components.

```javascript
// ✅ CORRECT: Use service
import * as taskService from "@services/taskService";
const tasks = await taskService.getAllTasks();

// ❌ WRONG: Direct data access
import { mockTasks } from "@mocks/data";
```

Each service implements dual-mode data access controlled by `VITE_DATA_MODE` env var:

- `mock` (default): Returns promises with 100ms delay from `src/mocks/data.js`
- `api`: Makes HTTP requests via `apiRequest()` helper in `src/services/api/config.js`

Services handle ID generation, data transformation, and error handling. Pattern: check `DATA_MODE`, return Promise in mock mode, or call API endpoint.

### State Management

- **Global state**: Lives in `App.jsx` using React useState hooks
- **Props down**: Data flows from App.jsx → module components
- **Callbacks up**: Module components call handlers passed as props to update state
- **Context**: Only `ThemeContext` for dark/light theme (use `useTheme()` hook)
- **No Redux/Zustand**: Keep state management simple with props

### Module System

Tab-based navigation defined by `ModuleIds` enum in `src/models/types.js`:

- `App.jsx` manages `currentModule` state
- `Navigation.tsx` renders tabs and switches modules
- Each module is a self-contained component in `src/components/modules/`

## TypeScript Migration (Hybrid Mode)

Project is **partially migrated**. Config: `allowJs: true`, `checkJs: false`.

**Migrated (`.tsx`/`.ts`)**: Config files, `src/types/index.ts`, shadcn/ui components, `src/lib/utils.ts`, `src/main.tsx`

**Remaining (`.jsx`/`.js`)**: Most React components, all services, mocks, utilities

**When editing**: Use TypeScript for NEW files. Import types from `@/types`:

```typescript
import { Task, Priority, ExpenseCategory } from "@/types";
```

For details: see `TYPESCRIPT.md` and `CLAUDE.md`

## Component Organization

- `components/common/` - Reusable UI (Button, Card, Input, Header, Logo, ThemeToggle)
- `components/ui/` - shadcn/ui components (button, card, dialog, select, etc.)
- `components/modules/` - Feature modules (Dashboard, Tasks, ShoppingList, Financial, FutureItems, Calendar)
- `components/skeletons/` - Loading skeletons for async data

**shadcn/ui pattern**: Import from `@/components/ui` barrel export (`src/components/ui/index.ts`)

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
@/*            → src/*
@components/*  → src/components/*
@services/*    → src/services/*
@types/*       → src/types/*
@utils/*       → src/utils/*
@lib/*         → src/lib/*
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
VITE_API_URL=http://localhost:3001/api # API base URL (when using API mode)
```

## Language & Context

**All user-facing text is in Brazilian Portuguese**. UI labels, button text, categories, and error messages should use Portuguese. Code comments and variable names can be English or Portuguese (mixed codebase).

## Key Files Reference

- `src/App.jsx` - Main component, holds all global state, loads initial data
- `src/types/index.ts` - Centralized TypeScript types (use instead of `src/models/types.js`)
- `src/services/api/config.js` - API configuration, `DATA_MODE` check, `apiRequest()` helper
- `src/mocks/data.js` - Mock data for all modules
- `tailwind.config.ts` - Custom theme colors and dark mode tokens
- `CLAUDE.md` - Detailed architecture documentation
- `TYPESCRIPT.md` - TypeScript migration guide

## Common Patterns

**Adding a new feature module**:

1. Create service in `src/services/` with mock/API dual mode
2. Add data state to `App.jsx` with handlers
3. Create module component in `src/components/modules/`
4. Add module ID to `ModuleIds` enum in `src/models/types.js`
5. Update `Navigation.tsx` with new tab

**Fetching data on component mount**:

```javascript
useEffect(() => {
  loadInitialData();
}, []);
```

**Toast notifications**: Use `react-hot-toast` (already installed)
