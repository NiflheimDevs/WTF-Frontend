import { Skeleton } from "../primitives/Skeleton";
import { useTranslation } from "../../context/LocaleContext";
import { getRegionName } from "../../utils/regionName";
import { formatNumber, toLocaleDigits } from "../../utils/localeDigits";

export function RegionRankList({ regions, loading, maxItems = 8 }) {
  const { t, locale } = useTranslation();

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(maxItems)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!regions || regions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-neutral-400">{t("dashboard.noRegionData")}</p>
      </div>
    );
  }

  const maxCount = Math.max(...regions.map((r) => r.count || 0));

  return (
    <div className="flex flex-col gap-1">
      {regions.slice(0, maxItems).map((region, index) => (
        <div
          key={region.id}
          className="flex items-center gap-3 py-1.5 rounded-md px-2 hover:bg-neutral-100 transition-colors duration-100 cursor-pointer group"
        >
          <span className="font-mono text-xs text-neutral-400 w-5 shrink-0">
            {toLocaleDigits(String(index + 1).padStart(2, "0"), locale)}
          </span>

          <span className="text-sm text-neutral-700 w-28 truncate shrink-0 group-hover:text-primary-500 transition-colors">
            {getRegionName(region, locale)}
          </span>

          <div className="flex-1 bg-neutral-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(region.count / maxCount) * 100}%` }}
            />
          </div>

          <span className="font-mono text-xs text-neutral-900 w-6 text-end shrink-0">
            {formatNumber(region.count, locale)}
          </span>
        </div>
      ))}
    </div>
  );
}
