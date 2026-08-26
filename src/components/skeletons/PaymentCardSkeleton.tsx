export function PaymentCardSkeleton() {
  return (
    <div className="p-6">
      <div className="mb-6 h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex gap-3 lg:w-[240px] lg:flex-col">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[120px] min-w-[220px] animate-pulse rounded-2xl bg-muted lg:min-w-0"
            />
          ))}
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
            <div className="h-24 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="h-48 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
