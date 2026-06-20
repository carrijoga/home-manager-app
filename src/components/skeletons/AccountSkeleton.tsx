export function AccountSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-7 w-40 rounded bg-muted mb-6" />
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-[240px] shrink-0 space-y-3">
          <div className="h-10 rounded-md bg-muted" />
          <div className="h-20 rounded-2xl bg-muted" />
          <div className="h-20 rounded-2xl bg-muted" />
        </div>
        <div className="flex-1 h-48 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
