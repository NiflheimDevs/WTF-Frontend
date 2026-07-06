import { useState, useCallback, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import {
  useMetricsSummary,
  useMetricsByRegion,
  useMetricsByNeedType,
  useMetricsTimeSeries,
  useMetricsDispatchers,
  useMetricsFunnel,
} from "../hooks/useMetrics";
import { useRequests, useUpdateRequestStatus } from "../hooks/useRequests";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { KpiCard } from "../components/dispatcher/KpiCard";
import { RegionRankList } from "../components/dispatcher/RegionRankList";
import { NeedTypeBreakdown } from "../components/dispatcher/NeedTypeBreakdown";
import { TimeSeriesChart } from "../components/dispatcher/TimeSeriesChart";
import { DispatchFunnel } from "../components/dispatcher/DispatchFunnel";
import { DispatcherLeaderboard } from "../components/dispatcher/DispatcherLeaderboard";
import { RequestTable } from "../components/dispatcher/RequestTable";
import { RequestDetailDrawer } from "../components/dispatcher/RequestDetailDrawer";
import { SegmentedControl } from "../components/primitives/SegmentedControl";
import { KpiCardSkeleton } from "../components/primitives/Skeleton";
import { useTheme } from "../hooks/useTheme";
import { useSidebarMobile } from "../context/SidebarMobileContext";
import { useTranslation } from "../context/LocaleContext";
import { getDateLocale } from "../i18n";
import { toLocaleDigits } from "../utils/localeDigits";
import toast from "react-hot-toast";

// ── Date helpers (timeseries uses ISO "YYYY-MM-DD" date strings) ───────────
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Preset → inclusive {from, to} in ISO date form. `to` is always today and
// `from` is N days back (inclusive), matching the API's default 7-day window.
function presetRange(presetStr) {
  const days = Number(presetStr) || 7;
  const to = new Date();
  to.setHours(0, 0, 0, 0);
  const from = new Date(to);
  from.setDate(from.getDate() - (days - 1));
  return { from: toISODate(from), to: toISODate(to) };
}

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const { mobileOpen, toggle, close } = useSidebarMobile();
  const { t, locale } = useTranslation();

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(() => new Date());

  // Chart / section control state
  const [tsPreset, setTsPreset] = useState("7");
  const [tsRegionId, setTsRegionId] = useState("");
  const [tsGroupByNeed, setTsGroupByNeed] = useState(false);
  const [funnelThreshold, setFunnelThreshold] = useState(24);
  const [dispatcherScope, setDispatcherScope] = useState("");
  const [breakdownScope, setBreakdownScope] = useState("");

  const { data: metrics, isLoading: metricsLoading } = useMetricsSummary();
  const { data: regions, isLoading: regionsLoading } = useMetricsByRegion(8);
  const { data: breakdown, isLoading: breakdownLoading } =
    useMetricsByNeedType(breakdownScope || undefined);

  const tsRange = useMemo(() => presetRange(tsPreset), [tsPreset]);
  const { data: timeSeries, isLoading: tsLoading, isError: tsError, refetch: refetchTs } =
    useMetricsTimeSeries({
      from: tsRange.from,
      to: tsRange.to,
      regionId: tsRegionId || undefined,
      groupByNeed: tsGroupByNeed,
    });
  const {
    data: dispatchers,
    isLoading: dispatchersLoading,
    isError: dispatchersError,
    refetch: refetchDispatchers,
  } = useMetricsDispatchers(dispatcherScope || undefined);
  const {
    data: funnel,
    isLoading: funnelLoading,
    isError: funnelError,
    refetch: refetchFunnel,
  } = useMetricsFunnel(funnelThreshold);

  const {
    data: requestsData,
    isLoading: requestsLoading,
    refetch,
  } = useRequests({ status: filterStatus });

  const updateStatus = useUpdateRequestStatus();

  // Global refresh re-fetches every metric stream + requests so the whole
  // dashboard stays consistent after a manual refresh.
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refetch(),
      refetchTs(),
      refetchDispatchers(),
      refetchFunnel(),
    ]);
    setLastRefreshTime(new Date());
    toast.success(t("dashboard.refreshed"));
  }, [refetch, refetchTs, refetchDispatchers, refetchFunnel, t]);

  const handleUpdateStatus = useCallback(
    async (id, status) => {
      await updateStatus.mutateAsync({ id, status });
    },
    [updateStatus],
  );

  const requests = requestsData?.requests || [];

  // Rate / duration formatting for the nullable v1.1.0 summary fields.
  const formatRate = useCallback(
    (rate) => (rate == null ? null : toLocaleDigits(`${(rate * 100).toFixed(1)}%`, locale)),
    [locale],
  );
  const formatMinutes = useCallback(
    (min) => (min == null ? null : toLocaleDigits(`${Math.round(min)}m`, locale)),
    [locale],
  );

  const breakdownScopeOptions = [
    { value: "", label: t("dashboard.allTime") },
    { value: "today", label: t("dashboard.today") },
  ];

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
              className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md px-3 py-2 transition-colors cursor-pointer"
            >
              <RefreshCw
                size={13}
                className={updateStatus.isPending ? "animate-spin" : ""}
              />
              {t("common.refresh")}
            </button>
          </div>

          {/* KPI row — 8 cards over two rows on xl, mixing counts + nullable rates/durations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {metricsLoading ? (
              <>
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
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
                  label={t("dashboard.activeBacklog")}
                  value={metrics?.activeBacklog ?? 0}
                  intent={
                    (metrics?.activeBacklog ?? 0) > 100
                      ? "danger"
                      : (metrics?.activeBacklog ?? 0) > 50
                        ? "warning"
                        : "default"
                  }
                  caption={t("dashboard.unitsPending", {
                    count: metrics?.pendingQuantity ?? 0,
                  })}
                />
                <KpiCard
                  label={t("dashboard.pending")}
                  value={metrics?.pendingRequests || 0}
                  intent={
                    (metrics?.pendingRequests ?? 0) > 100
                      ? "danger"
                      : (metrics?.pendingRequests ?? 0) > 50
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
                <KpiCard
                  label={t("dashboard.cancelled")}
                  value={metrics?.cancelledRequests || 0}
                  caption={t("dashboard.cancelledCaption", {
                    rate: formatRate(metrics?.cancellationRate) ?? "—",
                  })}
                />
                <KpiCard
                  label={t("dashboard.fulfillmentRate")}
                  displayValue={formatRate(metrics?.fulfillmentRate)}
                  caption={t("dashboard.fulfillmentRateCaption")}
                />
                <KpiCard
                  label={t("dashboard.avgResponse")}
                  displayValue={formatMinutes(metrics?.avgResponseMinutes)}
                />
              </>
            )}
          </div>

          {/* Time series — full width */}
          <TimeSeriesChart
            data={timeSeries}
            loading={tsLoading}
            isError={tsError}
            preset={tsPreset}
            onPresetChange={setTsPreset}
            groupByNeed={tsGroupByNeed}
            onGroupByNeedChange={setTsGroupByNeed}
            regionId={tsRegionId}
            onRegionIdChange={setTsRegionId}
            regions={regions || []}
            onRetry={refetchTs}
          />

          {/* Funnel + leaderboard side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DispatchFunnel
              data={funnel}
              loading={funnelLoading}
              isError={funnelError}
              threshold={funnelThreshold}
              onThresholdChange={setFunnelThreshold}
              onRetry={refetchFunnel}
            />
            <DispatcherLeaderboard
              data={dispatchers}
              loading={dispatchersLoading}
              isError={dispatchersError}
              scope={dispatcherScope}
              onScopeChange={setDispatcherScope}
              onRetry={refetchDispatchers}
            />
          </div>

          {/* Regions + need-type breakdown (with today/all-time scope) */}
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
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-semibold text-neutral-700">
                  {t("dashboard.breakdownByNeed")}
                </h2>
                <SegmentedControl
                  options={breakdownScopeOptions}
                  value={breakdownScope}
                  onChange={setBreakdownScope}
                  size="xs"
                />
              </div>
              <NeedTypeBreakdown
                bottles={breakdown?.bottles}
                tanker={breakdown?.tanker}
                loading={breakdownLoading}
              />
            </div>
          </div>

          {/* Recent requests */}
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
              updatingId={
                updateStatus.isPending ? updateStatus.variables?.id : null
              }
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
      />
    </div>
  );
}
