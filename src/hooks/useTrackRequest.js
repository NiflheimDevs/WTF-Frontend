import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../api/endpoints";

export const trackRequestKeys = {
  all: ["trackRequest"],
  detail: (id) => [...trackRequestKeys.all, id],
};

export function useTrackRequest(requestId, enabled = true) {
  const trimmedId = requestId?.trim() ?? "";

  return useQuery({
    queryKey: trackRequestKeys.detail(trimmedId),
    queryFn: async () => {
      const { data } = await publicApi.getRequest(trimmedId);
      return data;
    },
    enabled: enabled && Boolean(trimmedId),
    retry: false,
  });
}
