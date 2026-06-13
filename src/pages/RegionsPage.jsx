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

export default function RegionsPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

      <main className="pt-14 min-h-screen transition-all duration-200 ml-0 lg:ml-60">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-neutral-900">Regions</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Monitor water supply needs by region
            </p>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                size={18}
              />
              <Input
                placeholder="Search regions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Regions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRegions.map((region) => {
              const metrics = getMetricsForRegion(region.id);
              return (
                <Card key={region.id} hover className="cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                          <MapPin size={16} className="text-primary-500" />
                        </div>
                        <div>
                          <CardTitle>{region.name_en}</CardTitle>
                          <p className="text-xs text-neutral-400">
                            {region.name_fa}
                          </p>
                        </div>
                      </div>
                      {metrics && metrics.count > 0 && (
                        <Badge status="pending" size="sm" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Activity size={14} />
                          <span>Total Requests</span>
                        </div>
                        <span className="font-mono text-lg font-semibold text-neutral-900">
                          {metrics?.count || 0}
                        </span>
                      </div>

                      {metrics?.count > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <TrendingUp size={14} />
                            <span>Active Needs</span>
                          </div>
                          <span className="text-sm text-warning-fg font-medium">
                            Requires attention
                          </span>
                        </div>
                      )}

                      <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(((metrics?.count || 0) / 100) * 100, 100)}%`,
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
              <p className="text-neutral-500">No regions found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
