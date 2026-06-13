import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRegions } from "../hooks/useRegions";
import { useTheme } from "../hooks/useTheme";
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
import { Search, MapPin, TrendingUp, Activity } from "lucide-react";
import { useTranslation } from "../context/LocaleContext";
import {
  getRegionName,
  getRegionSecondaryName,
} from "../utils/regionName";
import { formatNumber } from "../utils/localeDigits";

export default function RegionsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, locale } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: regions = [], isLoading: regionsLoading } = useRegions();
  const { data: metrics = [] } = useMetricsByRegion(50);

  const filteredRegions = regions.filter(
    (region) =>
      region.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.name_fa.includes(searchQuery),
  );

  const getMetricsForRegion = (regionId) => {
    return metrics.find((m) => m.id === regionId);
  };

  return (
    <div className="min-h-screen bg-neutral-0">
      <Sidebar
        user={user}
        onLogout={logout}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <TopBar
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={() => setMobileMenuOpen((open) => !open)}
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
                className="absolute start-3 top-1/2 -translate-y-1/2 text-neutral-400"
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
            {filteredRegions.map((region) => {
              const regionMetrics = getMetricsForRegion(region.id);
              return (
                <Card key={region.id} hover className="cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                          <MapPin size={16} className="text-primary-500" />
                        </div>
                        <div>
                          <CardTitle>{getRegionName(region, locale)}</CardTitle>
                          <p className="text-xs text-neutral-400">
                            {getRegionSecondaryName(region, locale)}
                          </p>
                        </div>
                      </div>
                      {regionMetrics && regionMetrics.count > 0 && (
                        <Badge status="pending" size="sm" />
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
                          {formatNumber(regionMetrics?.count || 0, locale)}
                        </span>
                      </div>

                      {regionMetrics?.count > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <TrendingUp size={14} />
                            <span>{t("regions.activeNeeds")}</span>
                          </div>
                          <span className="text-sm text-warning-fg font-medium">
                            {t("regions.requiresAttention")}
                          </span>
                        </div>
                      )}

                      <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(((regionMetrics?.count || 0) / 100) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredRegions.length === 0 && !regionsLoading && (
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
