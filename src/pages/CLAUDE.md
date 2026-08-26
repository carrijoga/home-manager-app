# src/pages/CLAUDE.md

Pages in this directory are **standalone public flow pages** (auth and invitations) — the main feature pages (Dashboard, Tasks, Financial, etc.) live in `src/components/modules/` and are registered directly in `src/App.jsx`.

## Standalone Pages

| File                 | Route                   | Description                                                |
| -------------------- | ----------------------- | ---------------------------------------------------------- |
| `Login.tsx`          | `/login`                | Email/password + Google OAuth login                        |
| `Register.tsx`       | `/register`             | New account registration form                              |
| `GoogleCallback.tsx` | `/auth/google/callback` | Handles the OAuth redirect from Google                     |
| `InviteAccept.tsx`   | `/invite`               | Handles nest invitation code validation and member join    |

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

Auth pages (`/login`, `/register`) and standalone flow pages (`/invite`) do NOT use `RequireAuth`. Auth pages redirect to `/dashboard` if the user is already authenticated.

## RequireAuth

`src/components/common/RequireAuth.jsx` guards protected routes. It checks `user` from `useApp()` and redirects unauthenticated visitors to `/login`. Wrap every protected route with it.

## Google OAuth Flow

1. User clicks "Entrar com Google" on `Login.tsx` → redirect to Google consent screen
2. Google redirects back to `/auth/google/callback` with `?code=...`
3. `GoogleCallback.tsx` sends the code to `authService.googleCallback()`
4. On success, redirects to `/dashboard`

## Invitation Accept Flow (`InviteAccept.tsx`)

1. User receives an invitation link with `?code=...` or navigates to `/invite`
2. `InviteAccept.tsx` validates the invitation token via `nestService.validateInvite(code)`
3. Displays nest details and allows the user to accept the invitation to join the family nest
4. On acceptance, updates active nest state and redirects to `/dashboard`
