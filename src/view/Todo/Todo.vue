<template>
  <div class="container">
    <div class="button-container">
      <button class="save-button" @click="save()">
        <i class="fas fa-save"></i>
      </button>
      <button class="add-button" @click="showPopup = true">
        <i class="fas fa-plus"></i>
      </button>
    </div>

    <div v-if="showPopup" class="popup-overlay" @click.self="showPopup = false">
      <div class="popup">
        <div class="popup-input-wrapper">
          <input ref="inputRef" v-model="inputText" placeholder="입력하세요" />
          <button @click="confirmInput"><i class="fas fa-check"></i></button>
        </div>
      </div>
    </div>

    <div
      class="item-container"
      @mousedown="startDrag"
      @mousemove="onDrag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
      @touchstart="startDrag"
      @touchmove="onDrag"
      @touchend="endDrag"
    >
      <transition-group name="list" tag="div">
        <div
          v-for="(item, index) in sortedItems"
          :key="item.id"
          class="list-item"
          :style="{
            backgroundColor: item.color,
            transform: `translateY(${dragOffset}px)`,
          }"
          @click="openSettings(item)"
        >
          <span :class="getPriorityIcon(item.priority)"></span>
          {{ item.text }}
          <input
            type="checkbox"
            v-model="item.completed"
            class="task-checkbox"
            @change="toggleCompletion(item)"
            @click.stop
          />
        </div>
      </transition-group>
    </div>

    <div
      v-if="showSettingsPopup"
      class="popup-overlay"
      @click.self="showSettingsPopup = false"
    >
      <div class="popup">
        <h3>설정</h3>
        <label>내용 수정:</label>
        <input
          v-model="selectedItem.text"
          class="edit-input"
          placeholder="내용을 입력하세요"
        />

        <label>중요도:</label>
        <select v-model="selectedItem.priority">
          <option value="low">낮음</option>
          <option value="medium">보통</option>
          <option value="high">높음</option>
        </select>

        <label>배경 색상:</label>
        <div class="color-options">
          <label
            v-for="(color, index) in colorOptions"
            :key="index"
            class="color-label"
          >
            <input
              type="radio"
              v-model="selectedItem.color"
              :value="color.value"
            />
            <span
              class="color-icon"
              :style="{ backgroundColor: color.value }"
            ></span>
          </label>
        </div>

        <button @click="showSettingsPopup = false">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { getData, postData } from "@/services/dynamoService.js";

const showPopup = ref(false);
const inputText = ref("");
const items = ref([]);
const inputRef = ref(null);
const showSettingsPopup = ref(false);
const selectedItem = ref(null);
const dragStartY = ref(0);
const dragOffset = ref(0);
const isDragging = ref(false);

// watch(
//   items,
//   (newItems) => {
//     console.log("리스트 업데이트됨:", JSON.stringify(newItems, null, 2));
//   },
//   { deep: true },
// );

watch(showPopup, async (newVal) => {
  if (newVal) {
    await nextTick();
    inputRef.value?.focus();
  }
});
const colorOptions = ref([
  { value: "#664040", label: "빨강" },
  { value: "#665040", label: "주황" },
  { value: "#666040", label: "노랑" },
  { value: "#406640", label: "초록" },
  { value: "#404066", label: "파랑" },
  { value: "#4B4060", label: "남색" },
  { value: "#604066", label: "보라" },
  { value: "#1A1A1A", label: "검정" },
]);

const priorityOrder = {
  high: 3,
  medium: 2,
  low: 1,
};

const toggleCompletion = (item) => {
  if (item.completed) {
    setTimeout(() => {
      const index = items.value.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        items.value.splice(index, 1); // 리스트에서 삭제
      }
    }, 300); // 약간의 지연 후 삭제 (애니메이션 고려)
  }
};

// 정렬된 리스트 반환 (색상 그룹화 후 중요도 내림차순 정렬)
const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => {
    if (a.color !== b.color) {
      return (
        colorOptions.value.findIndex((c) => c.value === a.color) -
        colorOptions.value.findIndex((c) => c.value === b.color)
      );
    }
    return priorityOrder[b.priority] - priorityOrder[a.priority]; // 중요도 내림차순
  });
});

const confirmInput = () => {
  if (!inputText.value.trim()) return;

  const newItem = {
    id: Date.now(),
    text: inputText.value,
    priority: "medium", // 기본 중요도
    completed: false, // 기본 달성 여부
    color: "#121212", // 기본 배경색
  };

  items.value.unshift(newItem);
  inputText.value = "";
  showPopup.value = false;
};

const openSettings = (item) => {
  selectedItem.value = item;
  showSettingsPopup.value = true;
};

const getPriorityIcon = (priority) => {
  return (
    {
      low: "fas fa-exclamation-triangle text-green",
      medium: "fas fa-exclamation-triangle text-yellow",
      high: "fas fa-exclamation-triangle text-red",
    }[priority] || "fas fa-exclamation-triangle text-green"
  );
};

const startDrag = (e) => {
  isDragging.value = true;
  dragStartY.value = e.touches ? e.touches[0].clientY : e.clientY;
};

const onDrag = (e) => {
  if (!isDragging.value) return;

  const currentY = e.touches ? e.touches[0].clientY : e.clientY;
  const delta = currentY - dragStartY.value;
  const newOffset = dragOffset.value + delta;

  // 최대 및 최소 드래그 제한
  const maxOffset = 0;
  const minOffset = -(
    sortedItems.value.length * 50 -
    (70 * window.innerHeight) / 100
  );

  if (newOffset <= maxOffset && newOffset >= minOffset) {
    dragOffset.value = newOffset;
  }

  dragStartY.value = currentY;
};

const endDrag = () => {
  isDragging.value = false;
};

const save = async () => {
  await postData("todo", "todo", "todo", JSON.stringify(sortedItems.value));
};

onMounted(() => {
  getData("todo", "todo").then((res) => {
    items.value = res;
  });
});
</script>

<style scoped>
.container {
  height: 85vh;
  position: relative;
  overflow: hidden;
  width: 100%; /* 가로 전체를 차지하도록 설정 */
}

.button-container {
  position: fixed;
  right: 15px;
  bottom: 60px;
  display: flex;
  gap: 10px;
}

.save-button,
.add-button {
  width: 45px; /* 정사각형 크기 */
  height: 45px;
  font-size: 24px; /* 아이콘 크기 조정 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background-color: #42b983;
  border: none;
  border-radius: 8px; /* 부드러운 라운드 처리 */
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  transition: background 0.3s ease;
}

.save-button:hover,
.add-button:hover {
  background-color: #369b72;
}

.save-button i {
  font-size: 20px; /* 저장 아이콘 크기 */
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 항상 맨 위에 위치하도록 설정 */
}

.popup {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  background-color: #333;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.popup-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
}

.popup input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  background-color: #121212;
  color: white;
}

.popup button {
  width: auto; /* 가로 길이를 내용에 맞게 조정 */
  min-width: 80px; /* 최소 크기 지정 */
  max-width: 150px; /* 최대 크기 지정 */
  padding: 10px 12px;
  font-size: 16px;
  cursor: pointer;
  color: white;
  background-color: #42b983;
  border: none;
  border-radius: 4px;
}

.popup h3 {
  margin-bottom: 15px;
  font-size: 18px;
  color: white;
}

.popup label {
  display: block;
  text-align: left;
  width: 100%;
  font-size: 16px;
  color: white;
  margin-bottom: 5px;
}

.popup select {
  width: 100%;
  max-width: 250px;
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  margin-bottom: 15px;
  appearance: auto; /* 기본 브라우저 스타일 적용 */
  background-color: #fff;
  color: black;
  cursor: pointer;
}

.edit-input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #222;
  color: white;
  margin-bottom: 10px;
}

.item-container {
  width: 100%;
  height: 85vh; /* 화면을 꽉 채움 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
  cursor: grab;
}

.item-container:active {
  cursor: grabbing;
}

.list-item {
  transition: transform 0.2s ease-out;
  background-color: #121212; /* 배경색 */
  color: white;
  padding: 12px 20px;
  border-radius: 6px;
  width: 90vw; /* 가로 길이를 뷰포트의 90%로 고정 */
  text-align: left; /* 텍스트를 왼쪽 정렬 */
  border: 2px solid #333333; /* 테두리 */
  box-sizing: border-box;
  word-wrap: break-word; /* 긴 텍스트 자동 줄바꿈 */
  margin: 0 auto; /* 중앙 정렬 */
  display: flex;
  align-items: center;
  gap: 10px; /* 아이콘과 텍스트 간격 조정 */
}

.list-item span {
  flex-shrink: 0; /* 아이콘 크기 고정 */
  font-size: 20px; /* 중요도 아이콘 크기 조정 */
}

.list-item .task-checkbox {
  margin-left: auto; /* 체크박스를 오른쪽으로 정렬 */
  transform: scale(1.2);
  appearance: checkbox; /* 기본 브라우저 스타일 복구 */
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-item .task-checkbox:checked {
  background-color: #42b983;
  border-color: #42b983;
}

.list-item .task-checkbox::before {
  content: "✔";
  color: white;
  font-size: 14px;
  display: none;
}

.list-item .task-checkbox:checked::before {
  display: block;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.text-green {
  color: #42b983; /* 초록색 */
}

.text-yellow {
  color: #ffcc00; /* 노란색 */
}

.text-red {
  color: #ff3b3b; /* 빨간색 */
}

.color-options {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap; /* 줄바꿈 방지 */
  justify-content: center;
  overflow-x: auto; /* 가로 스크롤 가능하도록 설정 */
  padding: 10px 0;
}

.color-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.color-label input {
  display: none;
}

.color-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-block;
  border: 2px solid white;
}

.color-label input:checked + .color-icon {
  border: 3px solid #fff;
  transform: scale(1.2);
}
</style>
