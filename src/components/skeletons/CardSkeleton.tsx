import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

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
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    </Card>
  );
}
