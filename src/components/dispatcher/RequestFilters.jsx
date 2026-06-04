import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../primitives/Button";
import { Input } from "../primitives/Input";

export function RequestFilters({ filters, onChange, onClose }) {
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
          Filter Requests
        </h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-neutral-100">
          <X size={16} className="text-neutral-400" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            Status
          </label>
          <select
            value={localFilters.status}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full h-10 px-3 rounded-md border border-neutral-200 bg-neutral-0 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="dispatched">Dispatched</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <Input
          label="Region ID"
          value={localFilters.regionId}
          onChange={(e) =>
            setLocalFilters((prev) => ({ ...prev, regionId: e.target.value }))
          }
          placeholder="Filter by region UUID"
        />

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="datetime-local"
              value={localFilters.from}
              onChange={(e) =>
                setLocalFilters((prev) => ({ ...prev, from: e.target.value }))
              }
              placeholder="From"
            />
            <Input
              type="datetime-local"
              value={localFilters.to}
              onChange={(e) =>
                setLocalFilters((prev) => ({ ...prev, to: e.target.value }))
              }
              placeholder="To"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleApply} fullWidth>
          Apply Filters
        </Button>
        <Button onClick={handleReset} variant="secondary" fullWidth>
          Reset
        </Button>
      </div>
    </div>
  );
}
