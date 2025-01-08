<template>
  <div class="main-container">
    <!-- 입력 및 서브밋 컨테이너 -->
    <div class="form-container">
      <h1 class="header">Get Data</h1>
      <div class="form-group">
        <label for="part">Partition Key</label>
        <input
            id="part"
            type="text"
            v-model="part"
            placeholder="Enter partition key"
            class="styled-input"
        />
      </div>

      <div class="form-group">
        <label for="index">Index Key</label>
        <input
            id="index"
            type="text"
            v-model="index"
            placeholder="Enter index key"
            class="styled-input"
        />
      </div>

      <button class="button-primary" @click="get">Get Data</button>
    </div>
<br />
    <!-- 결과 컨테이너 -->
    <div class="result-container">
      <h1 class="header">Result</h1>
      <div v-if="error" class="error-message">
        <p>Error: {{ error }}</p>
      </div>
      <div v-else-if="data">
        <pre class="output">{{ data }}</pre>
      </div>
      <div v-else>
        <p>No Data Yet</p>
      </div>

      <br/>
      <button class="button-primary" @click="modify">Modify</button>
    </div>
  </div>
</template>

<script>
import {ref} from "vue";
import {getData} from "../services/dynamoService.js";
import {useRouter} from "vue-router";
import {useDynamoStore} from "@/stores/dynamoStore.js"

export default {
  setup() {
    const router = useRouter();
    const part = ref("");
    const index = ref("");
    const data = ref(null);
    const error = ref(null);

    const get = async () => {
      try {
        error.value = null;
        data.value = JSON.stringify(await getData(part.value, index.value), null, 2);
      } catch (err) {
        error.value = "Failed to load data.";
      }
    };

    const modify = () => {
      const obj = {
        part: part.value,
        index: index.value,
        data: data.value
      }
      useDynamoStore().setObj(obj)
      router.push('/put')
    };

    return {
      router,
      part,
      index,
      data,
      error,
      get,
      modify
    };
  },
};
</script>

<style scoped>
.main-container {
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  color: #ffffff; /* 기본 텍스트 흰색 */
  background-color: #121212; /* 기본 배경 검은색 */
}

/* 양쪽 컨테이너 공통 스타일 */
.form-container,
.result-container {
  border: 1px solid #333333; /* 어두운 경계선 */
  border-radius: 10px;
  padding: 20px;
  background: #1e1e1e; /* 어두운 회색 배경 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* 더 뚜렷한 그림자 */
  min-height: 300px;
}

/* Header 스타일 */
.header {
  font-size: 1.8rem;
  text-align: center;
  color: #42b983; /* Vue Green */
  margin-bottom: 20px;
  border-bottom: 2px solid #333333; /* 헤더 아래 구분선 */
  padding-bottom: 10px;
}

/* 에러 메시지 */
.error-message {
  margin-top: 15px;
  color: #ff4d4d; /* 에러 메시지 강조를 위한 빨간색 */
  font-weight: bold;
  text-align: center;
}

/* 결과 텍스트 */
.result-container p {
  font-size: 1.2rem;
  color: #ffffff; /* 텍스트 흰색 */
  text-align: center;
}

/* Output 스타일 */
.output {
  margin-top: 16px;
  padding: 8px;
  border: 1px solid #555555; /* 어두운 회색 경계선 */
  border-radius: 4px;
  background-color: #000000; /* 검은 배경 */
  color: #ffffff; /* 흰색 텍스트 */
  white-space: pre-wrap; /* 텍스트 줄바꿈 유지 */
}

/* 버튼 스타일 */
.button {
  display: inline-block;
  padding: 12px 20px;
  font-size: 1rem;
  background-color: #42b983; /* Vue Green */
  color: #ffffff; /* 버튼 텍스트 흰색 */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s;
}

.button:hover {
  background-color: #3a9d74; /* 약간 더 어두운 Vue Green */
}

.button:active {
  transform: scale(0.98); /* 클릭 시 축소 효과 */
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    gap: 15px;
  }

  .form-container,
  .result-container {
    min-height: 200px;
  }

  .header {
    font-size: 1.5rem;
  }
}
</style>