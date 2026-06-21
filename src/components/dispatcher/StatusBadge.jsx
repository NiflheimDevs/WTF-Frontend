import { cn } from "../../utils/cn";
import { useTranslation } from "../../context/LocaleContext";
import { CheckCircle, Clock, Truck, XCircle } from "lucide-react";

const statusVariants = {
  pending: {
    variant: "warning",
    icon: <Clock size={14} className="text-yellow-500 dark:text-yellow-400" />,
  },
  dispatched: {
    variant: "info",
    icon: <Truck size={14} className="text-blue-500 dark:text-blue-400" />,
  },
  fulfilled: {
    variant: "success",
    icon: (
      <CheckCircle size={14} className="text-green-500 dark:text-green-400" />
    ),
  },
  cancelled: {
    variant: "danger",
    icon: <XCircle size={14} className="text-red-500 dark:text-red-400" />,
  },
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
      {showIcon && config.icon && <>{config.icon}</>}
      {label}
    </span>
  );
}
