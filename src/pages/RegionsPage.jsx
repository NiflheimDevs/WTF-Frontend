import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { useSidebarMobile } from "../context/SidebarMobileContext";
import { useMetricsByRegion } from "../hooks/useMetrics";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
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

  const [searchQuery, setSearchQuery] = useState("");

  const { data: regionMetrics = [], isLoading: metricsLoading } =
    useMetricsByRegion(50);

  const filteredMetrics = regionMetrics.filter(
    (region) =>
      region.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.name_fa.includes(searchQuery),
  );

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricsLoading
              ? [...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-24 w-full" />
                  </Card>
                ))
              : filteredMetrics.map((region) => (
                  <Card key={region.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                            <MapPin size={16} className="text-primary-500" />
                          </div>
                          <div>
                            <CardTitle>
                              {getRegionName(region, locale)}
                            </CardTitle>
                            <p className="text-xs text-neutral-400">
                              {getRegionSecondaryName(region, locale)}
                            </p>
                          </div>
                        </div>
                        {region.count > 0 && (
                          <Badge status="pending" size="sm">
                            {formatNumber(region.count, locale)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Activity size={14} />
                            <span>{t("regions.totalRequests")}</span>
                          </div>
                          <span className="font-mono text-lg font-semibold text-neutral-900">
                            {formatNumber(region.count, locale)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {filteredMetrics.length === 0 && !metricsLoading && (
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
