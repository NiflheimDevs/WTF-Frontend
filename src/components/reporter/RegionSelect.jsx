import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { Skeleton } from "../primitives/Skeleton";
import { useTranslation } from "../../context/LocaleContext";
import { getRegionName } from "../../utils/regionName";

export function RegionSelect({ value, onChange, regions, loading, error }) {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const selected = regions?.find((r) => r.id === value);

  const filtered = search.trim()
    ? regions?.filter(
        (r) =>
          r.name_en.toLowerCase().includes(search.toLowerCase()) ||
          r.name_fa.includes(search),
      )
    : regions;

  const regionsById = new Map((regions || []).map((r) => [r.id, r]));

  const getDistrictName = (region) => {
    if (!region.parent_id) return t("common.other");
    const parent = regionsById.get(region.parent_id);
    return parent ? getRegionName(parent, locale) : t("common.other");
  };

  const grouped = filtered?.reduce((acc, region) => {
    const district = getDistrictName(region);
    if (!acc[district]) acc[district] = [];
    acc[district].push(region);
    return acc;
  }, {});

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return <Skeleton className="h-11 w-full" />;
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block mb-1.5 text-sm font-semibold text-neutral-700">
        {t("reporter.region")} <span className="text-danger-fg">*</span>
      </label>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`
          w-full h-11 px-3 flex items-center justify-between bg-neutral-0 rounded-md text-base font-sans cursor-pointer
          transition-all duration-200 border
          ${error ? "border-danger-fg" : "border-neutral-200 hover:border-primary-500"}
          ${selected ? "text-neutral-900 font-semibold" : "text-neutral-400"}
        `}
      >
        <span>
          {selected ? getRegionName(selected, locale) : t("reporter.selectRegion")}
        </span>
        <ChevronDown
          size={16}
          className={`text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {error && <p className="mt-1 text-xs text-danger-fg">{error}</p>}

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-neutral-0 border border-neutral-200 rounded-lg shadow-overlay overflow-hidden animate-fade-in">
          <div className="p-2 border-b border-neutral-200">
            <div className="relative">
              <Search
                size={14}
                className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("reporter.searchRegion")}
                className="w-full h-9 ps-9 pe-3 text-sm border border-neutral-200 rounded-md bg-neutral-50 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {Object.entries(grouped || {}).map(([district, districtRegions]) => (
              <div key={district}>
                <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-neutral-400 bg-neutral-50">
                  {district}
                </div>
                {districtRegions.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => {
                      onChange(region.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`
                      w-full px-3 py-2.5 flex items-center justify-between text-start cursor-pointer
                      transition-colors duration-100 hover:bg-neutral-50
                      ${value === region.id ? "bg-primary-50 text-primary-700 font-semibold" : "text-neutral-700"}
                    `}
                  >
                    <span>{getRegionName(region, locale)}</span>
                    {value === region.id && (
                      <Check size={16} className="text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            ))}

            {filtered?.length === 0 && (
              <div className="px-3 py-6 text-center text-neutral-500 text-sm">
                {t("reporter.noRegionsFound")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
