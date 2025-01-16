<script setup>
import {onMounted, ref, computed} from "vue";
import {getData, postData} from "@/services/dynamoService.js";
import {uploadFile, downloadFile, loadFiles, deleteFile} from "@/services/fileService.js";

const selectedFile = ref(null); // 선택된 파일
const authKey = ref(""); // 인증 키
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
    console.error("Directory load error:", JSON.stringify(error, null, 2));
    alert("Failed to load directory.");
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
</script>

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
            placeholder="Enter password for permission"
            class="styled-input"
        />
      </div>
      <button class="button-primary" @click="clear">Clear</button>
      &nbsp;
      <button class="button-primary" @click="upload">Upload</button>
    </div>

    <!-- 오른쪽: 디렉터리 가시화 -->
    <div class="directory-container">
      <h1 class="header">Directory Viewer</h1>
      <ul class="directory-list">
        <li v-for="(file, index) in directory" :key="index">
          <span @click="download(file)">{{ file.name.length > 15 ? file.name.slice(0, 15) + '...' : file.name }}</span>
          <button @click="remove(file)">X</button>
        </li>
      </ul>
    </div>
  </div>
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

/* 버튼 스타일 (Vue Green) */
.button-primary {
  display: inline-block;
  padding: 12px 20px;
  font-size: 14px;
  background-color: #42b983; /* Vue Green */
  color: #ffffff; /* 버튼 텍스트 흰색 */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s;
}

.button-primary:hover {
  background-color: #3a9d74; /* 약간 더 어두운 Vue Green */
}

.button-primary:active {
  transform: scale(0.98); /* 클릭 시 약간 축소 */
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

/* 삭제 버튼 (빨간색) */
.directory-list li button {
  padding: 6px 12px;
  font-size: 12px;
  background-color: #ff4d4d; /* 삭제 버튼 빨간색 */
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s;
}

.directory-list li button:hover {
  background-color: #cc0000; /* 더 어두운 빨간색 */
}

.directory-list li button:active {
  transform: scale(0.95); /* 클릭 시 축소 효과 */
}

.directory-list li button:focus {
  outline: 2px solid #ff4d4d; /* 빨간색 외곽선 */
  outline-offset: 2px;
}

/* 모바일 최적화 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    gap: 20px;
    padding: 10px 20px; /* 좁은 화면에서 여백 추가 */
  }
}
</style>