# src/pages/CLAUDE.md

Pages in this directory are **auth-flow pages only** — the main feature pages (Dashboard, Tasks, etc.) live in `src/components/modules/` and are registered directly in `src/App.jsx`.

## Auth Pages

| File | Route | Description |
|------|-------|-------------|
| `Login.tsx` | `/login` | Email/password + Google OAuth login |
| `Register.tsx` | `/register` | New account registration form |
| `GoogleCallback.tsx` | `/auth/google/callback` | Handles the OAuth redirect from Google |

## Route Registration

All routes are defined in `src/App.jsx`. New pages must be registered there. Module pages use `React.lazy()` with `<Suspense>` and a skeleton fallback:

```jsx
const Dashboard = lazy(() => import('@components/modules/Dashboard'))

<Route path="/dashboard" element={
  <RequireAuth>
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  </RequireAuth>
} />
```

Auth pages (`/login`, `/register`) do NOT use `RequireAuth`. They redirect to `/dashboard` if the user is already authenticated.

## RequireAuth

`src/components/common/RequireAuth.jsx` guards protected routes. It checks `user` from `useApp()` and redirects unauthenticated visitors to `/login`. Wrap every protected route with it.

## Google OAuth Flow

1. User clicks "Entrar com Google" on `Login.tsx` → redirect to Google consent screen
2. Google redirects back to `/auth/google/callback` with `?code=...`
3. `GoogleCallback.tsx` sends the code to `authService.googleCallback()`
4. On success, redirects to `/dashboard`
