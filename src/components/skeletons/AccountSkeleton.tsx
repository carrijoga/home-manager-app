export function AccountSkeleton() {
  return (
    <div className="flex max-w-full animate-pulse flex-col gap-6 overflow-x-hidden">
      <div className="flex items-center gap-3">
        <div className="h-[18px] w-[18px] shrink-0 rounded bg-muted" />
        <div className="space-y-1.5">
          <div className="h-7 w-40 rounded bg-muted" />
          <div className="h-4 w-56 rounded bg-muted" />
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="shrink-0 space-y-3 lg:w-[240px]">
          <div className="h-9 rounded-md bg-muted" />
          <div className="h-[88px] rounded-2xl bg-muted" />
          <div className="h-[88px] rounded-2xl bg-muted" />
        </div>
        <div className="h-64 flex-1 rounded-3xl bg-muted" />
      </div>
    </div>
  );
}
