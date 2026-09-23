# src/components/CLAUDE.md

Components are split into distinct sub-directories by responsibility:

| Directory    | Purpose                                                                          |
| ------------ | -------------------------------------------------------------------------------- |
| `common/`    | Reusable UI primitives, animated cards, and widgets used across modules          |
| `financial/` | Financial-specific sub-components, cards, statement views, and transaction rows  |
| `modals/`    | Interactive forms, sheets, and dialogs (`PaymentCardSheet`, `TransactionSheet`)  |
| `modules/`   | Full feature views (`Dashboard`, `Tasks`, `Financial`, `FinancialV2`, etc.)      |
| `profile/`   | User profile management components, avatars, and security forms                  |
| `settings/`  | App settings modal and categorical preference panels (`settings/panels/`)        |
| `skeletons/` | Loading skeleton variants for each major view (`DashboardSkeleton`, etc.)        |
| `ui/`        | Shadcn/Radix-based primitive components — treat as vendor, rarely edit           |
| `animated/`  | Re-exports of animated wrappers (`AnimatedCard`, `AnimatedList`, etc.)           |

`Navigation.tsx` and `app-sidebar.tsx` live directly under `src/components/` — they are layout-level components.

## Naming Conventions

- `common/` — PascalCase, descriptive noun: `MetricCard`, `PostIt`, `BulletinBoard`
- `modules/` — PascalCase matching route: `Dashboard`, `Tasks`, `ShoppingList`, `FinancialV2`
- `skeletons/` — `<Module>Skeleton`: `DashboardSkeleton`, `TaskListSkeleton`, `FinancialSkeleton`
- Modal/sheet names end with `Modal` or `Sheet`: `SettingsModal`, `PaymentCardSheet`, `BankAccountSheet`

## File Extension Rules

- New components: always `.tsx`
- Existing module files: `Tasks.tsx`, `Financial.tsx`, `FinancialV2.tsx` are in TypeScript. Remaining `.jsx` module files (`Dashboard.jsx`, `Calendar.jsx`, `FutureItems.jsx`) migrate to `.tsx` gradually when editing.
- `ui/`, `modals/`, `financial/`, `profile/`, `settings/` components: always `.tsx`

## Form & Modal Conventions (Mandatory)

The new-transaction modal (`modals/transaction-sheet/`) is the reference implementation. New sheets/modals with forms must match it — do not invent a per-screen style.

### Choosing a picker control

Pick by **the nature of the data**, not by how many options happen to exist today:

| Data                                                                   | Control                                                        |
| ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| Closed enum / fixed domain — card type, payment method, priority, unit | Radix `Select`                                                 |
| User-owned records — categories, accounts, members, products           | Searchable combobox (`Popover` + `Command`)                    |
| Needs "create it right here"                                           | Combobox with an inline create action — see `CategoryCombobox` |

A closed enum stays a `Select` even if it has 20 entries; a user list stays a combobox even if it has 2. Size is not the criterion — whether the set is authored by the app or by the user is.

**Never use raw native `<select>`.** It ignores the app's theming and has no shared styling hook. Use the Radix `Select` from `@/components/ui`:

```tsx
<Select value={value} onValueChange={onChange}>
  <SelectTrigger id="field-id" className="border-border/40 bg-muted/30">
    <SelectValue placeholder="Selecionar…" />
  </SelectTrigger>
  <SelectContent>
    {options.map((o) => (
      <SelectItem key={o.id} value={o.id}>
        {o.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

Note: `SelectItem` cannot have an empty-string `value` (Radix throws). Represent "none selected" via the trigger's `placeholder`, not a `value=""` item.

**Field conventions:**

- Labels: `className="text-xs text-muted-foreground uppercase tracking-wide"`
- Inputs and select triggers: `className="bg-muted/30 border-border/40"`
- Wrap each field in `<div className="space-y-1.5">`
- Financial category pickers use `CategoryCombobox` (`common/`), not a bare Select

**Combobox trigger styling** — a combobox trigger is a `Button variant="outline"` with `role="combobox"` and `className="w-full justify-between font-normal"`. The selected value renders in `text-foreground`; the placeholder in `text-muted-foreground`. The popover is `className="w-[--radix-popover-trigger-width] p-0" align="start"` so it matches the trigger width.

There is deliberately no single shared combobox component: `CategoryCombobox` owns inline creation, while the Shopping dialogs (`ItemFormDialog`, `BulkEditDialog`) own type-to-open keyboard handling and a "none" sentinel item. Match whichever is closer to your case rather than forcing them together.

**Every Sheet/Dialog needs a title primitive** — `SheetTitle` (or `DialogTitle`), never a plain `<h2>`. Radix logs an accessibility error and the dialog is unlabelled for screen readers otherwise. If the title should be visually hidden, wrap it in `VisuallyHidden.Root` (see `SettingsModal`).

**Explain non-obvious required fields.** When a field is required for a reason the user can't infer, put a `HelpCircle` icon (lucide, `size={14}`) to the right of the label inside a `Tooltip`, with an `aria-label` on the trigger button. See the linked-account field in `PaymentCardSheet`.

**Never leave a form in an unsatisfiable state.** If validation requires a value, the UI must provide a way to supply it:

- Load the data the field needs (e.g. `PaymentCardSheet` loads bank accounts via `bankAccountService.listBankAccounts` before the sheet can require one)
- Render the control unconditionally when the field applies — do not gate it on `list.length > 0`, or the requirement becomes an invisible blocker
- When the list is genuinely empty, show guidance telling the user what to create first, instead of a silently disabled submit button

## Animated Components

`src/lib/animations.ts` defines shared Framer Motion variants. Prefer importing these over inline variant objects:

```ts
import { fadeIn, slideUp, staggerChildren } from '@/lib/animations';
```

Animated wrappers (`AnimatedCard`, `AnimatedList`, `AnimatedDialog`, etc.) live in `common/` and wrap their Radix/Shadcn counterparts. Use them instead of bare `ui/` components when the feature needs motion.

`usePrefersReducedMotion` from `@/hooks/usePrefersReducedMotion` must gate all motion — pass it as `disableAnimation` to animated wrappers.

## Animated Icons

**Prefer animated icons over static Lucide icons in interactive elements.** Animated icons live in `src/components/ui/animated-icons/` and follow the `forwardRef` + `startAnimation`/`stopAnimation` handle pattern.

Use animated icons for:

- Navbar and sidebar buttons
- Action buttons (refresh, submit, delete, etc.)
- Dropdown/menu triggers
- Any clickable or hoverable element where motion adds feedback

Use static Lucide icons for:

- Decorative/informational icons (inside cards, labels, empty states)
- Icons inside input fields
- Status indicators and badges
- Loading spinners (use `animate-spin` on Lucide directly)

**Wiring pattern** — always use `useRef` + `onMouseEnter`/`onMouseLeave` on the wrapper element:

```tsx
const iconRef = useRef<SomeIconHandle>(null);

<button
  onMouseEnter={() => iconRef.current?.startAnimation()}
  onMouseLeave={() => iconRef.current?.stopAnimation()}
>
  <SomeIcon ref={iconRef} size={18} />
</button>;
```

For programmatic triggers (e.g., animate on data arrival), call `startAnimation()` directly without hover wiring.

## Common Components — Key Reference

| Component                   | Usage                                                |
| --------------------------- | ---------------------------------------------------- |
| `MetricCard`                | KPI tile with label, value, optional trend           |
| `CarouselMetrics`           | Horizontal scrollable row of MetricCards             |
| `ModuleMetricWidget`        | Compact metric widget for Dashboard module summaries |
| `PostIt` / `AnimatedPostIt` | Sticky-note card for notices/announcements           |
| `EmptyState`                | Centered empty state with icon, title, description   |
| `GlobalSearch`              | App-wide search overlay                              |
| `DashboardHeader`           | Top header bar for the dashboard view                |
| `TopNavbar`                 | Top navigation bar (mobile-first)                    |
| `RequireAuth`               | Route guard — wraps protected routes in `App.jsx`    |
| `PageTransition`            | Wraps page content with enter/exit animations        |
| `FadeIn`                    | Simple opacity entrance wrapper                      |

## Module Components

Each module file is the full page view rendered by the router. They:

- Import data via `useApp()` — never call services directly
- Use skeleton components from `skeletons/` as the Suspense fallback
- Keep layout logic in the module file; extract sub-components to `common/` or `financial/` only when reused elsewhere

Modules in TypeScript: `Tasks.tsx`, `Financial.tsx`, `FinancialV2.tsx`.
Modules in JavaScript (migration candidates): `Dashboard.jsx`, `Calendar.jsx`, `FutureItems.jsx`, `ShoppingList.jsx`.

## Settings Panels

`settings/panels/` contains one panel per settings category. Each is a self-contained form. The parent `SettingsModal` renders them via `SettingsNav` tab selection. Panels map to routes: `geral`, `aparencia`, `conta`, `seguranca`, `dados-privacidade`, `sobre`.

## Skeletons

Always provide a skeleton for new module or heavy components. Export it from `skeletons/index.ts` and use it as the Suspense `fallback` in `App.jsx`.
