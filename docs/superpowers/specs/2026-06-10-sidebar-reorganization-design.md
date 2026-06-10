# Sidebar Reorganization — Design Spec
**Date:** 2026-06-10

## Goal

Reorganize the app sidebar to reflect the new Financial module structure: sub-items become real routes, two new sections are added (Conta, Cartão), Dashboard sub-item is removed, and FutureItems is removed entirely from the menu and routing.

## Final Navigation Structure

```
Início           → /dashboard
Tarefas          → /tasks
Lista de Compras → /shopping
▾ Finanças       → /financial (clicking the parent navigates here)
  Lançamentos    → /financial
  Metas          → /financial/goals
  Recorrências   → /financial/recurrences
  Conta          → /financial/account
  Cartão         → /financial/card
Agenda           → /calendar
```

## Changes

### 1. New animated icons

**`src/components/ui/animated-icons/user.tsx`**
- Handle: `UserIconHandle` with `startAnimation` / `stopAnimation`
- Animation: head circle scales from 0→1, then body arc draws via `pathLength` with a short delay

**`src/components/ui/animated-icons/credit-card.tsx`**
- Handle: `CreditCardIconHandle` with `startAnimation` / `stopAnimation`
- Animation: outer rectangle draws via `pathLength` 0→1, inner decorative line appears with a short delay

Both follow the exact `forwardRef` + `useImperativeHandle` + `useAnimation` pattern from existing icons.

### 2. `src/components/app-sidebar.tsx`

- `FINANCAS_SUB_ITEMS` updated:
  - Remove: Dashboard (`/financial` with index 0 special-case)
  - Keep: Lançamentos → `/financial`
  - Keep: Metas → `/financial/goals`
  - Keep: Recorrências → `/financial/recurrences`
  - Add: Conta → `/financial/account` (UserIcon)
  - Add: Cartão → `/financial/card` (CreditCardIcon)
- `isFinancasActive`: change from `location.pathname === "/financial"` to `location.pathname.startsWith("/financial")`
- Sub-item active state: `isActive` per sub-item uses `location.pathname === item.path` (not index-based)
- Remove all FutureItems references (imports, arrays, any related state)

### 3. `src/App.jsx`

- Add routes nested under the authenticated layout:
  - `/financial/goals` → placeholder page (title "Metas")
  - `/financial/recurrences` → placeholder page (title "Recorrências")
  - `/financial/account` → placeholder page (title "Conta")
  - `/financial/card` → placeholder page (title "Cartão")
- Remove `/future` route and `FutureItemsModule` lazy import

## Out of scope

- Implementing the content of the new Financial sub-pages (goals, recurrences, account, card)
- Any changes to the Financial (Lançamentos) page itself
