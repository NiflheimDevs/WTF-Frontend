import { useState } from "react";
import { Skeleton } from "../primitives/Skeleton";
import { useTranslation } from "../../context/LocaleContext";
import { useCountries, useProvinces, useCities } from "../../hooks/useRegions";
import { getRegionName } from "../../utils/regionName";
import { cn } from "../../utils/cn";

const selectStyles = {
  md: "h-11 text-base",
  sm: "h-10 text-sm",
};

function RegionDropdown({
  label,
  value,
  onChange,
  options,
  loading,
  disabled,
  placeholder,
  required,
  error,
  size,
  locale,
}) {
  const selectClass = cn(
    "w-full px-3 rounded-md border bg-neutral-0 font-sans transition-all duration-200",
    "focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none",
    selectStyles[size],
    error ? "border-danger-fg" : "border-neutral-200",
    disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-primary-500",
    !value && "text-neutral-400",
    value && "text-neutral-900",
  );

  return (
    <div>
      {label && (
        <label className="block mb-1.5 text-sm font-semibold text-neutral-700">
          {label}{" "}
          {required && <span className="text-danger-fg">*</span>}
        </label>
      )}
      {loading ? (
        <Skeleton className={cn("w-full", size === "md" ? "h-11" : "h-10")} />
      ) : (
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={selectClass}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {getRegionName(option, locale)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export function RegionCascadeSelect({
  value,
  onChange,
  error,
  required = true,
  size = "md",
}) {
  const { t, locale } = useTranslation();
  const [countryId, setCountryId] = useState("");
  const [provinceId, setProvinceId] = useState("");

  const { data: countries = [], isLoading: countriesLoading } = useCountries();
  const { data: provinces = [], isLoading: provincesLoading } =
    useProvinces(countryId);
  const { data: cities = [], isLoading: citiesLoading } = useCities(provinceId);

  const handleCountryChange = (e) => {
    setCountryId(e.target.value);
    setProvinceId("");
    onChange("");
  };

  const handleProvinceChange = (e) => {
    setProvinceId(e.target.value);
    onChange("");
  };

  const handleCityChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-4">
      <RegionDropdown
        label={t("reporter.country")}
        value={countryId}
        onChange={handleCountryChange}
        options={countries}
        loading={countriesLoading}
        disabled={countriesLoading}
        placeholder={t("reporter.selectCountry")}
        required={required}
        error={error && !countryId ? error : undefined}
        size={size}
        locale={locale}
      />

      <RegionDropdown
        label={t("reporter.province")}
        value={provinceId}
        onChange={handleProvinceChange}
        options={provinces}
        loading={provincesLoading}
        disabled={!countryId || provincesLoading}
        placeholder={t("reporter.selectProvince")}
        required={required}
        error={error && countryId && !provinceId ? error : undefined}
        size={size}
        locale={locale}
      />

      <RegionDropdown
        label={t("reporter.city")}
        value={value}
        onChange={handleCityChange}
        options={cities}
        loading={citiesLoading}
        disabled={!provinceId || citiesLoading}
        placeholder={t("reporter.selectCity")}
        required={required}
        error={error && provinceId && !value ? error : undefined}
        size={size}
        locale={locale}
      />

      {error && (
        <p className="-mt-2 text-xs text-danger-fg">{error}</p>
      )}
    </div>
  );
}
