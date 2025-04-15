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
        <label for="data"></label>
        <input
          id="data"
          type="text"
          v-model="value"
          placeholder="Enter data"
          class="styled-input"
        />
      </div>

      <div v-else-if="valueInputType === 'json'">
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
