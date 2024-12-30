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

<script>
import {ref, computed, watch, onMounted} from 'vue';
import {dynamoStore} from "@/stores/dynamoStore.js"

export default {
  name: 'KeyValueEditor',
  emits: ['update-json'], // 부모로 이벤트 전달
  setup(props, {emit}) {
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
      const storedData = dynamoStore().getObj?.data;
      if (storedData) {
        try {
          const valueFromGet = JSON.parse(storedData);
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

<style scoped>
.key-value-editor {
  width: 400px;
  margin: 0 auto;
}

.key-value-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.input {
  flex: 1;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.output {
  margin-top: 16px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: black;
  white-space: pre-wrap;
}

button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #ddd;
}
</style>