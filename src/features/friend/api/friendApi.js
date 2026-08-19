import { apiClient, unwrapData } from "@/shared/api/http";

export const friendApi = {
  async overview() {
    return unwrapData(await apiClient.get("/api/friends"));
  },

  async sendRequest(email) {
    return unwrapData(await apiClient.post("/api/friend-requests", { email }));
  },

  async acceptRequest(requestId) {
    return unwrapData(
      await apiClient.post(
        `/api/friend-requests/${encodeURIComponent(requestId)}/accept`,
      ),
    );
  },

  async dismissRequest(requestId) {
    return unwrapData(
      await apiClient.delete(
        `/api/friend-requests/${encodeURIComponent(requestId)}`,
      ),
    );
  },

  async removeFriend(friendId) {
    return unwrapData(
      await apiClient.delete(`/api/friends/${encodeURIComponent(friendId)}`),
    );
  },
};
