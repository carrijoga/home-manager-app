import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Skeleton da tela Financeiro — espelha fielmente o layout de FinancialV2 */
export function FinancialSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando financeiro"
    >
      {/* ── Top Bar de Navegação Rápida ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-12 rounded-md" />
          <span className="text-border">·</span>
          <Skeleton className="h-4 w-20 rounded-md" />
          <span className="text-border">·</span>
          <Skeleton className="h-4 w-14 rounded-md" />
          <span className="text-border">·</span>
          <Skeleton className="h-4 w-14 rounded-md" />
        </div>
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>

      {/* ── Header Superior: MonthNavigator + Botão Nova Transação ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-8 w-36 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      {/* ── Grade Superior de 4 KPIs Analíticos ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="flex flex-col gap-2 rounded-xl border-border/60 bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-28 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </Card>
        ))}
      </div>

      {/* ── Grade Principal: Coluna Lateral (Analytics) + Coluna Principal (Lançamentos) ── */}
      <div className="grid grid-cols-1 items-start gap-4 md:gap-6 lg:grid-cols-3">
        {/* Coluna Lateral — cards de análise e contas a vencer */}
        <div className="order-2 flex flex-col gap-4 lg:order-2 lg:col-span-1">
          {/* Card Resumo Mensal */}
          <Card className="rounded-2xl border-border/60 bg-card p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="space-y-2 pt-2 border-t border-border/40">
              <Skeleton className="h-3.5 w-full rounded-md" />
              <Skeleton className="h-3.5 w-4/5 rounded-md" />
            </div>
          </Card>

          {/* Card Contas a Vencer */}
          <Card className="rounded-2xl border-border/60 bg-card p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <div className="space-y-2.5 pt-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 p-3">
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-24 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Coluna Principal — barra de filtros + lista de transações */}
        <div className="order-1 flex flex-col gap-4 lg:order-1 lg:col-span-2">
          {/* Barra de Filtros */}
          <Card className="rounded-2xl border-border/60 bg-card p-3.5 shadow-card space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </Card>

          {/* Lista de Transações */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-subtle"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36 sm:w-48 rounded-md" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-20 rounded-md" />
                      <Skeleton className="h-3 w-16 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-3 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

