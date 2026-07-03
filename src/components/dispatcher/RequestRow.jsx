import { useState } from "react";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { relativeTime } from "../../utils/formatters";
import { useTranslation } from "../../context/LocaleContext";
import { cn } from "../../utils/cn";
import { getRequestRegionName } from "../../utils/regionName";
import { formatNumber } from "../../utils/localeDigits";
import { Droplet, Truck } from "lucide-react";

export function RequestRow({
  request,
  onUpdateStatus,
  onRowClick,
  isUpdating,
  regionsById,
}) {
  const { t, locale } = useTranslation();
  const [confirmingAction, setConfirmingAction] = useState(null);
  const [localUpdating, setLocalUpdating] = useState(false);

  const getNeedIcon = (needType) => {
    return needType === "bottled_water" ? (
      <Droplet size={18} className="text-cyan-600 dark:text-cyan-400" />
    ) : (
      <Truck size={18} className="text-orange-500 dark:text-orange-400" />
    );
  };

  const handleConfirm = async (nextStatus) => {
    setLocalUpdating(true);
    setConfirmingAction(null);
    try {
      await onUpdateStatus(request.id, nextStatus);
    } finally {
      setLocalUpdating(false);
    }
  };

  const getActionButtons = () => {
    if (request.status === "fulfilled" || request.status === "cancelled") {
      return <span className="text-neutral-400 text-sm">—</span>;
    }

    const primaryAction =
      request.status === "pending"
        ? { label: t("requests.dispatch"), next: "dispatched", variant: "info" }
        : {
            label: t("requests.markFulfilled"),
            next: "fulfilled",
            variant: "success",
          };

    if (confirmingAction) {
      const isCancel = confirmingAction === "cancel";

      return (
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              handleConfirm(isCancel ? "cancelled" : primaryAction.next)
            }
            className={cn(
              "text-xs font-semibold rounded px-2 py-1 transition-colors cursor-pointer",
              isCancel
                ? "text-danger-fg bg-danger-bg hover:bg-danger-bg/80"
                : "text-success-fg bg-success-bg hover:bg-success-bg/80",
            )}
          >
            {localUpdating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : isCancel ? (
              t("requests.confirmCancel")
            ) : (
              t("common.confirm")
            )}
          </button>
          <button
            onClick={() => setConfirmingAction(null)}
            className="text-xs font-semibold text-red-400 hover:text-neutral-700 px-1 cursor-pointer"
          >
            {t("common.cancel")}
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => setConfirmingAction("primary")}
          disabled={isUpdating}
          className={cn(
            "text-xs font-semibold rounded-md px-2.5 py-1 transition-colors duration-100 whitespace-nowrap cursor-pointer",
            primaryAction.variant === "info" &&
              "bg-info-bg text-info-fg hover:bg-info-bg/80",
            primaryAction.variant === "success" &&
              "bg-success-bg text-success-fg hover:bg-success-bg/80",
            isUpdating && "opacity-50 cursor-not-allowed",
          )}
        >
          {isUpdating ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            primaryAction.label
          )}
        </button>
        <button
          onClick={() => setConfirmingAction("cancel")}
          disabled={isUpdating}
          className={cn(
            "text-xs font-semibold rounded-md px-2.5 py-1 transition-colors duration-100 whitespace-nowrap cursor-pointer",
            "bg-danger-bg text-danger-fg hover:bg-danger-bg/80",
            isUpdating && "opacity-50 cursor-not-allowed",
          )}
        >
          {t("requests.cancelRequest")}
        </button>
      </div>
    );
  };

  return (
    <tr
      onClick={() => onRowClick?.(request)}
      className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors duration-100 cursor-pointer group"
    >
      <td className="px-4 py-3 font-mono text-xs text-neutral-400 group-hover:text-primary-500 transition-colors whitespace-nowrap">
        <span className="ltr-isolate" dir="ltr">
          {String(request.id ?? "")}
        </span>
      </td>
      <td className="px-4 py-3 text-neutral-700 font-medium max-w-37.5 truncate">
        {getRequestRegionName(request, locale, regionsById) ||
          t("common.unknown")}
      </td>
      <td className="px-4 py-3 text-center text-lg">
        {getNeedIcon(request.need_type)}
      </td>
      <td className="px-4 py-3 font-mono text-neutral-700 text-end">
        {formatNumber(request.quantity, locale)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={request.status} size="sm" />
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500 font-mono whitespace-nowrap">
        {relativeTime(request.created_at, locale)}
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        {getActionButtons()}
      </td>
    </tr>
  );
}
