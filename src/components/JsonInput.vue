
<script>
import {ref, computed, watch, onMounted} from 'vue';
import {useDynamoStore} from "@/stores/dynamoStore.js"
import {useRoute} from "vue-router";

export default {
  name: 'KeyValueEditor',
  emits: ['update-json'], // 부모로 이벤트 전달
  setup(props, {emit}) {
    const route = useRoute();
    const keyValuePairs = ref([{key: '', value: ''}]);
    const formattedJson = computed(() => {
      const result = {};
      keyValuePairs.value.forEach((pair) => {
        if (pair.key.trim()) {
          result[pair.key] = pair.value;
        }
      });
      return result;
    });

    onMounted(() => {
      const isEntity = route.name !== 'Put'
      const storedData = isEntity ? useDynamoStore().getEntity?.value : useDynamoStore().getObj?.data;
      if (storedData) {
        try {
          const valueFromGet = isEntity ? storedData : JSON.parse(storedData);
          keyValuePairs.value.pop();
          Object.entries(valueFromGet).forEach(([key, value]) => {
            keyValuePairs.value.push({key: key, value: value});
          });
        } catch (error) {
          console.error('Failed to parse JSON:', error);
        }
      }
    });
    watch(formattedJson, (newJson) => {
      emit('update-json', newJson);
    });

    const addRow = () => {
      keyValuePairs.value.push({key: '', value: ''});
    };

    const removeRow = (index) => {
      if (keyValuePairs.value.length > 1) {
        keyValuePairs.value.splice(index, 1);
      }
    };

    return {
      keyValuePairs,
      formattedJson,
      addRow,
      removeRow,
    };
  },
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
  color: #ffffff; /* 버튼 텍스트 흰색 */
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