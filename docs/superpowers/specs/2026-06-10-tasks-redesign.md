# Tasks Screen Redesign

**Date:** 2026-06-10  
**Status:** Approved  
**Goal:** Rebuild the Tasks screen UI/UX to match the current design language of the Financial module, adding a full-screen Kanban board with drag-and-drop and a rich header with daily progress.

---

## Overview

The current `Tasks.jsx` has good logic but a stale design — linen gradient header, `border-l-4` priority coloring, an inline quick-add bar, and a collapsible history section. The redesign brings it in line with the Financial module's visual language (clean cards, `rounded-3xl`, `font-editorial`/`font-ui`, lateral summary panel) while introducing two distinct view modes and a professional Kanban board.

---

## Two View Modes

### Mode 1 — List View (default)

Layout mirrors Financial: `grid grid-cols-1 lg:grid-cols-3`.

- **Main column (`lg:col-span-2`):** filter pills by category, inline add field, task list grouped by priority
- **Sidebar (`lg:col-span-1`):** Progress Summary card + Urgent & Overdue card

Above both columns: a rich header card with daily progress bar and alert chips.

### Mode 2 — Kanban View (full-screen)

When the user switches to Kanban:
- The header, sidebar, and main column grid disappear entirely
- A minimal sticky header replaces them (title + search + Lista/Kanban toggle + New Task button)
- The board occupies the full available width with 3 columns: **A Fazer**, **Em Andamento**, **Concluído**
- Columns scroll vertically and independently; the board scrolls horizontally on mobile

The toggle between modes lives in the rich header (List mode) and in the minimal header (Kanban mode).

---

## Layout: List View

```
RICH HEADER (rounded-3xl bg-card border)
  Title "Quadro de Tarefas"   [Lista][Kanban]  [+ Nova Tarefa]
  Progress bar: ████████░░  5 de 12 concluídas hoje
  Chips: ● 3 atrasadas  ● 2 urgentes

GRID (gap-6 items-start)
  ┌── Main col (2/3) ──────────────┐  ┌── Sidebar (1/3) ──────┐
  │ Pills: Todas | Limpeza | ...   │  │  Progress Summary card │
  │ [+ Adicionar tarefa...][Baixa] │  │  ──────────────────    │
  │ ── Urgente (2) ─────────────── │  │  Urgent & Overdue card │
  │   [TaskCard] [TaskCard]        │  └────────────────────────┘
  │ ── Alta (1) ────────────────── │
  │   [TaskCard]                   │
  └────────────────────────────────┘
```

---

## Layout: Kanban View

```
MINIMAL HEADER (sticky, bg-background border-b)
  "Quadro de Tarefas"  [search input]  [Lista][Kanban]  [+ Nova Tarefa]

BOARD (full width, overflow-x-auto)
  ┌── A Fazer (8) ──┐  ┌── Em Andamento (3) ──┐  ┌── Concluído (12) ──┐
  │ [+ Adicionar]   │  │  [+ Adicionar]        │  │                    │
  │ [KanbanCard]    │  │  [KanbanCard]          │  │  [KanbanCard] ✓    │
  │ [KanbanCard]    │  │                        │  │                    │
  └─────────────────┘  └───────────────────────┘  └────────────────────┘
```

---

## Components

### `TaskCard` (List mode)
- `rounded-2xl border border-border bg-card` — no colored left border
- Priority dot (`w-2 h-2 rounded-full`) to the left of the title
- Checkbox to mark complete
- Meta row: due date, category tag
- Overdue: date text becomes `text-destructive` + alert icon — no colored card background
- Action menu `⋯` (hover on desktop, always visible on mobile): Edit, Delete, Move to status
- Completed cards: title `line-through text-muted-foreground`, sage-colored checkbox

### `KanbanCard`
- No checkbox (status = column)
- Priority dot + title + due date + category
- Assigned member avatar if present
- Action menu `⋯`: Edit, Delete
- Drag handle (entire card is draggable)
- Drag state: source card at `opacity-50`, drag ghost at `scale(1.03)`

### `TaskProgressCard` (sidebar)
- `rounded-3xl bg-card border border-border p-6`
- `font-editorial` for numeric values
- Animated progress bar via Framer Motion: `animate={{ width: '${pct}%' }}`
- Stats: pending count, completed today, overdue, due this week

### `TaskUrgentCard` (sidebar)
- `rounded-3xl bg-card border border-border p-6`
- Compact list of urgent + overdue tasks (max 5, "ver todas" link)
- Clicking an item scrolls to and highlights the task in the main list
- No inline actions — navigation only

### `TaskInlineAdd` (main column, inline field)
- Appears at the top of the task list
- Default collapsed: shows `+ Adicionar tarefa...` placeholder with a priority select
- On focus: expands slightly, shows the priority dropdown
- Enter creates the task, Escape cancels
- Uses `createQuickTask` service — priority comes from the select (default: Baixa)

### `TaskFormModal` (new file: `src/components/modals/TaskFormModal.tsx`)
Extracted from the inline `TaskFormDialog` in `Tasks.jsx`. Follows `TransactionFormModal` pattern.

Fields:
- Título* (text input, maxLength 200)
- Prioridade (select: Urgente / Alta / Média / Baixa — default Baixa)
- Categoria (select: Geral / Limpeza / Manutenção / Finanças / Outros)
- Status (select: A Fazer / Em Andamento / Concluído — default A Fazer) ← NEW
- Data limite (DatePicker, optional)
- Descrição (textarea, 2 rows, optional)

Removed: "Informações extras" second textarea (simplified).

---

## Rich Header (List mode)

```tsx
// Progress bar
<motion.div
  className="h-2 rounded-full bg-primary"
  animate={{ width: `${completedPct}%` }}
  transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
/>
```

Alert chips use existing pill pattern from Financial filters:
- Overdue: `bg-terracotta-100 text-terracotta-700`
- Urgent: `bg-honey-100 text-honey-700`
- Completed today: `bg-sage-100 text-sage-700`

---

## Priority Colors (dots only — no card backgrounds)

| Priority | Dot class | Badge class |
|---|---|---|
| Urgente (0) | `bg-terracotta-600` | `bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/40 dark:text-terracotta-300` |
| Alta (1) | `bg-honey-500` | `bg-honey-100 text-honey-700 dark:bg-honey-900/40 dark:text-honey-300` |
| Média (2) | `bg-honey-300` | `bg-linen-200 text-honey-700 dark:bg-linen-900/30 dark:text-honey-200` |
| Baixa (3) | `bg-sage-400` | `bg-sage-100 text-sage-700 dark:bg-sage-900/40 dark:text-sage-300` |

---

## Kanban: Status Model

Tasks have a `status` field (new concept — maps to `TaskStatus` enum):
- `0` = A Fazer
- `1` = Em Andamento  
- `2` = Concluído

Completing a task via checkbox (List mode) sets `status = 2` AND `isCompleted = true`.  
Moving a card to "Concluído" column (Kanban) also sets `isCompleted = true`.  
Moving a card out of "Concluído" sets `isCompleted = false`.

The API `updateTask` call sends the new status. If the backend doesn't yet have a `status` field, client-side state tracks it and the call is a no-op for status only (graceful degradation).

---

## Drag-and-Drop

Library: `@dnd-kit/core` + `@dnd-kit/sortable`.

- `DndContext` wraps the entire board
- Each column is a `SortableContext` (vertical list strategy)
- Cards implement `useSortable`
- `onDragEnd`: if column changed → update task status; if same column → reorder (client-side only)
- Drag overlay: clone of the card at `scale(1.03)`, `shadow-xl`

---

## Animations

All animations gated by `usePrefersReducedMotion`.

| Element | Animation |
|---|---|
| Page cards | `fadeIn` + `slideUp` from `@/lib/animations`, staggered via `staggerChildren` |
| Progress bar | `motion.div` width transition, 0.6s ease |
| List mode → Kanban mode | `AnimatePresence` fade (no slide) |
| Task card enter | `opacity: 0→1, y: -6→0`, spring |
| Task card exit | `opacity: 0, x: -40, scale: 0.97` |
| Drag ghost | `scale(1.03)`, `shadow-xl` |

---

## File Structure

```
src/components/modules/
  Tasks.tsx                        ← rename + full rewrite from Tasks.jsx
  tasks/
    TaskCard.tsx                   ← List mode card
    KanbanCard.tsx                 ← Kanban mode card
    KanbanColumn.tsx               ← Single column with DnD context
    KanbanBoard.tsx                ← Full board (3 columns + minimal header)
    TaskProgressCard.tsx           ← Sidebar progress summary
    TaskUrgentCard.tsx             ← Sidebar urgent/overdue list
    TaskInlineAdd.tsx              ← Inline add field
    TaskListView.tsx               ← List mode layout (grid + sidebar)

src/components/modals/
  TaskFormModal.tsx                ← Extracted modal (new file)
```

---

## What's Removed

- Linen gradient header (`bg-gradient-to-r from-linen-400`)
- `border-l-4` colored priority borders on cards
- Standalone quick-add bar (replaced by `TaskInlineAdd` inline)
- Collapsible history section (removed from screen entirely)
- Second textarea "Informações extras" in the form
- `PriorityGroup` accordion wrapper (replaced by flat grouped list)
- `HistoryItem` component

---

## What's Preserved

- All task service calls (`getActiveTasks`, `createTask`, `updateTask`, `completeTask`, `uncompleteTask`, `deleteTask`, `createQuickTask`)
- Undo on delete (toast with "Desfazer")
- Category filter pills
- `useApp()` for `activeNestId`
- Dark mode support throughout
- `usePrefersReducedMotion` gating all motion
- Mobile FAB (`+ Nova Tarefa`) for small screens
