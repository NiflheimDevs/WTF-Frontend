import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publicApi } from "../api/endpoints";
import { regionsKeys } from "./useRegions";
import toast from "react-hot-toast";

export function useSubmitRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData) => {
      const { data } = await publicApi.submitRequest(requestData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: regionsKeys.all });
      toast.success(`Request submitted! ID: ${data.id.slice(0, 8)}`);
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
      } else if (error.response?.status === 400) {
        toast.error("Invalid request. Please check your input.");
      } else if (error.response?.status === 503) {
        toast.error("Service is busy. Please try again.");
      } else {
        toast.error("Could not submit request. Please try again.");
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
