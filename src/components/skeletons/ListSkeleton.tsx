import { Skeleton } from "@/components/ui/skeleton";

interface ListSkeletonProps {
  items?: number;
  className?: string;
}

export function ListSkeleton({ items = 5, className = "" }: ListSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-live="polite">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border border-dark-border-subtle bg-dark-bg-secondary">
          <Skeleton className="h-12 w-12 rounded-full" />
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
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border border-dark-border-subtle bg-dark-bg-secondary">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <div className="flex space-x-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShoppingListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-dark-border-subtle bg-dark-bg-secondary">
          <div className="flex items-center space-x-3 flex-1">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ExpenseListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-live="polite">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-dark-border-subtle bg-dark-bg-secondary">
          <div className="flex items-center space-x-4 flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
