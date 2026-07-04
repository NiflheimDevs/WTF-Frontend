import { Skeleton } from "../primitives/Skeleton";
import { Select } from "../primitives/Select";
import { useTranslation } from "../../context/LocaleContext";
import { useCountries, useProvinces, useCities } from "../../hooks/useRegions";
import { getRegionName } from "../../utils/regionName";
import { cn } from "../../utils/cn";

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
  dir,
}) {
  const selectOptions = options.map((option) => ({
    value: option.id,
    label: getRegionName(option, locale),
  }));

  return (
    <div>
      {label && (
        <label className="block mb-1.5 text-sm font-semibold text-neutral-700">
          {label} {required && <span className="text-danger-fg">*</span>}
        </label>
      )}
      {loading ? (
        <Skeleton className={cn("w-full", size === "md" ? "h-11" : "h-10")} />
      ) : (
        <Select
          value={value}
          onChange={onChange}
          options={selectOptions}
          placeholder={placeholder}
          disabled={disabled}
          size={size}
          dir={dir}
          error={error}
        />
      )}
    </div>
  );
}

export function RegionHierarchyFilters({
  countryId,
  provinceId,
  cityId = "",
  onCountryChange,
  onProvinceChange,
  onCityChange,
  showCity = true,
  layout = "column",
  size = "md",
  required = true,
  error,
}) {
  const { t, locale, dir } = useTranslation();

  const { data: countries = [], isLoading: countriesLoading } = useCountries();
  const { data: provinces = [], isLoading: provincesLoading } =
    useProvinces(countryId);
  const { data: cities = [], isLoading: citiesLoading } = useCities(provinceId);

  const handleCountryChange = (nextCountryId) => {
    onCountryChange(nextCountryId);
    onProvinceChange("");
    if (onCityChange) onCityChange("");
  };

  const handleProvinceChange = (nextProvinceId) => {
    onProvinceChange(nextProvinceId);
    if (onCityChange) onCityChange("");
  };

  return (
    <div
      className={cn(
        layout === "row"
          ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
          : "flex flex-col gap-4",
        showCity && layout === "row" && "sm:grid-cols-3",
      )}
    >
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
        dir={dir}
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
        dir={dir}
      />

      {showCity && onCityChange && (
        <RegionDropdown
          label={t("reporter.city")}
          value={cityId}
          onChange={(nextCityId) => onCityChange(nextCityId)}
          options={cities}
          loading={citiesLoading}
          disabled={!provinceId || citiesLoading}
          placeholder={t("reporter.selectCity")}
          required={required}
          error={error && provinceId && !cityId ? error : undefined}
          size={size}
          locale={locale}
          dir={dir}
        />
      )}

      {error && layout === "column" && (
        <p className="-mt-2 text-xs text-danger-fg">{error}</p>
      )}
    </div>
  );
}
