import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AccountSkeleton() {
  return (
    <div
      className="flex max-w-full flex-col gap-5 overflow-x-hidden"
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando contas bancárias"
    >
      {/* ── 1. Cabeçalho Padronizado ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-32 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-60 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
      </div>

      {/* ── 2. Placar HUD Hero (Estilo Modo Mercado) ── */}
      <Card className="rounded-3xl border-border/70 bg-card p-6 shadow-card space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-40 rounded-md" />
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-32 rounded-md" />
          </div>
          <div className="space-y-2 sm:text-right">
            <Skeleton className="h-3 w-32 rounded-md sm:ml-auto" />
            <Skeleton className="h-7 w-40 rounded-lg sm:ml-auto" />
            <Skeleton className="h-5 w-24 rounded-full sm:ml-auto" />
          </div>
        </div>

        {/* Progress distribution bar */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-36 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </div>

        {/* Insights bottom */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-4">
          <Skeleton className="h-4 w-48 rounded-md" />
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
      </Card>

      {/* ── 3. Filtros em Pílulas Deslizantes ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Skeleton className="h-8 w-20 rounded-full shrink-0" />
        <Skeleton className="h-8 w-24 rounded-full shrink-0" />
        <Skeleton className="h-8 w-24 rounded-full shrink-0" />
        <Skeleton className="h-8 w-24 rounded-full shrink-0" />
        <Skeleton className="h-8 w-20 rounded-full shrink-0" />
      </div>

      {/* ── 4. Grade de Cartões de Conta Bancária ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="flex flex-col justify-between rounded-3xl border-border/70 bg-card p-5 shadow-card min-h-[160px]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-6 w-28 rounded-md" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

