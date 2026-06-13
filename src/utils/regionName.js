export function getRegionName(region, locale) {
  if (!region) return "";
  return locale === "fa" ? region.name_fa : region.name_en;
}

export function getRegionSecondaryName(region, locale) {
  if (!region) return "";
  return locale === "fa" ? region.name_en : region.name_fa;
}

export function getRequestRegionName(request, locale, regionsById) {
  if (!request) return "";

  if (request.region_name_en || request.region_name_fa) {
    return getRegionName(
      {
        name_en: request.region_name_en,
        name_fa: request.region_name_fa,
      },
      locale,
    );
  }

  if (request.name_en || request.name_fa) {
    return getRegionName(request, locale);
  }

  if (request.region_name) {
    return request.region_name;
  }

  const regionId = request.region_id;
  if (regionId && regionsById) {
    const region = regionsById.get(regionId);
    if (region) return getRegionName(region, locale);
  }

  return "";
}
