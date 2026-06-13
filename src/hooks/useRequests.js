import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { dispatcherApi } from "../api/endpoints";
import { t } from "../i18n";
import toast from "react-hot-toast";

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
    refetchInterval: 15000,
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
    refetchInterval: 15000,
    staleTime: 10000,
  });
}

export function useRequestDetail(id) {
  return useQuery({
    queryKey: requestsKeys.detail(id),
    queryFn: async () => {
      const { data } = await dispatcherApi.getRequest(id);
      return data;
    },
    enabled: !!id,
    staleTime: 30000,
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

      const previousRequests = queryClient.getQueryData(requestsKeys.lists());

      queryClient.setQueryData(requestsKeys.lists(), (old) => {
        if (!old?.requests) return old;
        return {
          ...old,
          requests: old.requests.map((req) =>
            req.id === id ? { ...req, status } : req,
          ),
        };
      });

      return { previousRequests };
    },
    onError: (err, variables, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(
          requestsKeys.lists(),
          context.previousRequests,
        );
      }
      toast.error(t("requests.statusUpdateFailed"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: requestsKeys.all });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
}
