<template>
  <div class="main-container">
    <!-- 왼쪽: 파일 업로드 및 다운로드 설정 -->
    <div class="upload-container">
      <h1 class="header">File Upload & Download</h1>

      <!-- 파일 업로드 -->
      <div class="form-group">
        <label for="fileUpload">Select File</label>
        <input
            type="file"
            id="fileUpload"
            @change="handleFileChange"
            class="styled-input"
        />
        <p v-if="selectedFile" class="file-info">
          Selected File: {{ selectedFile.name }} ({{ selectedFile.size }} bytes)
        </p>
      </div>

      <!-- 다운로드 설정 -->
      <div class="form-group">
        <label for="authKey">Authentication Key</label>
        <input
            type="text"
            id="authKey"
            v-model="authKey"
            placeholder="Enter Authentication Key"
            class="styled-input"
        />
      </div>
      <button class="button-primary" @click="clear">Clear</button>
      &nbsp;
      <button class="button-primary" @click="upload">Upload</button>
    </div>
    <br/>
    <br/>
    <br/>
    <!-- 오른쪽: 디렉터리 가시화 -->
    <div class="directory-container">
      <h1 class="header">Directory Viewer</h1>
      <ul class="directory-list">
        <li v-for="(file, index) in directory" :key="index">
          <span @click="download(file)">{{ file.name.length > 15? file.name.slice(0,15)+'...' : file.name }}</span>
          <button @click="remove(file)">X</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {onMounted, ref, watch} from "vue";
import {getData, postData} from "../services/dynamoService.js";
import {uploadFile, downloadFile, loadFiles, deleteFile} from "@/services/fileService.js";
import {useDynamoStore} from "@/stores/dynamoStore.js";

export default {
  setup() {
    const selectedFile = ref(null); // 선택된 파일
    const authKey = ref(""); // 인증 키
    const downloadPath = ref(""); // 다운로드 경로
    const directory = ref([]); // 디렉터리 가시화 데이터

    // 파일 선택 핸들러
    const handleFileChange = (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        selectedFile.value = files[0]; // 파일 설정
      } else {
        console.error("No file selected.");
      }
    };

    // 파일 선택 핸들러
    const fileOnClick = (file) => {
      downloadPath.value = file.path;
    };

    // 파일 업로드
    const upload = async () => {
      try {
        const response = await uploadFile(selectedFile.value);
        if (response.status === 200) {
          await postData('file', 'file:' + selectedFile.value.name, 'authKey', authKey.value);
          selectedFile.value = null
          authKey.value = ''
          await loadDirectory();
        } else {
          alert("File upload failed.");
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("File upload failed.");
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
          alert("File download failed.");
        }
      } else {
        alert("Authentication failed");
      }
    };

    // 디렉터리 데이터 로드
    const loadDirectory = async () => {
      try {
        const response = await loadFiles();
        directory.value = response.data; // 파일 목록 업데이트
      } catch (error) {
        console.error("Directory load error:", JSON.stringify(error,null,2));
        alert("Failed to load directory.");
      }
    };

    // 파일 삭제
    const deleteFileHandler = async (file) => {
      const key = await getData('file', 'file:' + file.name);
      if (key === authKey.value) {
        try {
          await deleteFile(file.path);
          authKey.value = ''
          // 삭제 후 파일 목록 갱신
          await loadDirectory();
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      } else {
        alert("Authentication failed");
      }
    };
    const clear = () => {
      authKey.value = '';
    };

    // 초기 디렉터리 로드
    onMounted(loadDirectory);

    return {
      selectedFile,
      authKey,
      downloadPath,
      directory,
      handleFileChange,
      fileOnClick,
      upload,
      download,
      remove: deleteFileHandler,
      clear
    };
  },
};
</script>


<style scoped>
/* 전체 컨테이너 */
.main-container {
  justify-content: space-between;
  gap: 30px;
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* 업로드 및 디렉터리 컨테이너 */
.upload-container,
.directory-container {
  flex: 1;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  background: #f9f9f9;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 헤더 스타일 */
.header {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
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
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.styled-input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

/* 버튼 스타일 (파란 버튼) */
.button-primary {
  display: inline-block;
  padding: 12px 20px;
  font-size: 14px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  filter: invert(0); /* 반전 효과 무시 */
}

.button-primary:hover {
  background-color: #0056b3;
}

.button-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 디렉터리 리스트 */
.directory-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.directory-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  transition: background-color 0.3s ease;
}

.directory-list li:hover {
  background-color: #f1f1f1;
}

.directory-list li span {
  font-size: 14px;
  color: #333;
  cursor: pointer;
  text-decoration: underline;
}

.directory-list li span:hover {
  color: #007bff;
}

/* 삭제 버튼 (빨간 버튼) */
.directory-list li button {
  padding: 6px 12px;
  font-size: 12px;
  background-color: #ff4d4d;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  filter: invert(0); /* 반전 효과 무시 */
}

.directory-list li button:hover {
  background-color: #cc0000;
}

/* 흑백 제외된 버튼 */
.button-primary,
.directory-list li button {
  filter: invert(0);
}

label {
  color: black; /* 원하는 색상 */
  font-size: 14px; /* 폰트 크기 조정 가능 */
}
</style>