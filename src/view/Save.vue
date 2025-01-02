<template>
  <div class="main-container">
    <!-- 입력 및 서브밋 컨테이너 -->
    <div class="form-container">
      <h1 class="header">Upsert Entity</h1>
      <div class="form-group">
        <label for="part">Partition Key</label>
        <input
            id="id"
            type="text"
            v-model="id"
            placeholder="Enter partition key"
            class="styled-input"
        />
      </div>

      <div class="radio-group">
        <input type="radio" id="string" value="string" v-model="valueInputType"/>
        <label for="string">
          <span class="radio-circle"></span>
          String
        </label>
        <input type="radio" id="json" value="json" v-model="valueInputType"/>
        <label for="json">
          <span class="radio-circle"></span>
          JSON
        </label>
      </div>

      <div v-if="valueInputType ==='string'" class="form-group">
        <label for="data">Data - String</label>
        <input
            id="data"
            type="text"
            v-model="value"
            placeholder="Enter data"
            class="styled-input"
        />
      </div>

      <div v-else-if="valueInputType ==='json'" class="form-group">
        <h4>Data - Json</h4>
        <JsonInput @update-json="handleJsonUpdate"/>
      </div>

      <button class="button-primary" @click="put">Put Data</button>
    </div>

    <div class="result-container">
      <h1 class="header">Result</h1>
      <div v-if="error" class="error-message">
        <p>Error: {{ error }}</p>
      </div>
      <div v-else-if="res">
        <p><strong>Result :</strong> {{ res }}</p>
      </div>
      <div v-else>
        <p>No Data Yet</p>
      </div>
    </div>
  </div>
</template>

<script>
import {onMounted, ref, watch} from "vue";
import {postEntity} from "../services/dynamoService.js";
import JsonInput from "@/components/JsonInput.vue";
import {useDynamoStore} from "@/stores/dynamoStore.js"

export default {
  components: {
    JsonInput
  },
  setup() {

    const id = ref("");
    const value = ref("");
    const valueInputType = ref("string");
    const error = ref(null);
    const res = ref("");

    onMounted(() => {
      if (useDynamoStore().getEntity) {
        const objFromGet = useDynamoStore().getEntity
        console.log(JSON.stringify(objFromGet, null, 2))
        id.value = objFromGet.id
        value.value = objFromGet.value
      }
    })

    watch(valueInputType, () => {
      value.value = ""
    });

    const handleJsonUpdate = (updatedJson) => {
      value.value = JSON.stringify(updatedJson);
    };

    const put = async () => {
      try {
        error.value = null;
        const entity = {
          id: id.value,
          value: value.value,
        }
        useDynamoStore().setEntity(entity);
        res.value = await postEntity();
      } catch (err) {
        error.value = "Failed to upsert data";
      }
    };


    return {
      id,
      value,
      error,
      valueInputType,
      res,
      put,
      handleJsonUpdate,
    };
  }
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
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  min-height: 300px;
}

/* Header 스타일 */
.header {
  font-size: 1.8rem;
  text-align: center;
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

/* 라디오 버튼 컨테이너 */
.radio-group {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

/* 기본 라디오 버튼 숨기기 */
.radio-group input[type="radio"] {
  display: none;
}

/* 커스텀 라벨 스타일 */
.radio-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
}

/* 선택된 상태 스타일 */
.radio-group input[type="radio"]:checked + label {
  background-color: #4caf50;
  border-color: #4caf50;
  color: white;
}

/* 라벨 호버 스타일 */
.radio-group label:hover {
  background-color: #f5f5f5;
}

/* 라디오 버튼 동그라미 스타일 */
.radio-circle {
  width: 16px;
  height: 16px;
  border: 2px solid #4caf50;
  border-radius: 50%;
  display: inline-block;
  position: relative;
}

/* 선택된 상태에서 동그라미 내부 표시 */
.radio-circle::after {
  content: '';
  width: 8px;
  height: 8px;
  background-color: #4caf50;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
}

input[type="radio"]:checked + label .radio-circle::after {
  opacity: 1;
}
</style>