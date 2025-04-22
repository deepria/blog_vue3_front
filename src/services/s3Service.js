import apiClient from "./api";
import { message } from "ant-design-vue";

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
    headers: { "Content-Type": file.type },
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
export const downloadFromS3 = async (filename) => {
  const { data: downloadUrl } = await apiClient.get("/api/s3/download-url", {
    params: { filename },
  });

  if (navigator.userAgent.includes("Android")) {
    // 1. presigned URL로 파일(blob) 다운로드
    const response = await axios.get(downloadUrl, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const reader = new FileReader();

    reader.onloadend = function () {
      if (typeof reader.result === "string") {
        const base64data = reader.result;
        const link = document.createElement("a");
        link.href = base64data;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("파일 변환 실패: 예상과 다른 결과 타입", reader.result);
      }
    };

    reader.readAsDataURL(blob); // 🔥 base64로 변환해서 다운로드 강제 처리
  } else {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename; // 원하는 파일명
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const previewFromS3 = async (filename) => {
  const { data: downloadUrl } = await apiClient.get("/api/s3/download-url", {
    params: { filename },
  });
  return downloadUrl;
};

export const deleteFromS3 = async (filename) => {
  const { data: deleteUrl } = await apiClient.get("/api/s3/delete-url", {
    params: { filename },
  });
  return await apiClient.delete(deleteUrl);
};
