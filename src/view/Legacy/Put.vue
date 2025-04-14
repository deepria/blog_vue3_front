<script setup>
import { onMounted, ref, watch } from "vue";
import JsonInput from "@/components/JsonInput.vue";
import { useDynamoStore } from "@/stores/dynamoStore.js";
import { postData } from "@/services/dynamoService.js";

const dynamoStore = useDynamoStore();
const part = ref("");
const index = ref("");
const pk = ref("");
const value = ref("");
const res = ref(null);
const error = ref(null);
const valueInputType = ref("string");

const handleJsonUpdate = (updatedJson) => {
  value.value = JSON.stringify(updatedJson);
};

const put = async () => {
  try {
    error.value = null;
    res.value = await postData(part.value, index.value, pk.value, value.value);
    dynamoStore.clearObj();
  } catch (err) {
    error.value = "Failed to upsert data";
  }
};
onMounted(() => {
  if (dynamoStore.getObj) {
    const objFromGet = dynamoStore.getObj;
    part.value = objFromGet.part;
    index.value = objFromGet.index;
    value.value = objFromGet.data;
  }
});

watch(valueInputType, () => {
  value.value = "";
});
</script>

<template>
  <div class="content">
    <!-- 입력 및 서브밋 컨테이너 -->
    <div class="container">
      <div>
        <label for="part">Partition Key</label>
        <input
          id="part"
          type="text"
          v-model="part"
          placeholder="Enter partition key"
          class="styled-input"
        />
      </div>

      <div>
        <label for="index">Index Key</label>
        <input
          id="index"
          type="text"
          v-model="index"
          placeholder="Enter index key"
          class="styled-input"
        />
      </div>

      <div>
        <label for="pk">Primary Key</label>
        <input
          id="pk"
          type="text"
          v-model="pk"
          placeholder="Enter primary key"
          class="styled-input"
        />
      </div>

      <div>
        <input
          type="radio"
          id="string"
          value="string"
          v-model="valueInputType"
        />
        <label for="string"> String </label>
        <input type="radio" id="json" value="json" v-model="valueInputType" />
        <label for="json"> JSON </label>
      </div>

      <div v-if="valueInputType === 'string'">
        <label for="value"></label>
        <input
          id="value"
          type="text"
          v-model="value"
          placeholder="Enter value"
          class="styled-input"
        />
      </div>

      <div v-else-if="valueInputType === 'json'">
        <JsonInput @update-json="handleJsonUpdate" />
      </div>
      <button class="button-primary" @click="put">Put Data</button>
    </div>
  </div>
</template>
