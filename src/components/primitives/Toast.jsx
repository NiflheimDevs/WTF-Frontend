import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "../../utils/cn";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: "bg-success-bg text-success-fg border-success-fg/20",
  error: "bg-danger-bg text-danger-fg border-danger-fg/20",
  info: "bg-info-bg text-info-fg border-info-fg/20",
  warning: "bg-warning-bg text-warning-fg border-warning-fg/20",
};

export function Toast({ message, type = "info", onClose, duration = 4000 }) {
  const Icon = icons[type];

  useEffect(() => {
    if (duration === Infinity) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 p-3 rounded-lg border shadow-overlay animate-slide-in-right max-w-sm",
        styles[type],
      )}
    >
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} className="shrink-0 hover:opacity-70">
        <X size={14} />
      </button>
    </div>
  );
}
