import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../api/endpoints";

export const regionsKeys = {
  all: ["regions"],
  lists: () => [...regionsKeys.all, "list"],
  list: (filters) => [...regionsKeys.lists(), { filters }],
  details: () => [...regionsKeys.all, "detail"],
  detail: (id) => [...regionsKeys.details(), id],
};

export function useRegions() {
  return useQuery({
    queryKey: regionsKeys.lists(),
    queryFn: async () => {
      const { data } = await publicApi.getRegions();
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (data) =>
      data.map((region) => ({
        ...region,
        name: region.name_en,
        displayName: region.name_fa,
      })),
  });
}
