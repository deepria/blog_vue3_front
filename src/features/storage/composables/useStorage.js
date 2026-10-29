import { computed, ref } from "vue";
import { storageApi } from "../api/storageApi";
import { enrichFileForPresentation } from "../lib/filePresentation";
import { fetchOnline } from "@/shared/utils/network";

const SINGLE_PUT_LIMIT = 5 * 1024 * 1024 * 1024;
const DEFAULT_PART_SIZE = 100 * 1024 * 1024;
const MAX_PARTS = 10000;
const MULTIPART_CONCURRENCY = 3;

export function useStorage() {
  const files = ref([]);
  const sharedFiles = ref([]);
  const loading = ref(false);
  const sharedLoading = ref(false);
  const uploadProgress = ref(0);
  const error = ref("");
  const sharedError = ref("");

  const previewableFiles = computed(() =>
    files.value.map((file) =>
      enrichFileForPresentation({ ...file, isShared: false }),
    ),
  );
  const previewableSharedFiles = computed(() =>
    sharedFiles.value.map((file) =>
      enrichFileForPresentation({ ...file, isShared: true }),
    ),
  );

  async function loadFiles() {
    loading.value = true;
    error.value = "";
    try {
      files.value = await storageApi.listFiles();
    } catch (cause) {
      error.value = "파일을 불러오지 못했습니다. 다시 시도해 주세요.";
      throw cause;
    } finally {
      loading.value = false;
    }
  }

  async function loadSharedFiles() {
    sharedLoading.value = true;
    sharedError.value = "";
    try {
      sharedFiles.value = await storageApi.listSharedFiles();
    } catch (cause) {
      sharedError.value =
        "공유받은 파일을 불러오지 못했습니다. 다시 시도해 주세요.";
      throw cause;
    } finally {
      sharedLoading.value = false;
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

    const response = await fetchOnline(upload.upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!response.ok) {
      throw {
        userMessage: `업로드하지 못했습니다. (${response.status})`,
        status: response.status,
      };
    }

    uploadProgress.value = 100;
    if (onProgress) onProgress(100);
    await loadFiles();
    return upload;
  }

  async function uploadMultipartFile({
    file,
    displayName,
    authKey,
    onProgress,
  }) {
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
      await runPartUploads(
        partCount,
        MULTIPART_CONCURRENCY,
        async (partNumber) => {
          const start = (partNumber - 1) * partSize;
          const end = Math.min(start + partSize, file.size);
          const blob = file.slice(start, end);
          const { url } = await storageApi.createMultipartPart({
            key: upload.key,
            uploadId: upload.upload_id,
            partNumber,
          });
          const response = await fetchOnline(url, {
            method: "PUT",
            headers: {
              "Content-Type": contentType,
            },
            body: blob,
          });

          if (!response.ok) {
            throw {
              userMessage: `업로드하지 못했습니다. (${response.status})`,
              status: response.status,
            };
          }

          const etag = response.headers.get("ETag");
          if (!etag) {
            throw {
              userMessage:
                "파일 전송을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
              status: "missing_etag",
            };
          }

          completedParts.push({ partNumber, etag });
          completedBytes += blob.size;
          updateProgress(
            Math.floor((completedBytes / file.size) * 95),
            onProgress,
          );
        },
      );

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
    const workers = Array.from(
      { length: Math.min(concurrency, total) },
      async () => {
        while (nextPartNumber <= total) {
          const partNumber = nextPartNumber;
          nextPartNumber += 1;
          await uploadPart(partNumber);
        }
      },
    );
    await Promise.all(workers);
  }

  function updateProgress(value, onProgress) {
    uploadProgress.value = value;
    if (onProgress) onProgress(value);
  }

  async function getDownloadUrl(key, authKey, ownerId) {
    return storageApi.createDownload({ key, authKey, ownerId });
  }

  async function getDeleteUrl(key, authKey) {
    return storageApi.createDelete({ key, authKey });
  }

  return {
    files,
    error,
    sharedError,
    sharedFiles,
    loading,
    sharedLoading,
    uploadProgress,
    previewableFiles,
    previewableSharedFiles,
    loadFiles,
    loadSharedFiles,
    uploadFile,
    getDownloadUrl,
    getDeleteUrl,
  };
}
