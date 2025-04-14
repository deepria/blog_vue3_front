<script setup>
import { ref } from "vue";
import { deleteData, getData } from "@/services/dynamoService.js";
import { useRouter } from "vue-router";
import { useDynamoStore } from "@/stores/dynamoStore.js";
import { message } from "ant-design-vue";

const router = useRouter();
const part = ref("");
const index = ref("");
const data = ref(null);

const get = async () => {
  if (!part.value || !index.value) {
    const emptyVal = !part.value ? "Partition Key" : "Index Key";
    message.warn(`${emptyVal} is empty!`).then(); // 통신 실패 메시지 표시
  } else {
    data.value = JSON.stringify(
      await getData(part.value, index.value),
      null,
      2,
    );
  }
};

const modify = () => {
  const obj = {
    part: part.value,
    index: index.value,
    data: data.value,
  };
  useDynamoStore().setObj(obj);
  router.push("/put");
};
const remove = () => {
  deleteData(part.value, index.value);
  part.value = "";
  index.value = "";
  data.value = null;
};
</script>

<template>
  <div class="content">
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
      <button class="button-primary" @click="get">Get Data</button>
    </div>
    <br />
    <!-- 결과 컨테이너 -->
    <div class="container">
      <div v-if="data">
        <pre>{{ data }}</pre>
        <br />
        <div class="button-group">
          <button class="button-primary" @click="modify">Modify</button>
          <button class="button-primary" @click="remove">Delete</button>
        </div>
      </div>
      <div v-else>
        <p></p>
      </div>
    </div>
  </div>
</template>
