import apiClient from "./api";
import { message } from "ant-design-vue";
// import { decodeAndDecompress } from "@/utils/compressor.js";

// 디렉터리 파일 목록 로드
export const load = async () => {
  const response = await apiClient.get("/api/s3/list");
  if (!response.status) {
    throw new Error("Failed to load directory.");
  }
  return response;
};

// 파일 업로드
export const uploadToS3 = async (selectedFile) => {
  if (!selectedFile) {
    throw new Error("Please select a file to upload.");
  }
  const file = selectedFile;

  // 1. 업로드용 Presigned URL 요청
  const { data: uploadUrl } = await apiClient.get("/api/s3/upload-url", {
    params: {
      filename: file.name,
      contentType: file.type,
    },
  });
  let uploadProgress;
  // 2. S3로 직접 업로드
  await apiClient.put(uploadUrl, file, {
    headers: { "Content-Type": file.type, "x-amz-storage-class": "GLACIER_IR" },
    onUploadProgress: (progress) => {
      uploadProgress = Math.round((progress.loaded * 100) / progress.total);
      message
        .loading({
          content: "Upload in progress..." + uploadProgress + "%",
          key: "loading",
          duration: 0,
        })
        .then(); // 로딩 메시지 표시 (지속)
    },
  });
  message.destroy("loading");
  return uploadProgress || false;
};

// 파일 다운로드
export const downloadFromS3 = async (filename, originalFileName) => {
  const { data: downloadUrl } = await apiClient.get("/api/s3/download-url", {
    params: {
      filename: filename,
      originalName: originalFileName
    },
  });

  if (navigator.userAgent.includes("Android") && Android.isApp()) {
    // 1. presigned URL로 파일(blob) 다운로드
    const response = await apiClient.get(downloadUrl, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const reader = new FileReader();
    reader.onload = function () {
      const base64Data = reader.result.split(",")[1];
      // Android Interface 로 데이터 전달
      Android.downloadBlob(base64Data, originalFileName);
    };
    reader.readAsDataURL(blob);
  } else {
    // Web 브라우저 전용
    // [Backend Updated] 백엔드에서 Content-Disposition 헤더를 설정하므로 직접 다운로드 링크 사용
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank"; // 새 탭에서 열기 (S3가 설정한 헤더로 인해 파일명 유지되며 다운로드됨)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const previewFromS3 = async (filename) => {
  const { data: downloadUrl } = await apiClient.get("/api/s3/download-url", {
    params: { filename: filename },
  });
  return downloadUrl;
};

export const deleteFromS3 = async (filename) => {
  const { data: deleteUrl } = await apiClient.get("/api/s3/delete-url", {
    params: { filename },
  });
  return await apiClient.delete(deleteUrl);
};
