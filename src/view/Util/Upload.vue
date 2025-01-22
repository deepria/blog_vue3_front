<script setup>
import {onMounted, ref} from "vue";
import {getData, postData} from "@/services/dynamoService.js";
import {uploadFile, previewFile, downloadFile, loadFiles, deleteFile} from "@/services/fileService.js";
import {v4 as uuidv4} from "uuid";
import {message} from "ant-design-vue";

const fileInput = ref(null);
const selectedFile = ref(null); // 선택된 파일
const authKey = ref(""); // 인증 키
const directory = ref([]); // 디렉터리 가시화 데이터
const visible = ref(false);
const src = ref("");

// 파일 선택 핸들러
const handleFileChange = (event) => {
  if (event.target !== null) {
    const files = event.target.files;
    if (files.length > 0) {
      selectedFile.value = files[0]; // 파일 설정
    }
  } else {
    // selectedFile.value = null;
    console.error("No file selected.");
  }
};

// 파일 업로드
const upload = async () => {
  try {
    const baseName = selectedFile.value.name.replace(/\s+/g, "_") // 공백을 `_`로 변환
        .replace(/[^a-zA-Z0-9_.-]/g, "_") // 특수문자 제거
        .replace(/_+/g, "_") // 연속된 `_`를 하나로 변환
        .replace(/^_|_$/g, ""); // 앞뒤 `_` 제거
    const uuid = `${uuidv4()}_${baseName}`; // UUID + 안전한 파일명
    // 새로운 File 객체 생성
    const newFile = new File([selectedFile.value], uuid, {
      type: selectedFile.value.type, // 원본 파일 타입 유지
      lastModified: selectedFile.value.lastModified // 원본 수정 시간 유지
    });

    const response = await uploadFile(newFile);
    if (response.status === 200) {
      await postData('file', 'file:' + uuid, 'authKey', authKey.value);
      await loadDirectory();
    } else {
      message.warn("File upload failed.").then();
    }
  } catch (error) {
    message.warn("File upload failed.").then();
    console.error("Upload error:", error);
  } finally {
    authKey.value = ''
    clearFileInput();
    // handleFileChange(new Event("change"));
  }
};

// 파일 다운로드
const download = async (file) => {
  const key = await getData('file', 'file:' + file.name);
  if (key === authKey.value) {
    try {
      await downloadFile(authKey.value, file.path, file.name);
      authKey.value = '';
    } catch (error) {
      console.error("Download error:", error);
      message.warn("File download failed.").then();
    }
  } else {
    message.warn("File download failed.").then();
  }
};

// 디렉터리 데이터 로드
const loadDirectory = async () => {
  try {
    const response = await loadFiles();
    directory.value = response.data; // 파일 목록 업데이트
  } catch (error) {
    console.error("Directory load error:", JSON.stringify(error, null, 2));
    message.warn("Failed to load directory.").then();
  }
};

// 파일 삭제
const remove = async (file) => {
  const key = await getData('file', 'file:' + file.name);
  if (key === authKey.value) {
    try {
      await deleteFile(file.path);
      authKey.value = ''
      // 삭제 후 파일 목록 갱신
      await loadDirectory();
    } catch (error) {
      message.warn("Failed to delete file.").then();
    }
  } else {
    message.warn("Authentication failed").then();
  }
};
const clear = () => {
  authKey.value = '';
  clearFileInput();
  // handleFileChange(new Event("change"));
};

const preview = async (value, file) => {
  const key = await getData('file', 'file:' + file.name);
  if (key === authKey.value) {
    setVisible(value);
    try {
      const imageUrl = await previewFile(file.name); // Blob URL 받아오기
      if (imageUrl) {
        src.value = imageUrl; // 미리보기 URL 설정
      } else {
        message.warn("Failed to load preview.").then();
      }
    } catch (error) {
      message.warn("Failed to load preview.").then();
      console.error("Error loading preview:", error);
    }
  } else {
    message.warn("Authentication failed").then();
  }
};

const setVisible = value => {
  visible.value = value;
};
const clearFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = ""; // 파일 입력 필드 초기화
    selectedFile.value = null;
  }
};
// 초기 디렉터리 로드
onMounted(loadDirectory);

</script>


<template>
  <div class="main-container">
    <!-- 왼쪽: 파일 업로드 및 다운로드 설정 -->
    <div class="upload-container">
      <h1 class="header">File Upload & Download</h1>

      <!-- 파일 업로드 -->
      <div class="form-group">
        <label for="fileUpload" class="custom-file-upload">Select File</label>
        <input
            type="file"
            ref="fileInput"
            id="fileUpload"
            @change="handleFileChange"
        />
        <p v-if="selectedFile" class="file-info">
          {{ selectedFile.name }} ({{ selectedFile.size }} bytes)
        </p>
        <p v-else class="file-info">No selected file</p>
      </div>

      <!-- 다운로드 설정 -->
      <div class="form-group">
        <label for="authKey">Authentication Key</label>
        <input
            type="text"
            id="authKey"
            v-model="authKey"
            placeholder="Enter password for permission"
            class="styled-input"
        />
      </div>
      <button class="button-primary" @click="clear">Clear</button>
      <button class="button-primary" @click="upload">Upload</button>
    </div>

    <!-- 오른쪽: 디렉터리 가시화 -->
    <div class="directory-container">
      <h1 class="header">Directory Viewer</h1>
      <ul class="directory-list">
        <li v-for="(file, index) in directory" :key="index">
          <span @click="() => preview(true,file)">{{
              file.name.length > 15 ? file.name.replace(/^[a-f0-9-]{36}_/, "").slice(-15) : file.name.replace(/^[a-f0-9-]{36}_/, "")
            }}</span>
          <div class="button-group">
            <button @click="download(file)" class="button-primary"><i class="fa-solid fa-download"></i></button>
            <button @click="remove(file)" class="button-primary"><i class="fa-solid fa-ban"></i></button>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <a-image
      :width="200"
      :style="{ display: 'none' }"
      :preview="{  visible,  onVisibleChange: setVisible,}"
      :src="src"/>
</template>

<style scoped>
/* 전체 컨테이너 */
.main-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  color: #ffffff; /* 모든 텍스트 색상 흰색 */
  background-color: #121212; /* 기본 배경 검은색 */
}

/* 업로드 및 디렉터리 컨테이너 */
.upload-container,
.directory-container {
  flex: 1;
  border: 2px solid #333333; /* 어두운 회색 경계선 */
  border-radius: 12px;
  padding: 20px;
  background: #1e1e1e; /* 어두운 회색 배경 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3); /* 뚜렷한 그림자 */
}

/* 헤더 스타일 */
.header {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 20px;
  color: #42b983; /* Vue Green */
  border-bottom: 2px solid #333333; /* 구분선 */
  padding-bottom: 10px;
}

/* 폼 그룹 */
.form-group {
  margin-bottom: 20px;
}

.styled-input {
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border: 1px solid #555555; /* 어두운 회색 경계선 */
  border-radius: 6px;
  font-size: 14px;
  background-color: #121212; /* 입력 필드 배경 검은색 */
  color: #ffffff; /* 텍스트 색상 흰색 */
  box-sizing: border-box;
}

.styled-input::placeholder {
  color: #aaaaaa; /* Placeholder 색상 */
}

.styled-input:focus {
  border-color: #42b983; /* Vue Green */
  background-color: #1a1a1a; /* 포커스 시 약간 밝은 배경 */
  outline: none;
  box-shadow: 0 0 5px rgba(66, 185, 131, 0.3);
}

input[type="file"] {
  display: none;
}

.custom-file-upload {
  display: inline-block;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  border: 1px solid #42b983;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
}

.custom-file-upload:hover {
  background-color: #42b983;
}


/* 디렉터리 리스트 */
.directory-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.directory-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid #555555; /* 어두운 회색 경계선 */
  border-radius: 6px;
  margin-bottom: 10px;
  background-color: #1e1e1e; /* 어두운 배경 */
  color: #e0e0e0; /* 텍스트 약간 밝은 회색 */
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.directory-list li:hover {
  background-color: #333333; /* 밝은 회색 배경 */
  transform: scale(1.02); /* 약간 확대 효과 */
}

.directory-list li span {
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

.directory-list li span:hover {
  color: #42b983; /* Vue Green */
}

.button-group {
  display: flex;
  gap: 2px;
}

.button-group button {
  padding: 6px 12px;
  font-size: 12px;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    gap: 20px;
    padding: 10px 20px; /* 좁은 화면에서 여백 추가 */
  }
}

.file-info {
  align-content: center
}

</style>