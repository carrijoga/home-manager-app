import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PaymentCardSkeleton() {
  return (
    <div
      className="flex max-w-full flex-col gap-5 overflow-x-hidden"
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando cartões e faturas"
    >
      {/* ── 1. Cabeçalho Padronizado ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-32 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>

      {/* ── 2. Placar HUD Hero (Limites e Faturas) ── */}
      <Card className="rounded-3xl border-border/70 bg-card p-6 shadow-card space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-44 rounded-md" />
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-36 rounded-md" />
          </div>
          <div className="space-y-2 sm:text-right">
            <Skeleton className="h-3 w-36 rounded-md sm:ml-auto" />
            <Skeleton className="h-7 w-40 rounded-lg sm:ml-auto" />
            <Skeleton className="h-5 w-28 rounded-full sm:ml-auto" />
          </div>
        </div>

        {/* Progress limit bar */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-36 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </div>

        {/* Insights bottom */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-4">
          <Skeleton className="h-4 w-52 rounded-md" />
          <Skeleton className="h-4 w-44 rounded-md" />
        </div>
      </Card>

      {/* ── 3. Filtros em Pílulas ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Skeleton className="h-8 w-20 rounded-full shrink-0" />
        <Skeleton className="h-8 w-24 rounded-full shrink-0" />
        <Skeleton className="h-8 w-24 rounded-full shrink-0" />
        <Skeleton className="h-8 w-20 rounded-full shrink-0" />
      </div>

      {/* ── 4. Layout 2 Colunas (Lista de Cartões + Detalhes da Fatura) ── */}
      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Coluna Esquerda: Cartões de Crédito */}
        <div className="flex gap-3 overflow-x-auto pb-2 lg:w-[320px] lg:flex-col lg:overflow-visible lg:pb-0 shrink-0">
          {[0, 1].map((i) => (
            <Card key={i} className="flex flex-col justify-between rounded-3xl border-border/70 bg-card p-5 shadow-card min-w-[280px] lg:min-w-0 h-[170px]">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
                <Skeleton className="h-6 w-10 rounded-md" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-36 rounded-md" />
                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Coluna Direita: Detalhes da Fatura Selecionada */}
        <div className="flex-1 space-y-4">
          <Card className="rounded-3xl border-border/70 bg-card p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-3.5 w-48 rounded-md" />
              </div>
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/40 bg-muted/30 p-4 space-y-2">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
              <div className="rounded-2xl border border-border/40 bg-muted/30 p-4 space-y-2">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-32 rounded-md" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 p-3">
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-36 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

