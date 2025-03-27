<template>
  <div class="main-container">
    <!-- 입력 및 서브밋 컨테이너 -->
    <div class="form-container">
      <div class="form-group">
        <label for="id"></label>
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
    <br />
    <!-- 결과 컨테이너 -->
    <div class="result-container">
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
          <!--          <pre class="output" @click="onCleckValue(child.value)"> {{ child }} </pre>-->
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
        <button class="button-primary" @click="deleteData">delete</button>
        &nbsp;
        <button class="button-primary" @click="modify">modify</button>
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
  }
};
</script>
<style scoped>
.main-container {
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  color: #ffffff; /* 기본 텍스트 흰색 */
  background-color: #121212; /* 배경 검은색 */
}

/* 양쪽 컨테이너 공통 스타일 */
.form-container,
.result-container {
  border: 1px solid #333333; /* 어두운 회색 경계선 */
  border-radius: 10px;
  padding: 20px;
  background: #1e1e1e; /* 어두운 회색 배경 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* 뚜렷한 그림자 */
  min-height: 130px;
}

/* Header 스타일 */
.header {
  font-size: 1.8rem;
  text-align: center;
  color: #42b983; /* Vue Green */
  margin-bottom: 20px;
}

/* 에러 메시지 */
.error-message {
  margin-top: 15px;
  color: #ff4d4d; /* 에러 메시지 강조 빨간색 */
  font-weight: bold;
  text-align: center;
}

/* 결과 텍스트 */
.result-container p {
  font-size: 1.2rem;
  color: #ffffff; /* 텍스트 흰색 */
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
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

/* 페이지네이션 버튼 */
.pagination button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #42b983; /* Vue Green */
  color: #ffffff; /* 버튼 텍스트 흰색 */
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.1s;
}

.pagination button:hover {
  background-color: #3a9d74; /* 약간 더 어두운 Vue Green */
}

.pagination button:active {
  transform: scale(0.98); /* 클릭 시 약간 축소 효과 */
}

.pagination button[disabled] {
  background-color: #555555; /* 비활성화 버튼 회색 */
  cursor: not-allowed;
  color: #aaaaaa; /* 비활성화 텍스트 흐린 회색 */
}
</style>
