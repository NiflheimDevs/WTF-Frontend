import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { Skeleton } from "../primitives/Skeleton";

export function RegionSelect({ value, onChange, regions, loading, error }) {
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

  const grouped = filtered?.reduce((acc, region) => {
    const district = region.parent_id || "Other";
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
        Region <span className="text-danger-fg">*</span>
      </label>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`
          w-full h-11 px-3 flex items-center justify-between bg-neutral-0 rounded-md text-base font-sans
          transition-all duration-200 border
          ${error ? "border-danger-fg" : "border-neutral-200 hover:border-primary-500"}
          ${selected ? "text-neutral-900 font-semibold" : "text-neutral-400"}
        `}
      >
        <span>{selected ? selected.name_en : "Select your region…"}</span>
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
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search region..."
                className="w-full h-9 pl-9 pr-3 text-sm border border-neutral-200 rounded-md bg-neutral-50 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {Object.entries(grouped || {}).map(([district, regions]) => (
              <div key={district}>
                <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-neutral-400 bg-neutral-50">
                  {district}
                </div>
                {regions.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => {
                      onChange(region.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`
                      w-full px-3 py-2.5 flex items-center justify-between text-left
                      transition-colors duration-100 hover:bg-neutral-50
                      ${value === region.id ? "bg-primary-50 text-primary-700 font-semibold" : "text-neutral-700"}
                    `}
                  >
                    <span>{region.name_en}</span>
                    {value === region.id && (
                      <Check size={16} className="text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            ))}

            {filtered?.length === 0 && (
              <div className="px-3 py-6 text-center text-neutral-500 text-sm">
                No regions found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
