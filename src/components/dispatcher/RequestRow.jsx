import { useState } from "react";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { relativeTime } from "../../utils/formatters";
import { useTranslation } from "../../context/LocaleContext";
import { cn } from "../../utils/cn";

export function RequestRow({
  request,
  onUpdateStatus,
  onRowClick,
  isUpdating,
}) {
  const { t, locale } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [localUpdating, setLocalUpdating] = useState(false);

  const getNeedIcon = (needType) => {
    return needType === "bottled_water" ? "💧" : "🚛";
  };

  const getActionButton = () => {
    if (request.status === "fulfilled" || request.status === "cancelled") {
      return <span className="text-neutral-400 text-sm">—</span>;
    }

    const action =
      request.status === "pending"
        ? { label: t("requests.dispatch"), next: "dispatched", variant: "info" }
        : {
            label: t("requests.markFulfilled"),
            next: "fulfilled",
            variant: "success",
          };

    if (confirming) {
      return (
        <div className="flex items-center gap-1">
          <button
            onClick={async () => {
              setLocalUpdating(true);
              setConfirming(false);
              await onUpdateStatus(request.id, action.next);
              setLocalUpdating(false);
            }}
            className="text-xs font-semibold text-success-fg bg-success-bg rounded px-2 py-1 hover:bg-success-bg/80 transition-colors cursor-pointer"
          >
            {localUpdating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              t("common.confirm")
            )}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs font-semibold text-red-400 hover:text-neutral-700 px-1 cursor-pointer"
          >
            {t("common.cancel")}
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => setConfirming(true)}
        disabled={isUpdating}
        className={cn(
          "text-xs font-semibold rounded-md px-2.5 py-1 transition-colors duration-100 whitespace-nowrap cursor-pointer",
          action.variant === "info" &&
            "bg-info-bg text-info-fg hover:bg-info-bg/80",
          action.variant === "success" &&
            "bg-success-bg text-success-fg hover:bg-success-bg/80",
          isUpdating && "opacity-50 cursor-not-allowed",
        )}
      >
        {isUpdating ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          action.label
        )}
      </button>
    );
  };

  return (
    <tr
      onClick={() => onRowClick?.(request.id)}
      className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors duration-100 cursor-pointer group"
    >
      <td className="px-4 py-3 font-mono text-xs text-neutral-400 group-hover:text-primary-500 transition-colors">
        {request.id.slice(0, 8)}
      </td>
      <td className="px-4 py-3 text-neutral-700 font-medium max-w-37.5 truncate">
        {request.region_name || request.region_id?.slice(0, 8) || t("common.unknown")}
      </td>
      <td className="px-4 py-3 text-center text-lg">
        {getNeedIcon(request.need_type)}
      </td>
      <td className="px-4 py-3 font-mono text-neutral-700 text-end">
        {request.quantity}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={request.status} size="sm" />
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500 font-mono whitespace-nowrap">
        {relativeTime(request.created_at, locale)}
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        {getActionButton()}
      </td>
    </tr>
  );
}
