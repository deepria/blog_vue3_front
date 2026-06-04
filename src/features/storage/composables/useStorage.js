import { computed, ref } from "vue";
import { storageApi } from "../api/storageApi";

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
