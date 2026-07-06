import { cn } from "../../utils/cn";

const sizeStyles = {
  xs: "h-7 text-[11px] px-2.5",
  sm: "h-8 text-xs px-3",
};

// Compact pill-style toggle for small per-card controls (scope, threshold…).
export function SegmentedControl({
  options,
  value,
  onChange,
  size = "sm",
  className = "",
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md bg-neutral-100 p-0.5",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded font-medium border-none cursor-pointer transition-colors duration-150",
              sizeStyles[size],
              active
                ? "bg-neutral-0 text-neutral-900 shadow-card"
                : "bg-transparent text-neutral-500 hover:text-neutral-700",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
