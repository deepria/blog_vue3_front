import { apiClient, unwrapData } from "@/shared/api/http";

/**
 * Chat (LLM) API Service
 */
export const chatApi = {
  async sendMessage(message, previousInteractionId = null) {
    const response = await apiClient.post("/api/chat", {
      message,
      previousInteractionId,
    });
    return unwrapData(response);
  },
};
