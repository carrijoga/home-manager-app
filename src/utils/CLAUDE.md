# src/utils/CLAUDE.md

Domain-specific utility functions for business logic and data transformation.

## Files

| File | Purpose |
|------|---------|
| `dashboardMetrics.ts` | Computes KPI metrics from task/financial/shopping data. Used by Dashboard module. |
| `formatters.js` | String formatting: currency, dates, names. General-purpose formatters (migrate to `.ts`). |

## dashboardMetrics.ts

Transforms raw data into metrics for the dashboard display:

```ts
import { calculateTaskMetrics, calculateFinancialMetrics } from '@/utils/dashboardMetrics'

const taskMetrics = calculateTaskMetrics(tasks, activeNestId)
// Returns: { completed, pending, overdue, completionRate }

const financialMetrics = calculateFinancialMetrics(expenses, dateRange)
// Returns: { totalSpent, byCategory, trend }
```

These are **pure functions** — they take data and return computed results. No side effects, no context reads.

### Usage in Components

Do NOT store metrics in global state. Compute them locally:

```ts
const Dashboard = () => {
  const { tasks } = useApp()
  const metrics = calculateTaskMetrics(tasks, activeNestId)
  
  return <MetricCard value={metrics.completionRate} ... />
}
```

This ensures metrics always reflect current data without context re-renders.

## formatters.js

String formatting utilities:

```ts
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters'

formatCurrency(1234.56) // "R$ 1.234,56" (Brazilian format)
formatDate(new Date()) // "19 de maio de 2026"
formatTime(new Date()) // "14:30"
```

Used everywhere dates/currency/times are displayed. **Migrate to `.ts` gradually.**

## Adding a New Utility

1. If it computes **metrics or dashboard stats** → `dashboardMetrics.ts`
2. If it **formats display values** → `formatters.js` (or `.ts` after migration)
3. If it's a **generic helper** → consider `src/lib/utils.ts`
