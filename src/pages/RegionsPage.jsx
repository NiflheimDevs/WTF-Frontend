import { useState, useMemo } from "react";
import { useTheme } from "../hooks/useTheme";
import { useSidebarMobile } from "../context/SidebarMobileContext";
import { useMetricsByRegion } from "../hooks/useMetrics";
import { useCountries, useCities } from "../hooks/useRegions";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { RegionHierarchyFilters } from "../components/regions/RegionHierarchyFilters";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/primitives/Card";
import { Input } from "../components/primitives/Input";
import { Badge } from "../components/primitives/Badge";
import { Skeleton } from "../components/primitives/Skeleton";
import { Search, MapPin, Activity } from "lucide-react";
import { useTranslation } from "../context/LocaleContext";
import { getRegionName, getRegionSecondaryName } from "../utils/regionName";
import { formatNumber } from "../utils/localeDigits";

export default function RegionsPage() {
  const { theme, toggleTheme } = useTheme();
  const { mobileOpen, toggle, close } = useSidebarMobile();
  const { t, locale } = useTranslation();

  const [countryId, setCountryId] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: countries = [] } = useCountries();
  const { data: cities = [], isLoading: citiesLoading } = useCities(provinceId);
  const { data: regionMetrics = [], isLoading: metricsLoading } =
    useMetricsByRegion(50);

  const selectedCountryId =
    countryId || (countries.length === 1 ? countries[0]?.id : "") || "";

  const metricsByCityId = useMemo(
    () => new Map(regionMetrics.map((metric) => [metric.id, metric.count])),
    [regionMetrics],
  );

  const displayedCities = useMemo(() => {
    if (!provinceId) return [];

    return cities
      .filter(
        (city) =>
          !searchQuery.trim() ||
          city.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
          city.name_fa.includes(searchQuery),
      )
      .map((city) => ({
        ...city,
        count: metricsByCityId.get(city.id) ?? 0,
      }));
  }, [cities, provinceId, searchQuery, metricsByCityId]);

  const isLoading = provinceId && (citiesLoading || metricsLoading);

  return (
    <div className="min-h-screen bg-neutral-0">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={close} />

      <TopBar
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={toggle}
        onRefresh={() => {}}
        refreshing={false}
      />

      <main className="pt-14 min-h-screen transition-all duration-200 ms-0 lg:ms-60">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-neutral-900">
              {t("regions.title")}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {t("regions.subtitle")}
            </p>
          </div>

          <Card className="mb-6">
            <RegionHierarchyFilters
              countryId={selectedCountryId}
              provinceId={provinceId}
              onCountryChange={(id) => {
                setCountryId(id);
                setProvinceId("");
                setSearchQuery("");
              }}
              onProvinceChange={(id) => {
                setProvinceId(id);
                setSearchQuery("");
              }}
              showCity={false}
              layout="row"
              size="sm"
              required={false}
            />
          </Card>

          {provinceId && (
            <Card className="mb-6">
              <div className="relative">
                <Search
                  className="absolute inset-s-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  size={18}
                />
                <Input
                  placeholder={t("regions.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10"
                />
              </div>
            </Card>
          )}

          {!provinceId && (
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500">{t("regions.selectProvinceHint")}</p>
            </div>
          )}

          {provinceId && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading
                ? [...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <Skeleton className="h-24 w-full" />
                    </Card>
                  ))
                : displayedCities.map((city) => (
                    <Card key={city.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                              <MapPin size={16} className="text-primary-500" />
                            </div>
                            <div>
                              <CardTitle>{getRegionName(city, locale)}</CardTitle>
                              <p className="text-xs text-neutral-400">
                                {getRegionSecondaryName(city, locale)}
                              </p>
                            </div>
                          </div>
                          {city.count > 0 && (
                            <Badge status="pending" size="sm">
                              {formatNumber(city.count, locale)}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Activity size={14} />
                            <span>{t("regions.totalRequests")}</span>
                          </div>
                          <span className="font-mono text-lg font-semibold text-neutral-900">
                            {formatNumber(city.count, locale)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          )}

          {provinceId && !isLoading && displayedCities.length === 0 && (
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500">{t("regions.noRegionsFound")}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
