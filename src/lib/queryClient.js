import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error?.response?.status === 401) return false;
        if (error?.response?.status === 403) return false;
        if (error?.response?.status === 404) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Query key factories for better cache management
export const queryKeys = {
  auth: {
    all: ["auth"],
    user: () => [...queryKeys.auth.all, "user"],
    session: () => [...queryKeys.auth.all, "session"],
  },
  requests: {
    all: ["requests"],
    lists: () => [...queryKeys.requests.all, "list"],
    list: (filters) => [...queryKeys.requests.lists(), filters],
    details: () => [...queryKeys.requests.all, "detail"],
    detail: (id) => [...queryKeys.requests.details(), id],
  },
  metrics: {
    all: ["metrics"],
    summary: () => [...queryKeys.metrics.all, "summary"],
    byRegion: (limit) => [...queryKeys.metrics.all, "by-region", limit],
    byNeedType: () => [...queryKeys.metrics.all, "by-need-type"],
  },
  regions: {
    all: ["regions"],
    countries: () => [...queryKeys.regions.all, "countries"],
    provinces: (countryId) => [...queryKeys.regions.all, "provinces", countryId],
    cities: (provinceId) => [...queryKeys.regions.all, "cities", provinceId],
  },
};
