import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publicApi } from "../api/endpoints";
import { metricsKeys } from "./useMetrics";
import { t } from "../i18n";
import toast from "react-hot-toast";

export function useSubmitRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData) => {
      const { data } = await publicApi.submitRequest(requestData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: metricsKeys.all });
      toast.success(
        t("reporter.requestSubmitted", { id: String(data.id ?? "") }),
      );
    },
    onError: (error) => {
      if (error.response?.status === 429) {
        toast.error(t("reporter.tooManyRequests"));
      } else if (error.response?.status === 400) {
        toast.error(t("reporter.invalidRequestInput"));
      } else if (error.response?.status === 503) {
        toast.error(t("reporter.serviceBusy"));
      } else {
        toast.error(t("reporter.submitFailed"));
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}
