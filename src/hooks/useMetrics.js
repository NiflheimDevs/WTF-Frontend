import { useQuery } from "@tanstack/react-query";
import { dispatcherApi } from "../api/endpoints";

export const metricsKeys = {
  all: ["metrics"],
  summary: () => [...metricsKeys.all, "summary"],
  byRegion: (limit) => [...metricsKeys.all, "by-region", limit],
  byNeedType: (scope) => [...metricsKeys.all, "by-need-type", scope ?? "all"],
  timeSeries: (params) => [...metricsKeys.all, "timeseries", params],
  dispatchers: (scope) => [...metricsKeys.all, "dispatchers", scope ?? "all"],
  funnel: (threshold, window) => [
    ...metricsKeys.all,
    "funnel",
    threshold ?? 24,
    window ?? 0,
  ],
};

// Normalizes the summary payload into camelCase, exposing the v1.1.0 additions.
// Numeric rate/average fields are nullable on the backend and kept as-is here.
function selectSummary(data) {
  return {
    totalRequests: data.total_requests,
    pendingRequests: data.pending_requests,
    dispatchedRequests: data.dispatched_requests,
    fulfilledRequests: data.fulfilled_requests,
    // v1.1.0 additions
    cancelledRequests: data.cancelled_requests,
    activeBacklog: data.active_backlog,
    pendingQuantity: data.pending_quantity,
    requestsToday: data.requests_today,
    dispatchedToday: data.dispatched_today,
    fulfilledToday: data.fulfilled_today,
    cancelledToday: data.cancelled_today,
    cancellationRate: data.cancellation_rate,
    fulfillmentRate: data.fulfillment_rate,
    avgResponseMinutes: data.avg_response_minutes,
    medianResponseMinutes: data.median_response_minutes,
    oldestPendingAgeMinutes: data.oldest_pending_age_minutes,
  };
}

export function useMetricsSummary() {
  return useQuery({
    queryKey: metricsKeys.summary(),
    queryFn: async () => {
      const { data } = await dispatcherApi.getMetricsSummary();
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 25000,
    select: selectSummary,
  });
}

export function useMetricsByRegion(limit = 10) {
  return useQuery({
    queryKey: metricsKeys.byRegion(limit),
    queryFn: async () => {
      const { data } = await dispatcherApi.getMetricsByRegion(limit);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 25000,
    select: (data) =>
      data.map((region) => ({
        id: region.region_id,
        name_en: region.region_name_en,
        name_fa: region.region_name_fa,
        count: region.request_count,
      })),
  });
}

// `scope` === "today" restricts counts to the current day (backend query param).
export function useMetricsByNeedType(scope) {
  const params = scope === "today" ? { scope: "today" } : undefined;

  return useQuery({
    queryKey: metricsKeys.byNeedType(scope),
    queryFn: async () => {
      const { data } = await dispatcherApi.getMetricsByNeedType(params);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 25000,
    select: (data) => ({
      bottles: data.find((d) => d.need_type === "bottled_water"),
      tanker: data.find((d) => d.need_type === "tanker"),
    }),
  });
}

// Daily rollups for charts. `groupByNeed` splits rows by need type.
// Note: the backend expects group_by_need as the string "true".
export function useMetricsTimeSeries({
  from,
  to,
  regionId,
  groupByNeed,
} = {}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  if (regionId) params.region_id = regionId;
  if (groupByNeed) params.group_by_need = "true";

  return useQuery({
    queryKey: metricsKeys.timeSeries(params),
    queryFn: async () => {
      const { data } = await dispatcherApi.getMetricsTimeSeries(params);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });
}

// Per-dispatcher dispatch counts (leaderboard). `scope` === "today" for a
// today-only leaderboard.
export function useMetricsDispatchers(scope) {
  const params = scope === "today" ? { scope: "today" } : undefined;

  return useQuery({
    queryKey: metricsKeys.dispatchers(scope),
    queryFn: async () => {
      const { data } = await dispatcherApi.getMetricsDispatchers(params);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });
}

// Completion funnel + quality metrics.
// - stuckThresholdHours: flags requests sitting in "dispatched" longer than the
//   threshold (API default 24h). Independent of window_hours.
// - windowHours: when > 0, every stage count is scoped to requests that reached
//   that stage within the last N hours (each stage uses its own timestamp).
//   0 / omitted = all-time counts. The stuck count is never affected by this.
export function useMetricsFunnel({
  stuckThresholdHours = 24,
  windowHours = 0,
} = {}) {
  const params = { stuck_threshold_hours: stuckThresholdHours };
  if (windowHours && windowHours > 0) params.window_hours = windowHours;

  return useQuery({
    queryKey: metricsKeys.funnel(stuckThresholdHours, windowHours),
    queryFn: async () => {
      const { data } = await dispatcherApi.getMetricsFunnel(params);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000,
  });
}
