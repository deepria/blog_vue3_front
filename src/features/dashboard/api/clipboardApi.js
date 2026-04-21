import { apiClient, unwrapData } from "@/shared/api/http";

export const clipboardApi = {
  async fetchClipboard() {
    const response = await apiClient.get("/api/clipboard");
    return unwrapData(response);
  },

  async saveClipboard(text) {
    const response = await apiClient.put("/api/clipboard", { text });
    return unwrapData(response);
  }
};
