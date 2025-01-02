<template>
  <div class="main-container">
    <!-- 입력 및 서브밋 컨테이너 -->
    <div class="form-container">
      <h1 class="header">Get Entity</h1>
      <div class="form-group">
        <label for="id">ID</label>
        <input
            id="id"
            type="text"
            v-model="id"
            placeholder="Enter ID"
            class="styled-input"
        />
      </div>
      <button class="button-primary" @click="clear">Clear</button>
      &nbsp;
      <button class="button-primary" @click="get">Get</button>
    </div>

    <!-- 결과 컨테이너 -->
    <div class="result-container">
      <h1 class="header">Result</h1>
      <div v-if="error" class="error-message">
        <p>Error: {{ error }}</p>
      </div>
      <div v-else-if="paginatedData.length">
        <!-- 페이징 버튼 -->
        <div class="pagination">
          <button
              class="button-primary"
              @click="prevPage"
              :disabled="currentPage === 1"
          >
            Previous
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button
              class="button-primary"
              @click="nextPage"
              :disabled="currentPage === totalPages"
          >
            Next
          </button>
        </div>
        <div v-for="child in paginatedData" :key="child.id">
          <pre class="output">{{ child }}</pre>
        </div>

      </div>
      <div v-else>
        <p>No Data Yet</p>
      </div>
    </div>
  </div>
</template>

<script>
import {getList, getById} from "../services/dynamoService.js";
import {useRouter} from "vue-router";
import {useDynamoStore} from "@/stores/dynamoStore.js"
import {ref, computed} from "vue";

export default {
  setup() {
    const id = ref("");
    const data = ref([]);
    const error = ref(null);

    // 페이징 관련 상태
    const currentPage = ref(1);
    const itemsPerPage = ref(1); // 페이지당 항목 수
    const totalItems = computed(() => data.value.length);
    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

    // 현재 페이지 데이터
    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return data.value.slice(start, end);
    });

    const get = async () => {
      try {
        error.value = null;
        let res = id.value === '' ? await getList() : await getById(id.value);

        const temp = [];
        for (const [key, value] of Object.entries(res)) {
          let tempKey = null;
          let tempVal = null;

          for (const [innerKey, innerValue] of Object.entries(value)) {
            if (innerKey === 'id') {
              tempKey = innerValue;
            } else {
              tempVal = innerValue;
            }
          }

          if (typeof tempVal === 'string' && tempVal.includes('{')) {
            temp.push({id: tempKey, value: JSON.parse(tempVal)});
          } else {
            temp.push({id: tempKey, value: tempVal});
          }
        }
        data.value = temp;
      } catch (err) {
        console.log(err);
        error.value = `Failed to load data: ${err.message || err}`;
      }
    };

    const clear = () => {
      id.value = "";
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    return {
      id,
      data,
      error,
      get,
      clear,
      currentPage,
      itemsPerPage,
      totalPages,
      paginatedData,
      nextPage,
      prevPage,
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
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
}

.pagination button {
  padding: 8px 16px;
}
</style>