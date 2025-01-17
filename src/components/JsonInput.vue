<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useDynamoStore } from "@/stores/dynamoStore.js";
import { useRoute } from "vue-router";

// emits 선언
const emit = defineEmits(['update-json']);

const route = useRoute();
const keyValuePairs = ref([{ key: '', value: '' }]);

const formattedJson = computed(() => {
  const result = {};
  keyValuePairs.value.forEach((pair) => {
    if (pair.key.trim()) {
      result[pair.key] = pair.value;
    }
  });
  return result;
});

// onMounted에서 DynamoDB 데이터 가져오기
onMounted(() => {
  const store = useDynamoStore();
  const isEntity = route.name !== 'Put';
  const storedData = isEntity ? store.getEntity?.value : store.getObj?.data;

  if (storedData) {
    try {
      const valueFromGet = isEntity ? storedData : JSON.parse(storedData);
      keyValuePairs.value = Object.entries(valueFromGet).map(([key, value]) => ({
        key,
        value
      }));
    } catch (error) {
      console.error('Failed to parse JSON:', error);
    }
  }
});

// formattedJson이 변경될 때 부모 컴포넌트에 이벤트 전송
watch(formattedJson, (newJson) => {
  emit('update-json', newJson);
});

const addRow = () => {
  keyValuePairs.value.push({ key: '', value: '' });
};

const removeRow = (index) => {
  if (keyValuePairs.value.length > 1) {
    keyValuePairs.value.splice(index, 1);
  }
};
</script>

<template>
  <div class="key-value-editor">
    <div v-for="(pair, index) in keyValuePairs" :key="index" class="key-value-row">
      <input
          v-model="pair.key"
          placeholder="Enter key"
          class="input"
      />
      <input
          v-model="pair.value"
          placeholder="Enter value"
          class="input"
      />
      <button @click="removeRow(index)">Delete</button>
    </div>
    <button @click="addRow">Add Row</button>
    <pre class="output">{{ formattedJson }}</pre>
  </div>
</template>

<style scoped>
.key-value-editor {
  max-width: 900px;
  margin: 0 auto;
  color: #ffffff; /* 기본 텍스트 흰색 */
  background-color: #1e1e1e; /* 배경 검은색 */
}

.key-value-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.input {
  flex: 1;
  padding: 4px;
  border: 1px solid #555555; /* 어두운 회색 경계선 */
  border-radius: 4px;
  background-color: #1e1e1e; /* 어두운 회색 배경 */
  color: #ffffff; /* 텍스트 흰색 */
}

.input::placeholder {
  color: #aaaaaa; /* Placeholder 색상 */
}

.input:focus {
  border-color: #42b983; /* Vue Green */
  outline: none;
  box-shadow: 0 0 5px rgba(66, 185, 131, 0.3); /* 포커스 시 시각적 피드백 */
}

.output {
  margin-top: 16px;
  padding: 8px;
  border: 1px solid #555555; /* 어두운 회색 경계선 */
  border-radius: 4px;
  background-color: #000000; /* 배경 검은색 */
  color: #ffffff; /* 텍스트 흰색 */
  white-space: pre-wrap; /* 텍스트 줄바꿈 유지 */
}

button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background-color: #42b983; /* Vue Green */
  color: #000000; /* 버튼 텍스트 흰색 */
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s;
}

button:hover {
  background-color: #3a9d74; /* 약간 더 어두운 Vue Green */
}

button:active {
  transform: scale(0.98); /* 클릭 시 약간 축소 효과 */
}
</style>