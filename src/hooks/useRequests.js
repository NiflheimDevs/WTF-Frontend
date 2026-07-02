import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { dispatcherApi } from "../api/endpoints";
import { t } from "../i18n";
import toast from "react-hot-toast";

function isRequestObject(value) {
  return (
    value &&
    typeof value === "object" &&
    "id" in value &&
    "status" in value
  );
}

export function normalizeRequestDetail(data) {
  if (!data) return null;

  if (isRequestObject(data.request)) {
    return {
      request: data.request,
      audit_log: data.audit_log ?? data.auditLog ?? [],
    };
  }

  if (isRequestObject(data)) {
    const { audit_log: auditLogSnake, auditLog, ...request } = data;
    return {
      request,
      audit_log: auditLogSnake ?? auditLog ?? [],
    };
  }

  return null;
}

function findRequestInListCache(queryClient, id) {
  const listQueries = queryClient.getQueriesData({
    queryKey: requestsKeys.lists(),
  });

  for (const [, listData] of listQueries) {
    const match = listData?.requests?.find((request) => request.id === id);
    if (match) {
      return { request: match, audit_log: [] };
    }
  }

  return undefined;
}

export const requestsKeys = {
  all: ["requests"],
  lists: () => [...requestsKeys.all, "list"],
  list: (filters) => [...requestsKeys.lists(), { ...filters }],
  details: () => [...requestsKeys.all, "detail"],
  detail: (id) => [...requestsKeys.details(), id],
};

export function buildRequestParams(filters = {}) {
  const params = {};

  if (filters.page) params.page = filters.page;
  if (filters.pageSize) params.page_size = filters.pageSize;
  if (filters.status && filters.status !== "all") params.status = filters.status;
  if (filters.regionId) params.region_id = filters.regionId;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;

  return params;
}

export function useRequests(filters = {}) {
  const params = buildRequestParams(filters);

  return useQuery({
    queryKey: requestsKeys.list(filters),
    queryFn: async () => {
      const { data } = await dispatcherApi.getRequests(params);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 10000,
    placeholderData: (previousData) => previousData,
  });
}

export function useInfiniteRequests(filters = {}) {
  const params = buildRequestParams(filters);

  return useInfiniteQuery({
    queryKey: requestsKeys.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await dispatcherApi.getRequests({
        ...params,
        page: pageParam,
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page * lastPage.page_size < lastPage.total) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    staleTime: 10000,
  });
}

export function useRequestDetail(id, fallbackRequest = null) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: requestsKeys.detail(id),
    queryFn: async () => {
      const { data } = await dispatcherApi.getRequest(id);
      return normalizeRequestDetail(data);
    },
    enabled: !!id,
    staleTime: 30000,
    placeholderData: () => {
      if (fallbackRequest?.id === id) {
        return { request: fallbackRequest, audit_log: [] };
      }
      return findRequestInListCache(queryClient, id);
    },
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await dispatcherApi.updateStatus(id, status);
      return data;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: requestsKeys.all });

      const previousQueries = queryClient.getQueriesData({
        queryKey: requestsKeys.lists(),
      });

      queryClient.setQueriesData(
        { queryKey: requestsKeys.lists() },
        (old) => {
          if (!old?.requests) return old;
          return {
            ...old,
            requests: old.requests.map((req) =>
              req.id === id ? { ...req, status } : req,
            ),
          };
        },
      );

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(t("requests.statusUpdateFailed"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: requestsKeys.all });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
}
