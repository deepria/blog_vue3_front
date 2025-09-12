<template>
  <div class="todo-container">
    <div class="button-container">
      <button @click="saveTodos">
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
          <path
            d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
          ></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
      </button>
      <button @click="openSettings(null)">
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
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
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
          <div class="item-content">
            <span
              class="priority-icon"
              :class="{
                'text-red': item.priority === 'high',
                'text-yellow': item.priority === 'medium',
                'text-green': item.priority === 'low',
              }"
            >
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
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
            </span>
            <span class="item-text" :class="{ completed: item.completed }">
              {{ item.text }}
            </span>
          </div>
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

    <div v-if="showPopup" class="popup" @click.self="showPopup = false">
      <div class="popup-content">
        <label>내용 수정:</label>
        <input
          v-model="selectedItem.text"
          class="styled-input"
          placeholder="내용을 입력하세요"
        />

        <label>중요도:</label>
        <select v-model="selectedItem.priority" class="styled-input">
          <option value="low">낮음</option>
          <option value="medium">보통</option>
          <option value="high">높음</option>
        </select>

        <label>그룹:</label>
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

        <div class="popup-buttons" style="margin-top: 24px">
          <button class="button-secondary" @click="closePopup()">취소</button>
          <button class="button-primary" @click="showPopup = false">
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { getData, postData } from "@/services/dynamoService.js";
import { message } from "ant-design-vue";
import "@/assets/styles/layout.css";
import "@/assets/styles/todo.css";

const items = ref([]);
const inputRef = ref(null);
const selectedItem = ref(null);
const isNewItem = ref(false);

const showPopup = ref(false);

const dragStartY = ref(0);
const dragOffset = ref(0);
const isDragging = ref(false);

const colorOptions = ref([
  { value: "#664040", label: "빨강" },
  { value: "#665040", label: "주황" },
  { value: "#666040", label: "노랑" },
  { value: "#406640", label: "초록" },
  { value: "#404066", label: "파랑" },
  { value: "#4B4060", label: "남색" },
  { value: "#604066", label: "보라" },
  { value: "#0D0D0D", label: "검정" },
]);

const priorityOrder = {
  high: 3,
  medium: 2,
  low: 1,
};

watch(showPopup, async (newVal) => {
  if (newVal) {
    await nextTick();
    inputRef.value?.focus();
  }
});

onMounted(async () => {
  await loadItems();
});

const loadItems = async () => {
  try {
    items.value = await getData("todo", "todo");
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    message.error("데이터를 불러오는데 실패했습니다.");
  }
};
const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => {
    if (a.color !== b.color) {
      return (
        colorOptions.value.findIndex((c) => c.value === a.color) -
        colorOptions.value.findIndex((c) => c.value === b.color)
      );
    }
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
});

const openSettings = (item) => {
  if (!item) {
    const newItem = {
      id: Date.now(),
      text: "",
      priority: "medium",
      completed: false,
      color: "#121212",
    };
    items.value.unshift(newItem);
    selectedItem.value = newItem;
    isNewItem.value = true;
  } else {
    selectedItem.value = item;
  }
  showPopup.value = true;
};

const closePopup = () => {
  if (isNewItem.value) {
    items.value.shift();
  }
  showPopup.value = false;
  isNewItem.value = false;
  selectedItem.value = null;
};

const saveTodos = async () => {
  try {
    await postData("todo", "todo", "todo", JSON.stringify(items.value));
    message.success("저장되었습니다.");
  } catch (error) {
    console.error("저장 실패:", error);
    message.error("저장에 실패했습니다.");
  }
};

const toggleCompletion = (item) => {
  if (item.completed) {
    setTimeout(() => {
      const index = items.value.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        items.value.splice(index, 1);
      }
    }, 300);
  }
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
</script>
