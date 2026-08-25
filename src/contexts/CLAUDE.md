# src/contexts/CLAUDE.md

## AppContext (`AppContext.tsx`)

The single source of global state for the app. Access via the `useApp()` hook. Written in TypeScript.

### State Shape

| Key                  | Type                 | Description                    |
| -------------------- | -------------------- | ------------------------------ |
| `user`               | `AppUser \| null`    | Authenticated user profile     |
| `activeNestId`       | `string \| null`     | Currently selected family nest |
| `nests`              | `Nest[]`             | All nests the user belongs to  |
| `notices`            | `Notice[]`           | Family bulletin board items    |
| `tasks`              | `Task[]`             | All tasks for the active nest  |
| `shoppingLists`      | `ShoppingList[]`     | Shopping lists                 |
| `shoppingCategories` | `ShoppingCategory[]` | Categories for shopping items  |
| `expenses`           | `Expense[]`          | Financial expenses             |
| `futureItems`        | `FutureItem[]`       | Future purchase wish-list      |

### Actions

AppContext exposes dispatch-style action functions alongside state. When adding new global state:

1. Add state key and initial value to the context
2. Add a typed setter or action function
3. Load initial data in the `useEffect` bootstrap inside the provider

### Loading Pattern

Each data type has a paired `loading` flag (e.g., `tasksLoading`). Use these to conditionally render skeleton components — never block the whole page for a single resource.

### Rules

- Components access context via `useApp()` only — never consume `AppContext` directly with `useContext`.
- Services are called inside AppContext's action functions or inside components that then call context setters. Contexts must not import from `src/mocks/data.ts`.
- Do not store derived/computed values in context — compute them locally in the consuming component.

## LoadingContext (`LoadingContext.tsx`)

Manages initial application bootstrapping and splash screen visibility.

Access via `useAppReady()` or `useLoading()`. Exposes `{ appReady, setAppReady }`. Wraps `AppShell` in `App.jsx` to render `<SplashScreen>` during application initialization.

## ThemeContext (`ThemeContext.jsx`)

Separate context for dark/light theme to avoid re-renders across the whole tree on theme toggle.

Access via `useTheme()` hook. Returns `{ theme, toggleTheme }`.

Theme is persisted to `localStorage` under the key `'ninho-theme'`.

Do not merge ThemeContext or LoadingContext into AppContext — keep them separate.
