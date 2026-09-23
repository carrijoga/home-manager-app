import { Skeleton } from '@/components/ui/skeleton';

interface ListSkeletonProps {
  items?: number;
  className?: string;
}

export function ListSkeleton({ items = 5, className = '' }: ListSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-live="polite">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 rounded-xl border border-border/60 bg-card p-4 shadow-subtle"
        >
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-2.5" aria-busy="true" aria-live="polite" aria-label="Carregando tarefas">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-3 shadow-subtle"
        >
          {/* Priority indicator dot */}
          <Skeleton className="mt-1.5 h-2 w-2 shrink-0 rounded-full" />
          {/* Checkbox box */}
          <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-md" />
          {/* Task content */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-5/6" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShoppingListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-2.5" aria-busy="true" aria-live="polite" aria-label="Carregando lista de compras">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 shadow-subtle"
        >
          <div className="flex flex-1 items-center space-x-3">
            <Skeleton className="h-4 w-4 shrink-0 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-14 rounded-md" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExpenseListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite" aria-label="Carregando despesas">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-subtle"
        >
          <div className="flex flex-1 items-center space-x-3.5">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="h-5 w-20 ml-auto" />
            <Skeleton className="h-3 w-14 rounded-full ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

