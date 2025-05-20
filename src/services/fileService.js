import apiClient from "./api";

// 디렉터리 파일 목록 로드
export const loadFiles = async () => {
  const response = await apiClient.get("/api/directory");
  if (!response.status) {
    throw new Error("Failed to load directory.");
  }
  return response;
};

// 파일 다운로드
export const downloadFile = async (authKey, downloadPath, fileName) => {
  try {
    const response = await apiClient.get(
      `/api/download?path=${downloadPath}&key=${authKey}`,
      {
        responseType: "blob", // 응답 형식 설정
      },
    );
    if (response.status === 200) {
      const blob = new Blob([response.data]);
      if (navigator.userAgent.includes("Android")) {
        downloadBlob(blob, fileName);
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } else {
      console.error(`Download failed with status ${response.status}.`);
    }
  } catch (error) {
    console.error("Error during file download:", error);
    throw error;
  }
};

export const previewFile = async (fileName) => {
  try {
    const response = await apiClient.get(`/api/${fileName}`, {
      responseType: "blob", // 이미지 데이터 반환
    });

    return URL.createObjectURL(response.data); // Blob URL 생성
  } catch (error) {
    console.error("Preview error:", error);
    return null; // 실패 시 null 반환
  }
};

function downloadBlob(blob, fileName) {
  const reader = new FileReader();
  reader.onload = function () {
    const base64Data = reader.result.split(",")[1];
    // Android Interface 로 데이터 전달
    Android.downloadBlob(base64Data, fileName);
  };
  reader.readAsDataURL(blob);
}

// 파일 업로드
export const uploadFile = async (selectedFile) => {
  if (!selectedFile) {
    throw new Error("Please select a file to upload.");
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  // FormData 전송
  const response = await apiClient.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // FormData 전송 설정
    },
  });

  if (response.status !== 200) {
    throw new Error("File upload failed.");
  }
  return response;
};

export const deleteFile = async (filePath) => {
  try {
    const response = await apiClient.delete(`/api/delete`, {
      params: { path: filePath },
    });
    if (response.status !== 200) {
      alert(`Failed to delete file: ${response.data}`);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    alert("An error occurred while deleting the file.");
  }
};
