import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AuthSkeleton() {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-background p-4"
      aria-busy="true"
      aria-live="polite"
      aria-label="Carregando autenticação"
    >
      <Card className="w-full max-w-[420px] rounded-3xl border-border/70 bg-card p-8 shadow-card space-y-6">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-4 w-52 rounded-md" />
        </div>

        {/* Social button */}
        <Skeleton className="h-11 w-full rounded-xl" />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-border/60" />
          <Skeleton className="h-3 w-6 rounded-md" />
          <div className="h-[1px] flex-1 bg-border/60" />
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded-md" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20 rounded-md" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>

        {/* Primary CTA */}
        <Skeleton className="h-11 w-full rounded-xl" />

        {/* Footer link */}
        <div className="flex justify-center pt-2">
          <Skeleton className="h-4 w-44 rounded-md" />
        </div>
      </Card>
    </div>
  );
}
