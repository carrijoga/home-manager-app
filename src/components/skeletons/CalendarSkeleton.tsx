import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CalendarSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite" aria-label="Carregando calendário">
      {/* Header do Módulo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
      </div>

      {/* Card Principal do Calendário */}
      <Card className="rounded-3xl border-border/70 bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-6 w-36 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>

        {/* Grade do Mês: Dias da semana + células */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-6 w-full rounded-md" />
          ))}
          {Array.from({ length: 28 }).map((_, i) => (
            <Skeleton key={`c-${i}`} className="h-16 sm:h-20 w-full rounded-xl" />
          ))}
        </div>
      </Card>
    </div>
  );
}
