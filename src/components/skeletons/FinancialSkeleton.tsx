/** Skeleton da tela Financeiro — espelha o layout lista + coluna lateral. */
export function FinancialSkeleton() {
  return (
    <div
      className="flex animate-pulse flex-col gap-6"
      aria-busy="true"
      aria-label="Carregando financeiro"
    >
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded-full bg-muted" />
        <div className="h-9 w-40 rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="h-10 rounded-full bg-muted" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="flex flex-col gap-3 md:gap-6">
          <div className="h-40 rounded-3xl bg-muted" />
          <div className="h-36 rounded-3xl bg-muted" />
          <div className="h-44 rounded-3xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
