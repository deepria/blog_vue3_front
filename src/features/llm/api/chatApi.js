import { apiClient, unwrapData } from "@/shared/api/http";

/**
 * Chat (LLM) API Service
 */
export const chatApi = {
  async sendMessage(message) {
    const response = await apiClient.post("/api/chat", { message });
    return unwrapData(response);
  },
};
