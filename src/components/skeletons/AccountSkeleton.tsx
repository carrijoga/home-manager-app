export function AccountSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-full overflow-x-hidden animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-[18px] w-[18px] rounded bg-muted shrink-0" />
        <div className="space-y-1.5">
          <div className="h-7 w-40 rounded bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-[240px] shrink-0 space-y-3">
          <div className="h-9 rounded-md bg-muted" />
          <div className="h-[88px] rounded-2xl bg-muted" />
          <div className="h-[88px] rounded-2xl bg-muted" />
        </div>
        <div className="flex-1 h-64 rounded-3xl bg-muted" />
      </div>
    </div>
  );
}
