import api from "./axios";

// Public endpoints
export const publicApi = {
  getCountries: () => api.get("/regions/countries"),
  getProvinces: (countryId) =>
    api.get(`/regions/countries/${encodeURIComponent(countryId)}/provinces`),
  getCities: (provinceId) =>
    api.get(`/regions/provinces/${encodeURIComponent(provinceId)}/cities`),
  submitRequest: (data) => api.post("/requests", data),
  getRequest: (id) => api.get(`/request/${encodeURIComponent(id)}`),
  health: () => api.get("/health"),
  readiness: () => api.get("/health/ready"),
};

// Auth endpoints
export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  refresh: () => api.post("/auth/refresh"),
  logout: () => api.post("/auth/logout"),
};

// Dispatcher endpoints
export const dispatcherApi = {
  getRequests: (params) => api.get("/dispatcher/requests", { params }),
  getRequest: (id) =>
    api.get(`/dispatcher/requests/${encodeURIComponent(id)}`),
  updateStatus: (id, status) =>
    api.patch(
      `/dispatcher/requests/${encodeURIComponent(id)}/status`,
      { status },
    ),

  getMetricsSummary: () => api.get("/dispatcher/metrics/summary"),
  getMetricsByRegion: (limit = 10) =>
    api.get("/dispatcher/metrics/by-region", { params: { limit } }),
  // `params.scope` may be "today" to restrict counts to the current day.
  getMetricsByNeedType: (params) =>
    api.get("/dispatcher/metrics/by-need-type", { params }),

  // Metrics — added in API v1.1.0
  // timeseries: { from?, to?, region_id?, group_by_need?: "true" }
  getMetricsTimeSeries: (params) =>
    api.get("/dispatcher/metrics/timeseries", { params }),
  // dispatchers: { scope?: "today" }
  getMetricsDispatchers: (params) =>
    api.get("/dispatcher/metrics/dispatchers", { params }),
  // funnel: { stuck_threshold_hours?: number }
  getMetricsFunnel: (params) =>
    api.get("/dispatcher/metrics/funnel", { params }),
};
