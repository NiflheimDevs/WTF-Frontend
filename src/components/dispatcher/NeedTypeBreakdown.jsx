import { Skeleton } from "../primitives/Skeleton";
import { useTranslation } from "../../context/LocaleContext";

export function NeedTypeBreakdown({ bottles, tanker, loading }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const items = [
    {
      type: "bottles",
      label: t("reporter.waterBottles"),
      icon: "💧",
      data: bottles,
      max: Math.max(bottles?.request_count || 0, tanker?.request_count || 0),
    },
    {
      type: "tanker",
      label: t("reporter.tankerTruck"),
      icon: "🚛",
      data: tanker,
      max: Math.max(bottles?.request_count || 0, tanker?.request_count || 0),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {items.map(({ type, label, icon, data, max }) => (
        <div key={type} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-medium text-neutral-700">
                {label}
              </span>
            </div>
            <div className="text-end">
              <span className="font-mono text-base font-semibold text-neutral-900">
                {data?.request_count || 0}
              </span>
              <span className="text-xs text-neutral-400 ms-1">
                {t("common.requests")}
              </span>
            </div>
          </div>

          <div className="bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((data?.request_count || 0) / max) * 100}%` }}
            />
          </div>

          <p className="text-xs text-neutral-400">
            {t("dashboard.totalQuantity", {
              count: (data?.total_quantity || 0).toLocaleString(),
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
