import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { cn } from "../../utils/cn";

export function KpiCard({
  label,
  value,
  caption,
  delta,
  sparkline,
  intent = "default",
  loading,
}) {
  const intentColor = {
    default: "text-neutral-900",
    warning: "text-warning-fg",
    danger: "text-danger-fg",
  };

  if (loading) {
    return (
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 flex flex-col gap-3">
        <div className="animate-shimmer h-3 w-28 rounded" />
        <div className="animate-shimmer h-10 w-20 rounded" />
        <div className="animate-shimmer h-8 w-full rounded" />
        <div className="animate-shimmer h-3 w-32 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 flex flex-col gap-2 hover:shadow-card transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-400">
          {label}
        </span>
        {delta && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold",
              delta.direction === "up" && "text-success-fg",
              delta.direction === "down" && "text-danger-fg",
              delta.direction === "neutral" && "text-neutral-400",
            )}
          >
            {delta.direction === "up" && <TrendingUp size={12} />}
            {delta.direction === "down" && <TrendingDown size={12} />}
            {delta.direction === "neutral" && <Minus size={12} />}
            {delta.value > 0 ? "+" : ""}
            {delta.value}%
          </span>
        )}
      </div>

      <p
        className={cn(
          "font-mono text-5xl font-bold tabular-nums leading-none",
          intentColor[intent],
        )}
      >
        {value}
      </p>

      {sparkline && <Sparkline data={sparkline} />}

      {caption && <p className="text-[13px] text-neutral-500">{caption}</p>}
    </div>
  );
}
