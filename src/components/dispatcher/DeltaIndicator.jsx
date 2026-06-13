import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../utils/cn";

export function DeltaIndicator({ value, className = "" }) {
  if (!value || value === 0) {
    return (
      <span
        className={cn(
          "flex items-center gap-0.5 text-xs text-neutral-400",
          className,
        )}
      >
        <Minus size={12} />
        0%
      </span>
    );
  }

  const isPositive = value > 0;
  const absValue = Math.abs(value);

  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-xs font-semibold",
        isPositive ? "text-success-fg" : "text-danger-fg",
        className,
      )}
    >
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {isPositive ? "+" : "-"}
      {absValue}%
    </span>
  );
}
