<script setup>
import { onMounted, ref } from "vue";
import { compressAndEncode, decodeAndDecompress } from "@/utils/compressor.js";
import { getData, postData, deleteData } from "@/services/dynamoService.js";
import {
  load,
  uploadToS3,
  downloadFromS3,
  previewFromS3,
  deleteFromS3,
} from "@/services/s3Service.js";
import { v4 as uuid_v4 } from "uuid";
import { message } from "ant-design-vue";
import "@/assets/styles/layout.css";
import "@/assets/styles/upload.css";

const fileInput = ref(null);
const selectedFile = ref(null);
const authKey = ref("");
const authKeyInput = ref("");
const customFileName = ref("");
const directory = ref([]);
const visible = ref(false);
const setVisible = (value) => {
  visible.value = value;
};
const src = ref("");
const showPopup = ref(false);
const showAuthPopup = ref(false);
let resolveAuthPromise = null;

const loadDirectory = async () => {
  try {
    const response = await load();
    directory.value = response.data.files;
  } catch (error) {
    console.error("Directory load error:", error);
    message.warn("Failed to load directory.").then();
  }
};

const upload = async () => {
  try {
    const originalName = selectedFile.value.name;
    const baseName = compressAndEncode(
      customFileName.value.trim() || originalName,
    );
    const uuid = uuid_v4();
    const newFileName = `${uuid}_${baseName}`;
    const newFile = new File([selectedFile.value], newFileName, {
      type: selectedFile.value.type,
      lastModified: selectedFile.value.lastModified,
    });
    const response = await uploadToS3(newFile);
    if (response !== false) {
      await postData(
        "file",
        "file:" + newFileName,
        "authKey",
        compressAndEncode(authKey.value),
      );
      await loadDirectory();
      showPopup.value = false;

      // ✅ 업로드 후 파일 정보 초기화
      selectedFile.value = null;
      authKey.value = "";
      customFileName.value = "";
    } else {
      message.warn("File upload failed.").then();
    }
  } catch (error) {
    message.warn("File upload failed.").then();
    console.error("Upload error:", error);
  }
};

const previewFileClick = async (file) => {
  try {
    const fileUrl = await previewFromS3(file);

    if (fileUrl) {
      src.value = fileUrl; // Blob URL 할당
      visible.value = true; // 미리보기 활성화
    } else {
      message.warn("미리보기를 불러올 수 없습니다.").then();
    }
  } catch (error) {
    console.error("Preview error:", error);
    message.warn("미리보기를 불러올 수 없습니다.").then();
  }
};
const download = (file) => {
  try {
    downloadFromS3(file);
  } catch (error) {
    message.warn("파일 다운로드 실패").then();
  }
};

const remove = async (file) => {
  try {
    await deleteFromS3(file);
    await deleteData("file", "file:" + file.replace("upload/", ""));
    await loadDirectory(); // 파일 삭제 후 리스트 새로고침
  } catch (error) {
    message.warn("파일 삭제 실패").then();
  }
};

const cancelUpload = () => {
  selectedFile.value = null; // 선택한 파일 초기화
  authKey.value = ""; // 입력된 비밀 번호 초기화
  showPopup.value = false; // 팝업 닫기
};
const formatFileSize = (size) => {
  return (size / (1024 * 1024)).toFixed(2) + " MB"; // 메가 바이트 변환
};

const handleFileChange = (event) => {
  if (event.target.files.length > 0) {
    selectedFile.value = event.target.files[0];
  }
};
const truncateFileName = (name) => {
  name = name.replace("upload/", "");
  const encoded = name.replace(/^[a-f0-9-]{36}_/, "");
  try {
    return decodeAndDecompress(encoded);
  } catch (e) {
    console.error("디코딩 실패:", e);
    return encoded;
  }
};

const getAuthKey = async (file) => {
  const key = await getData("file", "file:" + file.replace("upload/", ""));
  try {
    return decodeAndDecompress(key);
  } catch (e) {
    console.error("비밀번호 디코딩 실패:", e);
    return key;
  }
};

const handleAuth = async (file, action) => {
  const storedKey = await getAuthKey(file);
  if (storedKey) {
    const inputKey = await waitForAuthConfirmation(); // 사용자 입력 기다림
    if (inputKey !== storedKey) {
      message.error("비밀번호가 일치하지 않습니다.").then();
      return;
    }
  }
  switch (action) {
    case "preview":
      await previewFileClick(file);
      break;
    case "download":
      download(file);
      break;
    case "remove":
      await remove(file);
      break;
  }
};
const waitForAuthConfirmation = () => {
  return new Promise((resolve) => {
    resolveAuthPromise = resolve;
    showAuthPopup.value = true;
  });
};

const confirmAuth = () => {
  showAuthPopup.value = false;
  if (resolveAuthPromise) {
    resolveAuthPromise(authKeyInput.value);
    authKeyInput.value = ""; // 입력된 비밀 번호 초기화
    resolveAuthPromise = null;
  }
};
const closeAuthPopup = () => {
  showAuthPopup.value = false;
};

onMounted(loadDirectory);
</script>

<template>
  <div class="main-container">
    <div class="file-grid">
      <div v-for="(file, index) in directory" :key="index" class="file-item">
        <span class="file-name" @click="handleAuth(file, 'preview')">
          {{ truncateFileName(file) }}
        </span>
        <div class="button-group">
          <button @click="handleAuth(file, 'download')" class="button-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button @click="handleAuth(file, 'remove')" class="button-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="button-container">
      <button class="add-button" @click="showPopup = true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>

    <div v-if="showPopup" class="popup">
      <div class="popup-content">
        <div class="file-upload-area">
          <span v-if="selectedFile" class="file-info">
            {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
          </span>
          <label class="file-select-button">
            파일 선택
            <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              hidden
            />
          </label>
        </div>

        <input
          type="text"
          v-model="customFileName"
          placeholder="업로드할 파일명 입력"
          class="styled-input"
        />

        <input
          type="text"
          v-model="authKey"
          placeholder="비밀번호 (선택사항)"
          class="styled-input"
        />

        <div class="popup-buttons">
          <button class="button-secondary" @click="cancelUpload">취소</button>
          <button class="button-primary" @click="upload">업로드</button>
        </div>
      </div>
    </div>

    <div v-if="showAuthPopup" class="popup">
      <div class="popup-content">
        <input
          type="text"
          v-model="authKeyInput"
          placeholder="비밀번호"
          class="styled-input"
        />
        <div class="popup-buttons">
          <button class="button-secondary" @click="closeAuthPopup">취소</button>
          <button class="button-primary" @click="confirmAuth">확인</button>
        </div>
      </div>
    </div>

    <a-image
      :width="200"
      :preview="{ visible, onVisibleChange: setVisible }"
      :src="src"
      style="display: none"
    />
  </div>
</template>
