import { cn } from "../../utils/cn";
import { useTranslation } from "../../context/LocaleContext";

const statusVariants = {
  pending: { variant: "warning", icon: "⏳" },
  dispatched: { variant: "info", icon: "🚛" },
  fulfilled: { variant: "success", icon: "✓" },
  cancelled: { variant: "danger", icon: "✗" },
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
  const { t } = useTranslation();
  const config = statusVariants[status] || {
    variant: "default",
    icon: null,
  };
  const label = statusVariants[status] ? t(`status.${status}`) : status;

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
      {label}
    </span>
  );
}
