# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Commits

- All commits must be made under the user's identity: **Gabriel Carrijo** `<gabriel20carrijo@hotmail.com>`.
- Never include a `Co-Authored-By` trailer or any other mention of Claude/AI authorship in commit messages.

## Plan Execution

- When executing a superpowers implementation plan (`docs/superpowers/plans/`), always use **subagent-driven development** (fresh subagent per task, review between tasks) — never inline/batch execution — unless the user explicitly asks for inline execution for that run.

## Project Overview

**Ninho** — a Brazilian Portuguese PWA for family home management (tasks, shopping, finances, bank accounts, credit cards, calendar). UI text is in Brazilian Portuguese; code comments/variable names can be mixed.

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

- **Mock mode** (`VITE_DATA_MODE=mock`): Returns mock data from `src/mocks/data.ts` with 100ms delay
- **API mode** (`VITE_DATA_MODE=api`): Makes HTTP requests via `src/services/api/httpClient.ts`

### HTTP Client

`src/services/api/httpClient.ts` handles all API requests with:

- Cookie-based auth (`credentials: 'include'`)
- Automatic token refresh on 401 (single retry via `/api/auth/refresh`)
- 10-second timeout on all requests
- Custom `ApiError` class with status codes
- Centralized URL endpoints in `src/services/api/endpoints.ts`

### Two-Layer Type System

- **Layer 1 — API contracts:** `src/schemas/` — Zod schemas matching `docs/api.json`
- **Layer 2 — App types:** `src/types/index.ts` — Frontend-only TypeScript interfaces

Always use `Schema.safeParse()`, never `.parse()`. Use transformation helpers (e.g. `userProfileToAppUser()`) to convert API responses to app types.

### Global State

State lives in `src/contexts/AppContext.tsx`. Access via `useApp()` hook. No Redux/Zustand.

State includes: `notices`, `tasks`, `shoppingLists`, `shoppingCategories`, `expenses`, `futureItems`, `user`, `activeNestId`, `nests`.

Theme (dark/light) is managed separately in `src/contexts/ThemeContext.jsx` via `useTheme()`. Application loading states and splash screen are managed in `src/contexts/LoadingContext.tsx`.

### Routing

React Router v7 in `src/App.jsx`. Protected routes via `RequireAuth`. All module pages are lazy-loaded with Suspense + skeleton loaders.

Routes:
- Auth & Public: `/login`, `/register`, `/auth/google/callback`, `/invite`
- App Protected: `/dashboard`, `/tasks`, `/shopping`, `/financial`, `/financial-v2`, `/financial/account`, `/financial/card`, `/financial/goals`, `/financial/recurrences`, `/calendar`.

### TypeScript Migration

The codebase is almost fully migrated to TypeScript (`allowJs: true`, `checkJs: false`). All services, schemas, types, contexts, hooks, utilities, and pages are `.ts`/`.tsx`. Several feature modules under `src/components/modules/` (e.g. `Financial.tsx`, `FinancialV2.tsx`, `Tasks.tsx`) are `.tsx`, while a few remain `.jsx` — migrate gradually.

## Adding a New Feature

1. Define Zod schema in `src/schemas/` if the feature touches a new API endpoint
2. Create/update service in `src/services/` (`.ts`) with both mock and API branches
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
- `VITE_SIGNALR_URL` — SignalR hub URL for real-time sync

## Key Reference Files

- `docs/api.json` — Source of truth for API endpoints and response shapes (70KB)
- `docs/DESIGN.md` — UI/UX design rationale and form guidelines
- `docs/ENVIRONMENTS.md` — Environment variable and multi-mode setup guide
- `docs/DEPLOY.md` — Deployment guides (Vercel, Netlify, Docker)
- `docs/ROADMAP.md` — Project milestone roadmap and migration status

## Sub-directory Guides

Each major directory has its own `CLAUDE.md` with local conventions:

**Feature & Architecture:**

- [`src/components/CLAUDE.md`](src/components/CLAUDE.md) — Component architecture, naming, animation patterns
- [`src/services/CLAUDE.md`](src/services/CLAUDE.md) — Service dual-mode pattern, HTTP client, endpoints
- [`src/schemas/CLAUDE.md`](src/schemas/CLAUDE.md) — Zod schema conventions, API contract rules
- [`src/contexts/CLAUDE.md`](src/contexts/CLAUDE.md) — Global state management, context patterns
- [`src/pages/CLAUDE.md`](src/pages/CLAUDE.md) — Auth pages, invite acceptance, routing conventions

**Data & Types:**

- [`src/types/CLAUDE.md`](src/types/CLAUDE.md) — Frontend domain types, enums, transformation functions
- [`src/mocks/CLAUDE.md`](src/mocks/CLAUDE.md) — Mock data for development, dual-mode pattern

**Utilities & Hooks:**

- [`src/lib/CLAUDE.md`](src/lib/CLAUDE.md) — Shared utilities (animations, avatarUtils, preferences)
- [`src/hooks/CLAUDE.md`](src/hooks/CLAUDE.md) — Custom React hooks (toast, debounce, SignalR, prefersReducedMotion)
- [`src/utils/CLAUDE.md`](src/utils/CLAUDE.md) — Domain-specific utilities (metrics, financialUtils, formatters)

**Documentation:**

- [`docs/CLAUDE.md`](docs/CLAUDE.md) — API reference, design docs, environments, deployment guides, roadmap
