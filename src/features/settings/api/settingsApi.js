import { apiClient, unwrapData } from "../../../shared/api/http.js";

export const settingsApi = {
  async get() {
    return unwrapData(await apiClient.get("/api/settings"));
  },
  async save(settings) {
    return unwrapData(await apiClient.put("/api/settings", settings));
  },
};
