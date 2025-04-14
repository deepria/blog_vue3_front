<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useDynamoStore } from "@/stores/dynamoStore.js";
import { useRoute } from "vue-router";

// emits 선언
const emit = defineEmits(["update-json"]);

const route = useRoute();
const keyValuePairs = ref([{ key: "", value: "" }]);

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
  const isEntity = route.name !== "Put";
  const storedData = isEntity ? store.getEntity?.value : store.getObj?.data;

  if (storedData) {
    try {
      const valueFromGet = isEntity ? storedData : JSON.parse(storedData);
      keyValuePairs.value = Object.entries(valueFromGet).map(
        ([key, value]) => ({
          key,
          value,
        }),
      );
    } catch (error) {
      console.error("Failed to parse JSON:", error);
    }
  }
});

// formattedJson이 변경될 때 부모 컴포넌트에 이벤트 전송
watch(formattedJson, (newJson) => {
  emit("update-json", newJson);
});

const addRow = () => {
  keyValuePairs.value.push({ key: "", value: "" });
};

const removeRow = (index) => {
  if (keyValuePairs.value.length > 1) {
    keyValuePairs.value.splice(index, 1);
  }
};
</script>

<template>
  <div class="key-value-editor">
    <div
      v-for="(pair, index) in keyValuePairs"
      :key="index"
      class="key-value-row"
    >
      <input v-model="pair.key" placeholder="Enter key" class="styled-input" />
      <input
        v-model="pair.value"
        placeholder="Enter value"
        class="styled-input"
      />
      <button class="button-primary" @click="removeRow(index)">
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
    <button class="button-primary" @click="addRow">Add Row</button>
    <pre class="output">{{ formattedJson }}</pre>
  </div>
</template>

<style scoped>
.key-value-editor {
  margin: 0 auto;
  color: #ffffff; /* 기본 텍스트 흰색 */
}

.key-value-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
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
</style>
