import { cn } from "../../utils/cn";

export function Skeleton({
  className = "",
  variant = "rectangular",
  count = 1,
}) {
  const variants = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded",
  };

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-shimmer bg-neutral-100",
              variants[variant],
              className,
            )}
          />
        ))}
      </>
    );
  }

  return (
    <div
      className={cn(
        "animate-shimmer bg-neutral-100",
        variants[variant],
        className,
      )}
    />
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 flex flex-col gap-3">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 7, rows = 5 }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
