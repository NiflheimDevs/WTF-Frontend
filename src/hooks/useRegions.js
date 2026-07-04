import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../api/endpoints";

export const regionsKeys = {
  all: ["regions"],
  countries: () => [...regionsKeys.all, "countries"],
  provinces: (countryId) => [...regionsKeys.all, "provinces", countryId],
  cities: (provinceId) => [...regionsKeys.all, "cities", provinceId],
};

const regionQueryOptions = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
};

export function useCountries() {
  return useQuery({
    queryKey: regionsKeys.countries(),
    queryFn: async () => {
      const { data } = await publicApi.getCountries();
      return data;
    },
    ...regionQueryOptions,
  });
}

export function useProvinces(countryId) {
  return useQuery({
    queryKey: regionsKeys.provinces(countryId),
    queryFn: async () => {
      const { data } = await publicApi.getProvinces(countryId);
      return data;
    },
    enabled: Boolean(countryId),
    ...regionQueryOptions,
  });
}

export function useCities(provinceId) {
  return useQuery({
    queryKey: regionsKeys.cities(provinceId),
    queryFn: async () => {
      const { data } = await publicApi.getCities(provinceId);
      return data;
    },
    enabled: Boolean(provinceId),
    ...regionQueryOptions,
  });
}
