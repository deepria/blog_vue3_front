import { apiClient, unwrapData } from "@/shared/api/http";

export const storageApi = {
  async listFiles() {
    const response = await apiClient.get("/api/files");
    return unwrapData(response)?.items || [];
  },

  async createUpload({ filename, displayName, contentType, authKey }) {
    const response = await apiClient.post("/api/files/presign-upload", {
      filename,
      display_name: displayName,
      content_type: contentType,
      auth_key: authKey || null,
    });
    return unwrapData(response);
  },

  async createDownload({ key, authKey }) {
    const response = await apiClient.post("/api/files/presign-download", {
      key,
      auth_key: authKey || null,
    });
    return unwrapData(response);
  },

  async createDelete({ key, authKey }) {
    const response = await apiClient.post("/api/files/presign-delete", {
      key,
      auth_key: authKey || null,
    });
    return unwrapData(response);
  },
};
