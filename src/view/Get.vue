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
import {dynamoStore} from "@/stores/dynamoStore.js"

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
      dynamoStore().setObj(obj)
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
  display: flex;
  justify-content: space-between;
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

/* 양쪽 컨테이너 공통 스타일 */
.form-container,
.result-container {
  flex: 1;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 20px;
  background: var(--color-background-soft);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-height: 300px;
}

/* Header 스타일 */
.header {
  font-size: 1.8rem;
  text-align: center;
  color: var(--color-heading);
  margin-bottom: 20px;
}

/* 에러 메시지 */
.error-message {
  margin-top: 15px;
  color: var(--color-accent);
  font-weight: bold;
  text-align: center;
}

/* 결과 텍스트 */
.result-container p {
  font-size: 1.2rem;
  color: var(--color-text);
  text-align: center;
}

.output {
  margin-top: 16px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: black;
  white-space: pre-wrap;
}
</style>