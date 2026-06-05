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

  async initiateMultipartUpload({ filename, displayName, contentType, authKey }) {
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
