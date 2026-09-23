# Sidebar Reorganization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the app sidebar so Financial sub-items each have their own route, add animated icons for Conta and Cartão, and remove FutureItems entirely.

**Architecture:** New animated icon files follow the existing `forwardRef + useImperativeHandle + useAnimation` pattern. The sidebar `FINANCAS_SUB_ITEMS` array is updated to use real routes per item. Four placeholder pages are added in `App.jsx` for the new Financial sub-routes. No new global state is needed.

**Tech Stack:** React, React Router v7, Framer Motion, TypeScript, Shadcn/Radix sidebar primitives.

---

### Task 1: Create `UserIcon` animated icon

**Files:**
- Create: `src/components/ui/animated-icons/user.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import type { Variants } from "framer-motion";
import { motion, useAnimation } from "framer-motion";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle } from "react";

import { cn } from "@/lib/utils";

export interface UserIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface UserIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const HEAD_VARIANTS: Variants = {
  normal: {
    scale: 1,
    transition: { duration: 0.3 },
  },
  animate: {
    scale: [0, 1.15, 1],
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const BODY_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.3, opacity: { duration: 0.1 } },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: { delay: 0.25, duration: 0.4, opacity: { duration: 0.1, delay: 0.25 } },
  },
};

const UserIcon = forwardRef<UserIconHandle, UserIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();

    useImperativeHandle(ref, () => ({
      startAnimation: () => controls.start("animate"),
      stopAnimation: () => controls.start("normal"),
    }));

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        controls.start("animate");
        onMouseEnter?.(e);
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        controls.start("normal");
        onMouseLeave?.(e);
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.circle
            animate={controls}
            cx="12"
            cy="8"
            initial="normal"
            r="4"
            variants={HEAD_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
            initial="normal"
            variants={BODY_VARIANTS}
          />
        </svg>
      </div>
    );
  }
);

UserIcon.displayName = "UserIcon";

export { UserIcon };
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run type-check
```

Expected: no errors related to `user.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/animated-icons/user.tsx
git commit -m "feat(icons): add animated UserIcon"
```

---

### Task 2: Create `CreditCardIcon` animated icon

**Files:**
- Create: `src/components/ui/animated-icons/credit-card.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client";

import type { Variants } from "framer-motion";
import { motion, useAnimation } from "framer-motion";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle } from "react";

import { cn } from "@/lib/utils";

export interface CreditCardIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CreditCardIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const CARD_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: { duration: 0.4, opacity: { duration: 0.1 } },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: { duration: 0.5, opacity: { duration: 0.1 } },
  },
};

const STRIPE_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.2 },
  },
  animate: {
    opacity: [0, 1],
    scaleX: [0, 1],
    transition: { delay: 0.35, duration: 0.3, opacity: { duration: 0.1, delay: 0.35 } },
  },
};

const DOT_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
  animate: {
    opacity: [0, 1],
    scale: [0, 1],
    transition: { delay: 0.45, duration: 0.25 },
  },
};

const CreditCardIcon = forwardRef<CreditCardIconHandle, CreditCardIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();

    useImperativeHandle(ref, () => ({
      startAnimation: () => controls.start("animate"),
      stopAnimation: () => controls.start("normal"),
    }));

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        controls.start("animate");
        onMouseEnter?.(e);
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        controls.start("normal");
        onMouseLeave?.(e);
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.rect
            animate={controls}
            height="14"
            initial="normal"
            rx="2"
            variants={CARD_VARIANTS}
            width="20"
            x="2"
            y="5"
          />
          <motion.line
            animate={controls}
            initial="normal"
            variants={STRIPE_VARIANTS}
            x1="2"
            x2="22"
            y1="10"
            y2="10"
          />
          <motion.circle
            animate={controls}
            cx="7"
            cy="15"
            fill="currentColor"
            initial="normal"
            r="1"
            stroke="none"
            variants={DOT_VARIANTS}
          />
        </svg>
      </div>
    );
  }
);

CreditCardIcon.displayName = "CreditCardIcon";

export { CreditCardIcon };
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run type-check
```

Expected: no errors related to `credit-card.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/animated-icons/credit-card.tsx
git commit -m "feat(icons): add animated CreditCardIcon"
```

---

### Task 3: Update `app-sidebar.tsx`

**Files:**
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Add new icon imports at the top of the file**

In `src/components/app-sidebar.tsx`, after the existing animated icon imports (around line 19), add:

```tsx
import { CreditCardIcon, type CreditCardIconHandle } from "@/components/ui/animated-icons/credit-card";
import { UserIcon, type UserIconHandle } from "@/components/ui/animated-icons/user";
```

Also remove the unused import:
```tsx
// Remove this line:
import { LayoutPanelTopIcon } from "@/components/ui/animated-icons/layout-panel-top";
```

- [ ] **Step 2: Update `FINANCAS_SUB_ITEMS` array**

Replace the entire `FINANCAS_SUB_ITEMS` constant (lines 76–81):

```tsx
const FINANCAS_SUB_ITEMS: FinancasSubItem[] = [
  { id: "financial-lancamentos", name: "Lançamentos", icon: DollarSignIcon, path: "/financial" },
  { id: "financial-metas", name: "Metas", icon: TrendingUpIcon, path: "/financial/goals" },
  { id: "financial-recorrencias", name: "Recorrências", icon: RefreshCWIcon, path: "/financial/recurrences" },
  { id: "financial-conta", name: "Conta", icon: UserIcon, path: "/financial/account" },
  { id: "financial-cartao", name: "Cartão", icon: CreditCardIcon, path: "/financial/card" },
];
```

- [ ] **Step 3: Fix `isFinancasActive` to cover all sub-routes**

On the line (around line 218):
```tsx
const isFinancasActive = location.pathname === "/financial";
```

Change to:
```tsx
const isFinancasActive = location.pathname.startsWith("/financial");
```

- [ ] **Step 4: Fix sub-item active state to use route comparison**

In the `FinancasGroup` component, the `CollapsibleContent` renders `FinancasSubItemRow` with a hardcoded `isActive` based on `index === 0`. Replace the map inside `CollapsibleContent` (around lines 139–146):

```tsx
{FINANCAS_SUB_ITEMS.map((item) => (
  <FinancasSubItemRow
    key={item.id}
    item={item}
    isActive={location.pathname === item.path}
    handleNavClick={handleNavClick}
  />
))}
```

For `location` to be available inside `FinancasGroup`, pass it as a prop. Update the component signature:

```tsx
function FinancasGroup({
  isFinancasActive,
  financasOpen,
  setFinancasOpen,
  handleNavClick,
  currentPath,
}: {
  isFinancasActive: boolean;
  financasOpen: boolean;
  setFinancasOpen: (open: boolean) => void;
  handleNavClick: (path: string) => void;
  currentPath: string;
}) {
```

And update the map to use `currentPath`:

```tsx
{FINANCAS_SUB_ITEMS.map((item) => (
  <FinancasSubItemRow
    key={item.id}
    item={item}
    isActive={currentPath === item.path}
    handleNavClick={handleNavClick}
  />
))}
```

Then in `AppSidebar` where `FinancasGroup` is rendered (around line 319), add the `currentPath` prop:

```tsx
<FinancasGroup
  isFinancasActive={isFinancasActive}
  financasOpen={financasOpen}
  setFinancasOpen={setFinancasOpen}
  handleNavClick={handleNavClick}
  currentPath={location.pathname}
/>
```

- [ ] **Step 5: Remove FutureItems from `BOTTOM_MODULES` (already not there — verify)**

Check that `BOTTOM_MODULES` only contains Agenda:
```tsx
const BOTTOM_MODULES: Module[] = [
  { id: "calendar", name: "Agenda", icon: CalendarDaysIcon, path: "/calendar" },
];
```

No changes needed if already correct.

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/app-sidebar.tsx
git commit -m "feat(sidebar): update Financial sub-items to use real routes, add Conta and Cartão"
```

---

### Task 4: Add new Financial sub-routes and remove FutureItems from `App.jsx`

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Remove FutureItems lazy import and route**

In `src/App.jsx`, remove the lazy import line:
```js
// Remove:
const FutureItemsModule = lazy(() => import('./components/modules/FutureItems'));
```

Remove the wrapper component:
```js
// Remove:
const FutureItems = () => {
  return <FutureItemsModule />;
};
```

Remove the route inside `HomeLayout`'s `<Routes>`:
```jsx
// Remove:
<Route path="future" element={
  <Suspense fallback={<ExpenseListSkeleton />}>
    <FadeIn><FutureItems /></FadeIn>
  </Suspense>
} />
```

Also remove `ExpenseListSkeleton` from the skeletons import if it's no longer used anywhere else. Check the import line:
```js
import { DashboardSkeleton, ExpenseListSkeleton, FinancialSkeleton, ShoppingListSkeleton, TaskListSkeleton } from './components/skeletons';
```

Change to:
```js
import { DashboardSkeleton, FinancialSkeleton, ShoppingListSkeleton, TaskListSkeleton } from './components/skeletons';
```

- [ ] **Step 2: Add placeholder pages for new Financial sub-routes**

After the `Financial` wrapper component definition (around line 44), add four inline placeholder components:

```jsx
const FinancialGoals = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold">Metas</h1>
  </div>
);

const FinancialRecurrences = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold">Recorrências</h1>
  </div>
);

const FinancialAccount = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold">Conta</h1>
  </div>
);

const FinancialCard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold">Cartão</h1>
  </div>
);
```

- [ ] **Step 3: Add the new routes inside `HomeLayout`**

After the existing `/financial` route (around line 124), add:

```jsx
<Route path="financial/goals" element={
  <FadeIn><FinancialGoals /></FadeIn>
} />
<Route path="financial/recurrences" element={
  <FadeIn><FinancialRecurrences /></FadeIn>
} />
<Route path="financial/account" element={
  <FadeIn><FinancialAccount /></FadeIn>
} />
<Route path="financial/card" element={
  <FadeIn><FinancialCard /></FadeIn>
} />
```

- [ ] **Step 4: Verify TypeScript/JS compiles**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat(routing): add Financial sub-routes, remove FutureItems"
```

---

### Task 5: Manual verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify sidebar navigation**

Open `http://localhost:3000` in the browser. Check:
- Clicking **Finanças** in the sidebar expands the group and navigates to `/financial`
- The **Finanças** parent item stays highlighted (active) on all sub-routes
- Each sub-item navigates to its correct route:
  - Lançamentos → `/financial`
  - Metas → `/financial/goals`
  - Recorrências → `/financial/recurrences`
  - Conta → `/financial/account`
  - Cartão → `/financial/card`
- The active sub-item is highlighted when on its route
- Hover animations work on **Conta** (UserIcon) and **Cartão** (CreditCardIcon)
- No "Itens Futuros" appears anywhere in the sidebar

- [ ] **Step 3: Final commit if any cleanup was needed**

```bash
git add -A
git commit -m "chore(sidebar): cleanup after manual verification"
```
