import { cn } from "../../utils/cn";

const statusConfig = {
  pending: { label: "Pending", variant: "warning", icon: "⏳" },
  dispatched: { label: "Dispatched", variant: "info", icon: "🚛" },
  fulfilled: { label: "Fulfilled", variant: "success", icon: "✓" },
  cancelled: { label: "Cancelled", variant: "danger", icon: "✗" },
};

const variantStyles = {
  warning: "bg-warning-bg text-warning-fg",
  info: "bg-info-bg text-info-fg",
  success: "bg-success-bg text-success-fg",
  danger: "bg-danger-bg text-danger-fg",
};

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  className = "",
}) {
  const config = statusConfig[status] || {
    label: status,
    variant: "default",
    icon: null,
  };
  const sizes = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-sm gap-1.5",
    lg: "px-3 py-1.5 text-base gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantStyles[config.variant],
        sizes[size],
        className,
      )}
    >
      {showIcon && config.icon && (
        <span className="text-current opacity-80">{config.icon}</span>
      )}
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {config.label}
    </span>
  );
}
