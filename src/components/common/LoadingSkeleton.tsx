import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-muted/20 rounded-xl", className)} />
  );
}

export function MediaGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <LoadingSkeleton className="aspect-[2/3] w-full" />
          <LoadingSkeleton className="h-4 w-3/4" />
          <LoadingSkeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <LoadingSkeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
