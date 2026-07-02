import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../primitives/Button";
import { Input } from "../primitives/Input";
import { useTranslation } from "../../context/LocaleContext";
import { useRegions } from "../../hooks/useRegions";
import { getRegionName } from "../../utils/regionName";

export function RequestFilters({ filters, onChange, onClose }) {
  const { t, locale } = useTranslation();
  const { data: regions = [] } = useRegions();
  const [localFilters, setLocalFilters] = useState({
    status: filters.status || "all",
    regionId: filters.regionId || "",
    from: filters.from || "",
    to: filters.to || "",
  });

  const handleApply = () => {
    onChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = { status: "all", regionId: "", from: "", to: "" };
    setLocalFilters(resetFilters);
    onChange(resetFilters);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700">
          {t("requests.filterTitle")}
        </h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-neutral-100">
          <X size={16} className="text-neutral-400" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            {t("requests.table.status")}
          </label>
          <select
            value={localFilters.status}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-neutral-0 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">{t("requests.allStatuses")}</option>
            <option value="pending">{t("status.pending")}</option>
            <option value="dispatched">{t("status.dispatched")}</option>
            <option value="fulfilled">{t("status.fulfilled")}</option>
            <option value="cancelled">{t("status.cancelled")}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            {t("requests.table.region")}
          </label>
          <select
            value={localFilters.regionId}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, regionId: e.target.value }))
            }
            className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-neutral-0 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="">{t("regions.allRegions") || t("status.all")}</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {getRegionName(region, locale)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            {t("requests.dateRange")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="datetime-local"
              value={localFilters.from}
              onChange={(e) =>
                setLocalFilters((prev) => ({ ...prev, from: e.target.value }))
              }
              placeholder={t("common.from")}
            />
            <Input
              type="datetime-local"
              value={localFilters.to}
              onChange={(e) =>
                setLocalFilters((prev) => ({ ...prev, to: e.target.value }))
              }
              placeholder={t("common.to")}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleApply} fullWidth>
          {t("requests.applyFilters")}
        </Button>
        <Button onClick={handleReset} variant="secondary" fullWidth>
          {t("common.reset")}
        </Button>
      </div>
    </div>
  );
}
