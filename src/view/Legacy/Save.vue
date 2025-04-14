<template>
  <div class="content">
    <!-- 입력 및 서브밋 컨테이너 -->
    <div class="container">
      <div>
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
        <input
          type="radio"
          id="string"
          value="string"
          v-model="valueInputType"
        />
        <label for="string">
          <span class="radio-circle"></span>
          String
        </label>
        <input type="radio" id="json" value="json" v-model="valueInputType" />
        <label for="json">
          <span class="radio-circle"></span>
          JSON
        </label>
      </div>

      <div v-if="valueInputType === 'string'">
        <label for="data">Data - String</label>
        <input
          id="data"
          type="text"
          v-model="value"
          placeholder="Enter data"
          class="styled-input"
        />
      </div>

      <div v-else-if="valueInputType === 'json'">
        <h4>Data - Json</h4>
        <JsonInput @update-json="handleJsonUpdate" />
      </div>
      <div style="display: flex">
        <button class="button-primary" @click="put">Put Data</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { postEntity } from "@/services/dynamoService.js";
import { useDynamoStore } from "@/stores/dynamoStore.js";
import JsonInput from "@/components/JsonInput.vue";

const id = ref("");
const value = ref("");
const valueInputType = ref("string");
const error = ref(null);
const res = ref("");

const handleJsonUpdate = (updatedJson) => {
  value.value = JSON.stringify(updatedJson);
};

const put = async () => {
  try {
    error.value = null;
    const entity = {
      id: id.value,
      value: value.value,
    };
    useDynamoStore().setEntity(entity);
    res.value = await postEntity();
  } catch (err) {
    error.value = "Failed to upsert data";
  }
};

onMounted(() => {
  if (useDynamoStore().getEntity) {
    const objFromGet = useDynamoStore().getEntity;
    console.log(JSON.stringify(objFromGet, null, 2));
    id.value = objFromGet.id;
    value.value = objFromGet.value;
  }
});

watch(valueInputType, () => {
  value.value = "";
});
</script>
<style scoped>
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
  border: 1px solid #555555; /* 어두운 회색 경계선 */
  border-radius: 4px;
  cursor: pointer;
  color: #e0e0e0; /* 텍스트 밝은 회색 */
  background-color: #1e1e1e; /* 어두운 회색 배경 */
  transition:
    background-color 0.3s,
    border-color 0.3s;
}

/* 선택된 상태 스타일 */
.radio-group input[type="radio"]:checked + label {
  border-color: #42b983;
  color: #ffffff; /* 선택된 상태 텍스트 흰색 */
}

/* 라벨 호버 스타일 */
.radio-group label:hover {
  background-color: #333333; /* 밝은 회색 배경 */
}

/* 라디오 버튼 동그라미 스타일 */
.radio-circle {
  width: 16px;
  height: 16px;
  border: 2px solid #42b983; /* Vue Green */
  border-radius: 50%;
  display: inline-block;
  position: relative;
}

/* 선택된 상태에서 동그라미 내부 표시 */
.radio-circle::after {
  content: "";
  width: 8px;
  height: 8px;
  background-color: #42b983; /* Vue Green */
  border-radius: 50%;
  position: absolute;
  top: 45%;
  left: 45%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
}

input[type="radio"]:checked + label .radio-circle::after {
  opacity: 1;
}
</style>
