# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Commits

- All commits must be made under the user's identity: **Gabriel Carrijo** `<gabriel20carrijo@hotmail.com>`.
- Never include a `Co-Authored-By` trailer or any other mention of Claude/AI authorship in commit messages.

## Project Overview

**Ninho** — a Brazilian Portuguese PWA for family home management (tasks, shopping, finances, calendar). UI text is in Brazilian Portuguese; code comments/variable names can be mixed.

## Commands

```bash
npm run dev          # Dev server on port 3000
npm run build        # Production build (runs tsc + vite build)
npm run type-check   # TypeScript check only
npm run lint         # ESLint on JS/TS files
npm run format       # Prettier formatting
```

Multi-environment scripts: `dev:staging`, `build:staging`, `dev:production`, `build:production`.

No test suite — manual testing only.

## Architecture

### Data Flow Pattern (Mandatory)

All data access MUST go through `src/services/`. Never import from `src/mocks/data.ts` directly in components.

Each service implements **dual-mode**:

- **Mock mode** (`VITE_DATA_MODE=mock`): Returns mock data from `src/mocks/data.js` with 100ms delay
- **API mode** (`VITE_DATA_MODE=api`): Makes HTTP requests via `src/services/api/config.js`

### HTTP Client

Currently `src/services/api/config.js` handles API requests. The planned migration target is `src/services/api/httpClient.ts` with:

- Cookie-based auth (`credentials: 'include'`)
- Automatic token refresh on 401 (single retry via `/api/auth/refresh`)
- 10-second timeout on all requests
- Custom `ApiError` class with status codes

API endpoints will be centralized in `src/services/api/endpoints.ts` (planned — currently URLs live in each service file).

### Two-Layer Type System

- **Layer 1 — API contracts:** `src/schemas/` — Zod schemas matching `docs/api.json`
- **Layer 2 — App types:** `src/types/index.ts` — Frontend-only TypeScript interfaces

Always use `Schema.safeParse()`, never `.parse()`. Use `userProfileToAppUser()` (in `src/types/index.ts`) to convert API responses to app types.

### Global State

State lives in `src/contexts/AppContext.jsx`. Access via `useApp()` hook. No Redux/Zustand.

State includes: `notices`, `tasks`, `shoppingLists`, `shoppingCategories`, `expenses`, `futureItems`, `user`, `activeNestId`.

Theme (dark/light) is managed separately in `src/contexts/ThemeContext.jsx` via `useTheme()`.

### Routing

React Router v7 in `src/App.jsx`. Protected routes via `RequireAuth`. All module pages are lazy-loaded with Suspense + skeleton loaders.

Routes: `/dashboard`, `/tasks`, `/shopping`, `/financial`, `/future`, `/calendar`. Auth routes: `/login`, `/register`, `/auth/google/callback`.

### TypeScript Migration

The codebase is in hybrid mode (`allowJs: true`, `checkJs: false`). Services, schemas, types, contexts, and pages are `.tsx`/`.ts`. Most module components under `src/components/modules/` are still `.jsx` — migrate gradually.

## Adding a New Feature

1. Define Zod schema in `src/schemas/` if the feature touches a new API endpoint
2. Create/update service in `src/services/` with both mock and API branches
3. Add actions and state to `src/contexts/AppContext.tsx` if global state is needed
4. Build component in `src/components/modules/` (feature) or `src/components/common/` (reusable)
5. Use `@/` path aliases throughout — never relative imports like `../../`

## Path Aliases

Defined in `vite.config.ts` and `tsconfig.json`:

- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@services/*` → `src/services/*`
- `@contexts/*` → `src/contexts/*`
- `@types/*` → `src/types/*`
- `@schemas/*` → `src/schemas/*`

## Environment Variables

See `.env.example`. Key vars:

- `VITE_DATA_MODE` — `mock` or `api`
- `VITE_ENVIRONMENT` — `development`, `staging`, or `production`
- `VITE_API_URL` — API base URL (default: `http://localhost:5026`)

## Key Reference Files

- `docs/api.json` — Source of truth for API endpoints and response shapes (70KB)
- `docs/ENVIRONMENTS.md` — Environment configuration guide
- `docs/DEPLOY.md` — Deployment guides (Vercel, Netlify, Docker)

## Sub-directory Guides

Each major directory has its own `CLAUDE.md` with local conventions:

**Feature & Architecture:**

- [`src/components/CLAUDE.md`](src/components/CLAUDE.md) — Component architecture, naming, animation patterns
- [`src/services/CLAUDE.md`](src/services/CLAUDE.md) — Service dual-mode pattern, HTTP client, endpoints
- [`src/schemas/CLAUDE.md`](src/schemas/CLAUDE.md) — Zod schema conventions, API contract rules
- [`src/contexts/CLAUDE.md`](src/contexts/CLAUDE.md) — Global state management, context patterns
- [`src/pages/CLAUDE.md`](src/pages/CLAUDE.md) — Auth pages, routing, page-level conventions

**Data & Types:**

- [`src/types/CLAUDE.md`](src/types/CLAUDE.md) — Frontend domain types, enums, transformation functions
- [`src/mocks/CLAUDE.md`](src/mocks/CLAUDE.md) — Mock data for development, dual-mode pattern

**Utilities & Hooks:**

- [`src/lib/CLAUDE.md`](src/lib/CLAUDE.md) — Shared utilities (animations, avatarUtils, preferences)
- [`src/hooks/CLAUDE.md`](src/hooks/CLAUDE.md) — Custom React hooks (toast, debounce, prefersReducedMotion)
- [`src/utils/CLAUDE.md`](src/utils/CLAUDE.md) — Domain-specific utilities (metrics, formatters)

**Documentation:**

- [`docs/CLAUDE.md`](docs/CLAUDE.md) — API reference, design docs, deployment guides
