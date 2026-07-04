import { useState } from "react";
import { RegionHierarchyFilters } from "../regions/RegionHierarchyFilters";

export function RegionCascadeSelect({
  value,
  onChange,
  error,
  required = true,
  size = "md",
}) {
  const [countryId, setCountryId] = useState("");
  const [provinceId, setProvinceId] = useState("");

  return (
    <RegionHierarchyFilters
      countryId={countryId}
      provinceId={provinceId}
      cityId={value}
      onCountryChange={setCountryId}
      onProvinceChange={setProvinceId}
      onCityChange={onChange}
      showCity
      layout="column"
      size={size}
      required={required}
      error={error}
    />
  );
}
