import api from "./axios";

// Public endpoints
export const publicApi = {
  getRegions: () => api.get("/regions"),
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
  getMetricsByNeedType: () => api.get("/dispatcher/metrics/by-need-type"),
};
