import { apiClient, unwrapData } from "@/shared/api/http";

export const storageApi = {
  async listFiles() {
    const response = await apiClient.get("/api/files");
    return unwrapData(response)?.items || [];
  },

  async listSharedFiles() {
    const response = await apiClient.get("/api/files/shared-with-me");
    return unwrapData(response)?.items || [];
  },

  async listFileViewers(key) {
    const response = await apiClient.get(
      `/api/files/${encodeURIComponent(key)}/viewers`,
    );
    return unwrapData(response)?.items || [];
  },

  async shareFile(key, viewerId) {
    const response = await apiClient.post(
      `/api/files/${encodeURIComponent(key)}/viewers`,
      { viewer_id: viewerId },
    );
    return unwrapData(response);
  },

  async unshareFile(key, viewerId) {
    const response = await apiClient.delete(
      `/api/files/${encodeURIComponent(key)}/viewers/${encodeURIComponent(viewerId)}`,
    );
    return unwrapData(response);
  },

  async getOrganization() {
    const response = await apiClient.get("/api/files/organization");
    return unwrapData(response) || { directories: [], file_locations: {} };
  },

  async saveOrganization(organization) {
    const response = await apiClient.put(
      "/api/files/organization",
      organization,
    );
    return unwrapData(response) || { directories: [], file_locations: {} };
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

  async initiateMultipartUpload({
    filename,
    displayName,
    contentType,
    authKey,
  }) {
    const response = await apiClient.post("/api/files/multipart/initiate", {
      filename,
      display_name: displayName,
      content_type: contentType,
      auth_key: authKey || null,
    });
    return unwrapData(response);
  },

  async createMultipartPart({ key, uploadId, partNumber }) {
    const response = await apiClient.post("/api/files/multipart/presign-part", {
      key,
      upload_id: uploadId,
      part_number: partNumber,
    });
    return unwrapData(response);
  },

  async completeMultipartUpload({ key, uploadId, parts }) {
    const response = await apiClient.post("/api/files/multipart/complete", {
      key,
      upload_id: uploadId,
      parts: parts.map((part) => ({
        part_number: part.partNumber,
        etag: part.etag,
      })),
    });
    return unwrapData(response);
  },

  async abortMultipartUpload({ key, uploadId }) {
    const response = await apiClient.post("/api/files/multipart/abort", {
      key,
      upload_id: uploadId,
    });
    return unwrapData(response);
  },

  async createDownload({ key, authKey, ownerId }) {
    const response = await apiClient.post("/api/files/presign-download", {
      key,
      auth_key: authKey || null,
      owner_id: ownerId || null,
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
