import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CardSkeletonProps {
  className?: string;
  lines?: number;
}

export function CardSkeleton({ className = '', lines = 3 }: CardSkeletonProps) {
  return (
    <Card className={`rounded-2xl border-border/60 p-5 shadow-card ${className}`}>
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </Card>
  );
}

export function MetricCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <Card className={`rounded-2xl border-border/60 p-4 shadow-card ${className}`}>
      <div className="space-y-3">
        {/* Header: Ícone + Título */}
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Valor Principal */}
        <Skeleton className="h-8 w-32" />

        {/* Comparação */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Mini Gráfico / Indicador */}
        <Skeleton className="h-8 w-full rounded-lg" />

        {/* Footer */}
        <div className="space-y-2 border-t border-border/50 pt-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </Card>
  );
}
