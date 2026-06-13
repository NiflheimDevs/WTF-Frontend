export function getRegionName(region, locale) {
  if (!region) return "";
  return locale === "fa" ? region.name_fa : region.name_en;
}

export function getRegionSecondaryName(region, locale) {
  if (!region) return "";
  return locale === "fa" ? region.name_en : region.name_fa;
}
