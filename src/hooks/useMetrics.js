import { useQuery } from "@tanstack/react-query";
import { dispatcherApi } from "../api/endpoints";

export const metricsKeys = {
  all: ["metrics"],
  summary: () => [...metricsKeys.all, "summary"],
  byRegion: (limit) => [...metricsKeys.all, "by-region", limit],
  byNeedType: () => [...metricsKeys.all, "by-need-type"],
};

export function useMetricsSummary() {
  return useQuery({
    queryKey: metricsKeys.summary(),
    queryFn: async () => {
      const { data } = await dispatcherApi.getMetricsSummary();
      return data;
    },
    refetchInterval: 30000,
    staleTime: 25000,
    select: (data) => ({
      totalRequests: data.total_requests,
      pendingRequests: data.pending_requests,
      dispatchedRequests: data.dispatched_requests,
      fulfilledRequests: data.fulfilled_requests,
    }),
  });
}

export function useMetricsByRegion(limit = 10) {
  return useQuery({
    queryKey: metricsKeys.byRegion(limit),
    queryFn: async () => {
      const { data } = await dispatcherApi.getMetricsByRegion(limit);
      return data;
    },
    refetchInterval: 30000,
    staleTime: 25000,
    select: (data) =>
      data.map((region) => ({
        id: region.region_id,
        name: region.region_name_en,
        nameFa: region.region_name_fa,
        count: region.request_count,
      })),
  });
}

export function useMetricsByNeedType() {
  return useQuery({
    queryKey: metricsKeys.byNeedType(),
    queryFn: async () => {
      const { data } = await dispatcherApi.getMetricsByNeedType();
      return data;
    },
    refetchInterval: 30000,
    staleTime: 25000,
    select: (data) => ({
      bottles: data.find((d) => d.need_type === "bottled_water"),
      tanker: data.find((d) => d.need_type === "tanker"),
    }),
  });
}
