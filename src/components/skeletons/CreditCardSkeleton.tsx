export function CreditCardSkeleton() {
  return (
    <div className="p-6">
      <div className="h-8 w-40 rounded-md bg-muted animate-pulse mb-6" />
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex lg:flex-col gap-3 lg:w-[240px]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[120px] min-w-[220px] lg:min-w-0 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-24 rounded-xl bg-muted animate-pulse" />
            <div className="h-24 rounded-xl bg-muted animate-pulse" />
          </div>
          <div className="h-48 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  );
}
