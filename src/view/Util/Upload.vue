<script setup>
import { onMounted, ref } from "vue";
import { getData, postData } from "@/services/dynamoService.js";
import {
  uploadFile,
  previewFile,
  downloadFile,
  loadFiles,
  deleteFile,
} from "@/services/fileService.js";
import { v4 as uuidv4 } from "uuid";
import { message } from "ant-design-vue";

const fileInput = ref(null);
const selectedFile = ref(null);
const authKey = ref("");
const customFileName = ref("");
const directory = ref([]);
const visible = ref(false);
const setVisible = (value) => {
  visible.value = value;
};
const src = ref("");
const showPopup = ref(false);
const dragStartY = ref(0);
const dragOffset = ref(0);
const isDragging = ref(false);

const handleFileChange = (event) => {
  if (event.target.files.length > 0) {
    selectedFile.value = event.target.files[0];
  }
};

const upload = async () => {
  try {
    const originalName = selectedFile.value.name;
    const baseName = customFileName.value.trim()
      ? customFileName.value.trim() +
        originalName.substring(originalName.lastIndexOf("."))
      : originalName
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_.-]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "");
    const uuid = uuidv4();
    const newFileName = `${uuid}_${baseName}`;
    const newFile = new File([selectedFile.value], newFileName, {
      type: selectedFile.value.type,
      lastModified: selectedFile.value.lastModified,
    });

    const response = await uploadFile(newFile);
    if (response.status === 200) {
      await postData("file", "file:" + newFileName, "authKey", authKey.value);
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

const loadDirectory = async () => {
  try {
    const response = await loadFiles();
    directory.value = response.data;
  } catch (error) {
    console.error("Directory load error:", error);
    message.warn("Failed to load directory.").then();
  }
};

const startDrag = (e) => {
  isDragging.value = true;
  dragStartY.value = e.touches ? e.touches[0].clientY : e.clientY;
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  const currentY = e.touches ? e.touches[0].clientY : e.clientY;
  dragOffset.value += currentY - dragStartY.value;
  dragStartY.value = currentY;
};

const endDrag = () => {
  isDragging.value = false;
};

const truncateFileName = (name) => {
  return name.replace(/^[a-f0-9-]{36}_/, "");
};

const previewFileClick = async (file) => {
  try {
    const fileUrl = await previewFile(file.name);
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
    downloadFile(
      authKey.value,
      file.name,
      file.name.replace(/^[a-f0-9-]{36}_/, ""),
    );
  } catch (error) {
    message.warn("파일 다운로드에 실패했습니다.").then();
  }
};

const remove = async (file) => {
  try {
    await deleteFile(file.name);
    await loadDirectory(); // 파일 삭제 후 리스트 새로고침
  } catch (error) {
    message.warn("파일 삭제에 실패했습니다.").then();
  }
};

const formatFileSize = (size) => {
  return (size / (1024 * 1024)).toFixed(2) + " MB"; // 메가바이트 변환
};

const cancelUpload = () => {
  selectedFile.value = null; // 선택한 파일 초기화
  authKey.value = ""; // 입력된 비밀번호 초기화
  showPopup.value = false; // 팝업 닫기
};

onMounted(loadDirectory);
</script>

<template>
  <div class="main-container">
    <div class="file-grid">
      <div v-for="(file, index) in directory" :key="index" class="file-item">
        <span class="file-name" @click="previewFileClick(file)">
          {{ truncateFileName(file.name) }}
        </span>
        <div class="button-group">
          <button @click="download(file)" class="button-primary">
            <i class="fa-solid fa-download"></i>
          </button>
          <button @click="remove(file)" class="button-primary">
            <i class="fa-solid fa-ban"></i>
          </button>
        </div>
      </div>
    </div>

    <button class="add-button" @click="showPopup = true">
      <i class="fas fa-plus"></i>
    </button>

    <div v-if="showPopup" class="popup">
      <div class="popup-content">
        <div class="file-upload-area">
          <span v-if="selectedFile" class="file-info">
            {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
          </span>
          <label class="custom-file-upload">
            파일 선택
            <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              hidden
            />
          </label>
        </div>

        <!-- 파일명 입력 필드 -->
        <input
          type="text"
          v-model="customFileName"
          placeholder="업로드할 파일명 입력"
          class="styled-input"
          v-if="selectedFile"
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

    <a-image
      :width="200"
      :preview="{ visible, onVisibleChange: setVisible }"
      :src="src"
      style="display: none"
    />
  </div>
</template>

<style scoped>
.main-container {
  position: relative;
  width: 100%;
  height: 85vh;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

:deep(.ant-image-preview-img) {
  max-width: 90vw; /* 화면 너비 90% 이내로 조정 */
  max-height: 90vh; /* 화면 높이 90% 이내로 조정 */
  object-fit: contain; /* 비율 유지하면서 조정 */
}

.file-grid {
  display: flex;
  flex-direction: column; /* 세로 정렬 */
  overflow-y: auto; /* 세로 스크롤 가능 */
  overflow-x: hidden; /* 가로 스크롤 제거 */
  gap: 10px;
  padding: 10px;
  width: 100%; /* 전체 너비 차지 */
  height: calc(100vh - 120px); /* 하단 네비게이션 및 추가 버튼 제외 */
}

.file-item {
  width: 100%; /* 가로 폭을 부모 크기에 맞춤 */
  padding: 10px;
  background: #1e1e1e;
  border-radius: 6px;
  color: white;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-name {
  max-width: calc(100% - 130px);
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  white-space: nowrap;
}

.add-button {
  position: fixed;
  right: 15px;
  bottom: 60px;
  width: 45px;
  height: 45px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background-color: #42b983;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-upload-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px; /* 기존보다 살짝 줄인 패딩 */
  border: 2px solid #42b983; /* 테두리 유지 */
  border-radius: 6px;
  background: #1e1e1e;
  min-height: 40px; /* 일정한 높이 유지 */
  margin-bottom: 12px; /* 파일 선택 영역과 비밀번호 인풋 사이 간격 조정 */
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background: #1e1e1e;
  border-radius: 6px;
}

.file-info {
  flex-grow: 1; /* 파일명과 용량이 자동 확장 */
  text-align: left;
  font-size: 14px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-left: 8px;
}

.custom-file-upload {
  background-color: #42b983;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  flex-shrink: 0; /* 버튼 크기 고정 */
  margin-left: auto; /* 우측 정렬 */
}

.custom-file-upload:hover {
  background-color: #369d75;
}

.popup-content {
  background: #222;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 400px; /* 팝업 창 가로 길이 고정 */
  max-width: 90vw; /* 화면 크기에 맞춰 조정 */
}

.popup-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.button-primary {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.button-primary:hover {
  background-color: #369d75;
}

.button-secondary {
  background-color: #666;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.button-secondary:hover {
  background-color: #555;
}

.styled-input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  background: #121212;
  color: white;
  margin-bottom: 10px; /* 입력 필드 하단 간격 추가 */
}
</style>
