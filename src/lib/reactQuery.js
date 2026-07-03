import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { queryClient } from "./queryClient";

// Custom hook wrappers with error handling
export function useQueryWithError(key, queryFn, options = {}) {
  return useQuery({
    queryKey: key,
    queryFn,
    throwOnError: (error) => {
      if (options.silentErrors) return false;
      console.error("Query error:", error);
      return false;
    },
    ...options,
  });
}

export function useMutationWithInvalidation(
  mutationFn,
  invalidateKeys = [],
  options = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (data, variables, context) => {
      await Promise.all(
        invalidateKeys.map((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        ),
      );
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
    onSettled: options.onSettled,
  });
}

// Batch invalidation helper
export async function invalidateQueries(keys) {
  await Promise.all(
    keys.map((key) => queryClient.invalidateQueries({ queryKey: key })),
  );
}

// Prefetch helper
export async function prefetchQuery(key, queryFn) {
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn,
  });
}

// Set query data helper
export function setQueryData(key, updater) {
  queryClient.setQueryData(key, updater);
}

// Get query data helper
export function getQueryData(key) {
  return queryClient.getQueryData(key);
}

// Remove queries helper
export function removeQueries(keys) {
  keys.forEach((key) => queryClient.removeQueries({ queryKey: key }));
}

// Reset queries helper
export function resetQueries(keys) {
  keys.forEach((key) => queryClient.resetQueries({ queryKey: key }));
}

// Refetch queries helper
export async function refetchQueries(keys) {
  await Promise.all(
    keys.map((key) => queryClient.refetchQueries({ queryKey: key })),
  );
}
