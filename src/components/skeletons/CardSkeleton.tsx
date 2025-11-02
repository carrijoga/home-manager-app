import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  className?: string;
  lines?: number;
}

export function CardSkeleton({ className = "", lines = 3 }: CardSkeletonProps) {
  return (
    <Card className={className}>
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </Card>
  );
}

export function MetricCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <div className="space-y-3">
        {/* Header: Ícone + Título */}
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Valor Principal */}
        <Skeleton className="h-8 w-32" />

        {/* Comparação */}
        <div className="flex items-center space-x-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Mini Gráfico */}
        <Skeleton className="h-12 w-full" />

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 dark:border-dark-border-primary space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </Card>
  );
}
