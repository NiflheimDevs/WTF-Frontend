import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import {
  useMetricsSummary,
  useMetricsByRegion,
  useMetricsByNeedType,
} from "../hooks/useMetrics";
import { useRequests, useUpdateRequestStatus } from "../hooks/useRequests";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { KpiCard } from "../components/dispatcher/KpiCard";
import { RegionRankList } from "../components/dispatcher/RegionRankList";
import { NeedTypeBreakdown } from "../components/dispatcher/NeedTypeBreakdown";
import { RequestTable } from "../components/dispatcher/RequestTable";
import { RequestDetailDrawer } from "../components/dispatcher/RequestDetailDrawer";
import { KpiCardSkeleton } from "../components/primitives/Skeleton";
import { useTheme } from "../hooks/useTheme";
import { useSidebarMobile } from "../context/SidebarMobileContext";
import { useTranslation } from "../context/LocaleContext";
import { getDateLocale } from "../i18n";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const { mobileOpen, toggle, close } = useSidebarMobile();
  const { t, locale } = useTranslation();

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(() => new Date());

  const { data: metrics, isLoading: metricsLoading } = useMetricsSummary();
  const { data: regions, isLoading: regionsLoading } = useMetricsByRegion(8);
  const { data: breakdown, isLoading: breakdownLoading } =
    useMetricsByNeedType();
  const {
    data: requestsData,
    isLoading: requestsLoading,
    refetch,
  } = useRequests({ status: filterStatus });

  const updateStatus = useUpdateRequestStatus();

  const handleRefresh = useCallback(async () => {
    await refetch();
    setLastRefreshTime(new Date());
    toast.success(t("dashboard.refreshed"));
  }, [refetch, t]);

  const handleUpdateStatus = useCallback(
    async (id, status) => {
      await updateStatus.mutateAsync({ id, status });
    },
    [updateStatus],
  );

  const requests = requestsData?.requests || [];

  return (
    <div className="min-h-screen bg-neutral-0">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={close} />

      <TopBar
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={toggle}
        onRefresh={handleRefresh}
        refreshing={updateStatus.isPending}
      />

      <main className="pt-14 min-h-screen transition-all duration-200 ms-0 lg:ms-60">
        <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">
                {t("dashboard.title")}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                {t("dashboard.lastUpdated", {
                  time: lastRefreshTime.toLocaleTimeString(getDateLocale(locale)),
                })}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md px-3 py-2 transition-colors"
            >
              <RefreshCw
                size={13}
                className={updateStatus.isPending ? "animate-spin" : ""}
              />
              {t("common.refresh")}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {metricsLoading ? (
              <>
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
              </>
            ) : (
              <>
                <KpiCard
                  label={t("dashboard.totalRequests")}
                  value={metrics?.totalRequests || 0}
                  caption={t("dashboard.totalRequestsCaption")}
                />
                <KpiCard
                  label={t("dashboard.pending")}
                  value={metrics?.pendingRequests || 0}
                  intent={
                    metrics?.pendingRequests > 100
                      ? "danger"
                      : metrics?.pendingRequests > 50
                        ? "warning"
                        : "default"
                  }
                  caption={t("dashboard.pendingCaption")}
                />
                <KpiCard
                  label={t("dashboard.dispatched")}
                  value={metrics?.dispatchedRequests || 0}
                  caption={t("dashboard.dispatchedCaption")}
                />
                <KpiCard
                  label={t("dashboard.fulfilled")}
                  value={metrics?.fulfilledRequests || 0}
                  caption={t("dashboard.fulfilledCaption")}
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">
                {t("dashboard.topRegions")}
              </h2>
              <RegionRankList
                regions={regions || []}
                loading={regionsLoading}
              />
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-neutral-700 mb-4">
                {t("dashboard.breakdownByNeed")}
              </h2>
              <NeedTypeBreakdown
                bottles={breakdown?.bottles}
                tanker={breakdown?.tanker}
                loading={breakdownLoading}
              />
            </div>
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">
              {t("dashboard.recentRequests")}
            </h2>
            <RequestTable
              requests={requests}
              onUpdateStatus={handleUpdateStatus}
              loading={requestsLoading}
              filter={filterStatus}
              onFilterChange={setFilterStatus}
              updatingId={updateStatus.variables?.id}
              onRowClick={setSelectedRequest}
            />
          </div>
        </div>
      </main>

      <RequestDetailDrawer
        requestId={selectedRequest?.id}
        fallbackRequest={selectedRequest}
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
