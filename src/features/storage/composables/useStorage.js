import { computed, ref } from "vue";
import { storageApi } from "../api/storageApi";

const SINGLE_PUT_LIMIT = 5 * 1024 * 1024 * 1024;
const DEFAULT_PART_SIZE = 100 * 1024 * 1024;
const MAX_PARTS = 10000;
const MULTIPART_CONCURRENCY = 3;

export function useStorage() {
  const files = ref([]);
  const loading = ref(false);
  const uploadProgress = ref(0);

  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".avif"];
  const textExtensions = [".txt", ".md", ".markdown", ".log", ".csv", ".json", ".xml", ".yaml", ".yml"];
  const previewableFiles = computed(() =>
    files.value.map((file) => ({
      ...file,
      previewType: getPreviewType(file.display_name),
      isPreviewable: getPreviewType(file.display_name) !== "unsupported",
    })),
  );

  function getPreviewType(fileName = "") {
    const normalized = fileName.toLowerCase();
    if (imageExtensions.some((ext) => normalized.endsWith(ext))) return "image";
    if (textExtensions.some((ext) => normalized.endsWith(ext))) {
      return normalized.endsWith(".md") || normalized.endsWith(".markdown") ? "markdown" : "text";
    }
    return "unsupported";
  }

  async function loadFiles() {
    loading.value = true;
    try {
      files.value = await storageApi.listFiles();
    } finally {
      loading.value = false;
    }
  }

  async function uploadFile({ file, displayName, authKey, onProgress }) {
    if (file.size > SINGLE_PUT_LIMIT) {
      return uploadMultipartFile({ file, displayName, authKey, onProgress });
    }

    const upload = await storageApi.createUpload({
      filename: file.name,
      displayName,
      contentType: file.type || "application/octet-stream",
      authKey,
    });

    const response = await fetch(upload.upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!response.ok) {
      throw {
        userMessage: `Upload failed (${response.status})`,
        status: response.status,
      };
    }

    uploadProgress.value = 100;
    if (onProgress) onProgress(100);
    await loadFiles();
    return upload;
  }

  async function uploadMultipartFile({ file, displayName, authKey, onProgress }) {
    const contentType = file.type || "application/octet-stream";
    const upload = await storageApi.initiateMultipartUpload({
      filename: file.name,
      displayName,
      contentType,
      authKey,
    });
    const partSize = getPartSize(file.size);
    const partCount = Math.ceil(file.size / partSize);
    const completedParts = [];
    let completedBytes = 0;

    try {
      await runPartUploads(partCount, MULTIPART_CONCURRENCY, async (partNumber) => {
        const start = (partNumber - 1) * partSize;
        const end = Math.min(start + partSize, file.size);
        const blob = file.slice(start, end);
        const { url } = await storageApi.createMultipartPart({
          key: upload.key,
          uploadId: upload.upload_id,
          partNumber,
        });
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": contentType,
          },
          body: blob,
        });

        if (!response.ok) {
          throw {
            userMessage: `Upload failed (${response.status})`,
            status: response.status,
          };
        }

        const etag = response.headers.get("ETag");
        if (!etag) {
          throw {
            userMessage: "Upload failed: S3 CORS must expose the ETag header.",
            status: "missing_etag",
          };
        }

        completedParts.push({ partNumber, etag });
        completedBytes += blob.size;
        updateProgress(Math.floor((completedBytes / file.size) * 95), onProgress);
      });

      completedParts.sort((a, b) => a.partNumber - b.partNumber);
      await storageApi.completeMultipartUpload({
        key: upload.key,
        uploadId: upload.upload_id,
        parts: completedParts,
      });
      updateProgress(100, onProgress);
      await loadFiles();
      return upload;
    } catch (error) {
      await storageApi
        .abortMultipartUpload({ key: upload.key, uploadId: upload.upload_id })
        .catch(() => {});
      throw error;
    }
  }

  function getPartSize(fileSize) {
    return Math.max(DEFAULT_PART_SIZE, Math.ceil(fileSize / MAX_PARTS));
  }

  async function runPartUploads(total, concurrency, uploadPart) {
    let nextPartNumber = 1;
    const workers = Array.from({ length: Math.min(concurrency, total) }, async () => {
      while (nextPartNumber <= total) {
        const partNumber = nextPartNumber;
        nextPartNumber += 1;
        await uploadPart(partNumber);
      }
    });
    await Promise.all(workers);
  }

  function updateProgress(value, onProgress) {
    uploadProgress.value = value;
    if (onProgress) onProgress(value);
  }

  async function getDownloadUrl(key, authKey) {
    return storageApi.createDownload({ key, authKey });
  }

  async function getDeleteUrl(key, authKey) {
    return storageApi.createDelete({ key, authKey });
  }

  return {
    files,
    loading,
    uploadProgress,
    previewableFiles,
    loadFiles,
    uploadFile,
    getDownloadUrl,
    getDeleteUrl,
  };
}
