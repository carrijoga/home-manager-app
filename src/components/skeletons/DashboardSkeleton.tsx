import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite" aria-label="Carregando painel inicial">
      {/* ── Row 1: Header do Dashboard ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-48 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-40 rounded-md" />
            {/* Member avatars */}
            <div className="flex -space-x-1.5">
              <Skeleton className="h-7 w-7 rounded-full border-2 border-background" />
              <Skeleton className="h-7 w-7 rounded-full border-2 border-background" />
              <Skeleton className="h-7 w-7 rounded-full border-2 border-background" />
            </div>
          </div>
        </div>

        {/* Weather & Action Pill */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-44 rounded-full sm:w-52" />
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        </div>
      </div>

      {/* ── Row 2: 3 Living Hero Widgets (Tarefas, Despensa, Agenda) ── */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="flex flex-col justify-between rounded-3xl border-border/60 bg-card p-4 shadow-card">
            <div className="flex items-start justify-between">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <div className="mt-4 space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-lg" />
            </div>
            <div className="mt-3 border-t border-border/40 pt-2.5">
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          </Card>
        ))}
      </div>

      {/* ── Row 3: Grid Central Bento (Tarefas, Compras/Despensa, Mural de Recados) ── */}
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
        {/* Bloco 1: Quadro de Tarefas (Caderno Espiral) */}
        <Card className="flex flex-col rounded-3xl border-border/60 bg-card p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-5 w-32 rounded-md" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="mt-4 space-y-3 flex-1">
            <Skeleton className="h-10 w-full rounded-xl" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 p-3">
                <Skeleton className="h-4 w-4 shrink-0 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Bloco 2: Despensa & Compras */}
        <Card className="flex flex-col rounded-3xl border-border/60 bg-card p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-5 w-36 rounded-md" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="mt-4 space-y-3 flex-1">
            <Skeleton className="h-10 w-full rounded-xl" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 p-3">
                <div className="flex items-center gap-2.5 flex-1">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-28 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-6 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </Card>

        {/* Bloco 3: Mural de Recados (Post-its) */}
        <Card className="flex flex-col rounded-3xl border-border/60 bg-card p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-5 w-32 rounded-md" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>

          <div className="mt-4 space-y-3.5 flex-1">
            {[0, 1].map((i) => (
              <div key={i} className="flex flex-col justify-between rounded-2xl border border-border/50 bg-muted/40 p-4 min-h-[110px]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-20 rounded-md" />
                    <Skeleton className="h-3.5 w-12 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-4/5 rounded-md" />
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/30">
                  <Skeleton className="h-3 w-24 rounded-md" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
