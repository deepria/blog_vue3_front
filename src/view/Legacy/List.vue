<template>
  <div class="content">
    <!-- 입력 및 서브밋 컨테이너 -->
    <div class="container">
      <div>
        <label for="id"></label>
        <input
          id="id"
          type="text"
          v-model="id"
          placeholder="Enter ID"
          class="styled-input"
        />
      </div>
      <div class="button-group">
        <button class="button-primary" @click="clear">Clear</button>
        <button class="button-primary" @click="get">Get</button>
      </div>
    </div>
    <br />
    <!-- 결과 컨테이너 -->
    <div class="content">
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
          <div v-for="grandChild in child" :key="grandChild.id">
            <pre
              v-if="child.id === grandChild"
              class="output"
            ><a>{{ grandChild }}</a></pre>
            <div v-else v-for="(value, key) in grandChild" :key="key.id">
              <pre
                @click="onClickValue(value)"
                class="output"
              ><a>{{ key }}</a><br/>{{ value }}</pre>
            </div>
          </div>
        </div>
        <br />
        <div class="button-group">
          <button class="button-primary" @click="deleteData">delete</button>
          <button class="button-primary" @click="modify">modify</button>
        </div>
      </div>
      <div v-else>
        <p>No result</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getList, getById, deleteEntity } from "@/services/dynamoService.js";
import { useRouter } from "vue-router";
import { useDynamoStore } from "@/stores/dynamoStore.js";
import { ref, computed } from "vue";
import { message } from "ant-design-vue";

const router = useRouter();
const id = ref("");
const data = ref([]);
const error = ref(null);

// 페이징 관련 상태
const currentPage = ref(1);
const itemsPerPage = ref(1); // 페이지당 항목 수
const totalItems = computed(() => data.value.length);
const totalPages = computed(() =>
  Math.ceil(totalItems.value / itemsPerPage.value),
);

// 현재 페이지 데이터
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return data.value.slice(start, end);
});

const get = async () => {
  try {
    error.value = null;
    let res = id.value === "" ? await getList() : await getById(id.value);

    const temp = [];
    for (const [_, value] of Object.entries(res)) {
      let tempKey = null;
      let tempVal = null;

      for (const [innerKey, innerValue] of Object.entries(value)) {
        if (innerKey === "id") {
          tempKey = innerValue;
        } else {
          tempVal = innerValue;
        }
      }

      if (typeof tempVal === "string" && tempVal.includes("{")) {
        temp.push({ id: tempKey, value: JSON.parse(tempVal) });
      } else {
        temp.push({ id: tempKey, value: tempVal });
      }
    }
    data.value = temp;
  } catch (err) {
    console.log(err);
    error.value = `Failed to load data: ${err.message || err}`;
  }
};

const modify = () => {
  let tempId, tempVal;
  for (const item of paginatedData.value) {
    if (item.id) {
      tempId = item.id;
    }
    if (item.value) {
      tempVal = item.value;
    }
  }
  const param = {
    id: tempId,
    value: tempVal,
  };
  useDynamoStore().setEntity(param);
  router.push("/save");
};

const deleteData = async () => {
  try {
    const deletePromises = [];

    for (const item of paginatedData.value) {
      if (item.id) {
        // 비동기 삭제 작업 추가
        deletePromises.push(deleteEntity(item.id));
      }
    }

    // 모든 삭제 작업이 완료될 때까지 기다림
    await Promise.all(deletePromises);

    // 데이터 삭제 후 다시 가져옴
    await get();

    // 현재 페이지가 마지막 페이지를 초과하는 경우 조정
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value || 1; // 최소 1로 유지
    }
  } catch (error) {
    console.error("Error during deletion:", error);
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
const onClickValue = (childValue) => {
  if (typeof childValue === "string" && childValue.includes("http")) {
    window.open(childValue);
  } else {
    navigator.clipboard.writeText(childValue);
    message.success("copied to clipboard", 1.5).then();
  }
};
</script>
<style scoped>
/* 에러 메시지 */
.error-message {
  margin-top: 15px;
  color: #ff4d4d; /* 에러 메시지 강조 빨간색 */
  font-weight: bold;
  text-align: center;
}

/* 출력 영역 */
.output {
  margin-top: 16px;
  padding: 8px;
  border: 1px solid #555555; /* 어두운 회색 경계선 */
  border-radius: 4px;
  background-color: #121212; /* 배경 검은색 */
  color: #ffffff; /* 텍스트 흰색 */
  white-space: pre-wrap;
  overflow-x: auto;
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
</style>
