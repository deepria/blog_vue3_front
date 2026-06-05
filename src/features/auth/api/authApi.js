import { apiClient, unwrapData } from "@/shared/api/http";

export const authApi = {
  async me() {
    return unwrapData(await apiClient.get("/api/auth/me"));
  },

  async refresh() {
    return unwrapData(await apiClient.post("/api/auth/refresh"));
  },

  async logout() {
    return unwrapData(await apiClient.post("/api/auth/logout"));
  },

  loginUrl(provider, returnTo = window.location.href) {
    return `${apiClient.defaults.baseURL || ""}/api/auth/${provider}/login?returnTo=${encodeURIComponent(returnTo)}`;
  },

  mobileLoginUrl(provider) {
    return `${apiClient.defaults.baseURL || ""}/api/auth/${provider}/mobile-login`;
  },

  async completeMobileLogin(code) {
    return unwrapData(await apiClient.post("/api/auth/mobile/complete", { code }));
  },

  connectUrl(provider, returnTo = window.location.href) {
    return `${apiClient.defaults.baseURL || ""}/api/auth/${provider}/connect?returnTo=${encodeURIComponent(returnTo)}`;
  },

  async disconnect(provider) {
    return unwrapData(await apiClient.delete(`/api/auth/${provider}/disconnect`));
  },
};
