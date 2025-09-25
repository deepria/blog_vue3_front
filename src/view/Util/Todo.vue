<template>
  <div class="todo-container">
    <div class="button-container">
      <button class="refresh-button" @click="refresh()">
        <i class="fa-solid fa-rotate refresh-icon"></i>
      </button>
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
        <template v-for="(item, index) in sortedItems" :key="item.id">
          <div
            v-if="
              index === 0 || sortedItems[index - 1].groupKey !== item.groupKey
            "
            class="group-header"
            :style="{
              color: '#FFFFFF',
              textShadow: `0 0 ${GLOW_BLUR_PX}px ${getGroupGlowByKey(item.groupKey)}`,
              fontWeight: 700,
              margin: '12px 0 6px',
              letterSpacing: '0.5px',
              willChange: 'transform',
              transform: `translate3d(0, ${dragOffset}px, 0)`,
            }"
          >
            {{ getGroupNameByKey(item.groupKey) }}
          </div>
          <div
            class="list-item"
            :style="{
              backgroundColor: getGroupBgByKey(item.groupKey),
              willChange: 'transform',
              transform: `translate3d(0, ${dragOffset}px, 0)`,
              boxShadow: `0 0 ${GLOW_BLUR_PX * 2}px ${getGroupGlowByKey(item.groupKey)}`,
            }"
            @click="openSettings(item)"
          >
            <div class="item-content">
              <span
                class="priority-icon"
                :style="{
                  color: getPriorityColorByKey(item.priorityKey),
                  filter: `drop-shadow(0 0 ${GLOW_BLUR_PX}px ${getPriorityGlowByKey(item.priorityKey)})`,
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
              <span
                class="item-text"
                :class="{ completed: item.completed }"
                :style="{
                  color: '#FFFFFF',
                  textShadow: `0 0 ${GLOW_BLUR_PX}px ${getGroupGlowByKey(item.groupKey)}`,
                  fontWeight: 600,
                }"
              >
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
        </template>
      </transition-group>
    </div>
  </div>
  <teleport to="body">
    <div v-if="showPopup" class="popup" @click.self="confirmPopup">
      <div class="popup-content">
        <div class="grid-input">
          <select v-model="selectedItem.groupKey" class="styled-input">
            <option v-for="g in groupOptions" :key="g.key" :value="g.key">
              {{ g.name }}
            </option>
          </select>
          <select v-model="selectedItem.priorityKey" class="styled-input">
            <option v-for="p in priorityOptions" :key="p.key" :value="p.key">
              {{ p.name }}
            </option>
          </select>
        </div>

        <textarea
          v-model="selectedItem.text"
          class="styled-textarea"
          placeholder="내용을 입력하세요"
        />

        <div class="popup-buttons" style="margin-top: 24px">
          <button class="button-primary" @click="toggleSettingsMode">
            옵션 관리
          </button>
          <button class="button-primary" @click="cancelPopup">취소</button>
          <button class="button-primary" @click="confirmPopup">확인</button>
        </div>
        <div
          v-if="settingsMode"
          class="options-manager"
          style="margin-top: 16px; display: grid; gap: 16px"
        >
          <!-- Group manager -->
          <div>
            <h4 style="margin-bottom: 8px">그룹 옵션</h4>
            <div
              v-for="(g, idx) in groupOptions"
              :key="g.key"
              style="
                display: flex;
                gap: 8px;
                align-items: center;
                margin-bottom: 8px;
              "
            >
              <input
                class="styled-input"
                style="flex: 1"
                v-model="g.name"
                placeholder="그룹명"
              />
              <input
                class="styled-input"
                style="width: 56px; padding: 0"
                type="color"
                v-model="g.color"
              />
              <button class="button-secondary" @click="removeGroup(idx)">
                삭제
              </button>
            </div>
            <div style="display: flex; gap: 8px">
              <input
                class="styled-input"
                style="flex: 1"
                v-model="newGroup.name"
                placeholder="그룹명"
              />
              <input
                class="styled-input"
                style="width: 56px; padding: 0"
                type="color"
                v-model="newGroup.color"
              />
              <button class="button-primary" @click="addGroup">추가</button>
            </div>
          </div>

          <!-- Priority manager -->
          <div>
            <h4 style="margin-bottom: 8px">중요도 옵션</h4>
            <div
              v-for="(p, idx) in priorityOptions"
              :key="p.key"
              style="
                display: flex;
                gap: 8px;
                align-items: center;
                margin-bottom: 8px;
              "
            >
              <input
                class="styled-input"
                style="flex: 1"
                v-model="p.name"
                placeholder="명칭"
              />
              <input
                class="styled-input"
                style="width: 56px; padding: 0"
                type="color"
                v-model="p.color"
              />
              <button class="button-secondary" @click="removePriority(idx)">
                삭제
              </button>
            </div>
            <div style="display: flex; gap: 8px">
              <input
                class="styled-input"
                style="flex: 1"
                v-model="newPriority.name"
                placeholder="명칭"
              />
              <input
                class="styled-input"
                style="width: 56px; padding: 0"
                type="color"
                v-model="newPriority.color"
              />
              <button class="button-primary" @click="addPriority">추가</button>
            </div>
          </div>

          <div
            class="popup-buttons"
            style="display: flex; justify-content: flex-end; gap: 8px"
          >
            <button class="button-primary" @click="resetDefaults">
              초기화
            </button>
            <button class="button-primary" @click="saveMeta">저장</button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { getData, postData } from "@/services/dynamoService.js";
import { message } from "ant-design-vue";
import "@/assets/styles/layout.css";
import "@/assets/styles/todo.css";

// --- Group color helpers for background and text ---
const GRID_BG_ALPHA = 0.32; // 공통 투명도(가시성 강화)
const GLOW_BLUR_PX = 3; // 형광 효과 번짐(픽셀)
const GLOW_ALPHA = 0.28; // 형광 효과 투명도(낮출수록 약해짐)
const ITEM_ROW_HEIGHT = 50; // px, list item height used for drag bounds
const HEADER_ROW_HEIGHT = 28; // px, group header height used for drag bounds

// Throttle dragOffset update with requestAnimationFrame
let rafId = null;
const setDragOffset = (val) => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    dragOffset.value = val;
    rafId = null;
  });
};

const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  if (!m) return null;
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
};
const hexToRgba = (hex, alpha = 1) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex || "#121212";
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

const items = ref([]);
const inputRef = ref(null);
const selectedItem = ref(null);
const isNewItem = ref(false);

const showPopup = ref(false);
const dragStartY = ref(0);
const dragOffset = ref(0);
const isDragging = ref(false);

const settingsMode = ref(false);

const groupOptions = ref([]);
const priorityOptions = ref([]);

const newGroup = ref({ name: "", color: "#666666" });
const newPriority = ref({ name: "", color: "#ff0000" });

const nextGroupKey = computed(() =>
  groupOptions.value.length
    ? Math.max(...groupOptions.value.map((g) => g.key ?? 0)) + 1
    : 1,
);
const nextPriorityKey = computed(() =>
  priorityOptions.value.length
    ? Math.max(...priorityOptions.value.map((p) => p.key ?? 0)) + 1
    : 1,
);

const priorityOrder = computed(() => {
  const map = {};
  priorityOptions.value.forEach((p, idx) => {
    map[p.key] = idx;
  });
  return map;
});

const getPriorityColorByKey = (pKey) => {
  const p = priorityOptions.value.find((x) => x.key === pKey);
  return p?.color || undefined;
};

const toggleSettingsMode = () => {
  settingsMode.value = !settingsMode.value;
};

const confirmPopup = () => {
  showPopup.value = false;
  settingsMode.value = false;
  isNewItem.value = false;
  selectedItem.value = null;
};

const cancelPopup = () => {
  if (isNewItem.value) {
    items.value.shift();
  }
  showPopup.value = false;
  settingsMode.value = false;
  isNewItem.value = false;
  selectedItem.value = null;
};

const ensureValidSelection = () => {
  if (!selectedItem.value) return;
  if (!groupOptions.value.some((g) => g.key === selectedItem.value.groupKey)) {
    selectedItem.value.groupKey = groupOptions.value[0]?.key ?? null;
  }
  if (
    !priorityOptions.value.some((p) => p.key === selectedItem.value.priorityKey)
  ) {
    selectedItem.value.priorityKey = priorityOptions.value[0]?.key ?? null;
  }
};

// --- Group ops ---
const addGroup = () => {
  if (!newGroup.value.name) return;
  if (groupOptions.value.some((g) => g.name === newGroup.value.name)) return;
  groupOptions.value.push({
    key: nextGroupKey.value,
    name: newGroup.value.name,
    color: newGroup.value.color,
  });
  newGroup.value = { name: "", color: "#666666" };
};
const removeGroup = (idx) => {
  groupOptions.value.splice(idx, 1);
};

// --- Priority ops ---
const addPriority = () => {
  if (!newPriority.value.name) return;
  if (priorityOptions.value.some((p) => p.name === newPriority.value.name))
    return;
  priorityOptions.value.push({
    key: nextPriorityKey.value,
    name: newPriority.value.name,
    color: newPriority.value.color,
  });
  newPriority.value = { name: "", color: "#ff0000" };
};
const removePriority = (idx) => {
  priorityOptions.value.splice(idx, 1);
};

// --- Group color helpers ---
const getGroupNameByKey = (groupKey) => {
  const g = groupOptions.value.find((x) => x.key === groupKey);
  return g?.name || "기타";
};
const getGroupBgByKey = (groupKey) => {
  const g = groupOptions.value.find((x) => x.key === groupKey);
  return hexToRgba(g?.color || "#121212", GRID_BG_ALPHA);
};
const getGroupGlowByKey = (groupKey) => {
  const g = groupOptions.value.find((x) => x.key === groupKey);
  return hexToRgba(g?.color || "#00ffcc", GLOW_ALPHA);
};
const getPriorityGlowByKey = (pKey) => {
  const p = priorityOptions.value.find((x) => x.key === pKey);
  return hexToRgba(p?.color || "#00ffcc", GLOW_ALPHA);
};

// --- Meta persistence with DynamoDB ---
const loadMeta = async () => {
  try {
    const raw = await getData("todo", "meta");
    const meta =
      typeof raw === "string"
        ? (() => {
            try {
              return JSON.parse(raw);
            } catch {
              return null;
            }
          })()
        : raw;
    const groups = Array.isArray(meta?.groups) ? meta.groups : [];
    const priorities = Array.isArray(meta?.priorities) ? meta.priorities : [];
    groupOptions.value = groups.map((g, i) => {
      if (g && typeof g === "object") {
        const name = g.name ?? g.label ?? g.value ?? `그룹${i + 1}`;
        const color = g.color ?? "#666666";
        const key = typeof g.key === "number" ? g.key : i + 1;
        return {
          key,
          name,
          color,
        };
      }
      if (typeof g === "string")
        return {
          key: i + 1,
          name: g,
          color: "#666666",
        };
      return {
        key: i + 1,
        name: `그룹${i + 1}`,
        color: "#666666",
      };
    });
    priorityOptions.value = priorities.map((p, i) => {
      if (p && typeof p === "object") {
        const name = p.name ?? p.value ?? `중요도${i + 1}`;
        const color = p.color ?? "#ff0000";
        const key = typeof p.key === "number" ? p.key : i + 1;
        return { key, name, color };
      }
      if (typeof p === "string")
        return { key: i + 1, name: p, color: "#ff0000" };
      return { key: i + 1, name: `중요도${i + 1}`, color: "#ff0000" };
    });
    ensureValidSelection();
  } catch (e) {
    groupOptions.value = [];
    priorityOptions.value = [];
  }
};

const saveMeta = async () => {
  const meta = {
    groups: groupOptions.value.map((g) => ({
      key: g.key,
      name: g.name,
      color: g.color,
    })),
    priorities: priorityOptions.value.map((p) => ({
      key: p.key,
      name: p.name,
      color: p.color,
    })),
    updatedAt: Date.now(),
  };
  try {
    await postData("todo", "meta", "meta", JSON.stringify(meta));
    message.success("옵션이 저장되었습니다.");
  } catch (e) {
    message.error("옵션 저장 실패");
  }
};

const resetDefaults = async () => {
  await loadMeta();
};

onMounted(async () => {
  await loadMeta();
  await loadItems();
});

watch(showPopup, async (newVal) => {
  if (newVal) {
    await nextTick();
    inputRef.value?.focus();
  }
  document.body.classList.toggle("no-scroll", newVal);
  if (!newVal) settingsMode.value = false;
});

const loadItems = async () => {
  try {
    items.value = await getData("todo", "todo");
    items.value = (items.value || []).map((it) => {
      if (it.groupKey == null) {
        if (it.group != null) {
          const g = groupOptions.value.find((x) => x.name === it.group);
          it.groupKey = g?.key ?? groupOptions.value[0]?.key ?? null;
        } else {
          it.groupKey = groupOptions.value[0]?.key ?? null;
        }
      }
      if (it.priorityKey == null) {
        if (it.priority != null) {
          const p = priorityOptions.value.find(
            (x) => x.name === it.priority || x.value === it.priority,
          );
          it.priorityKey = p?.key ?? priorityOptions.value[0]?.key ?? null;
        } else {
          it.priorityKey = priorityOptions.value[0]?.key ?? null;
        }
      }
      return it;
    });
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    message.warn("데이터를 불러오는데 실패했습니다.");
  }
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
const refresh = async () => {
  try {
    await loadItems();
  } catch (error) {
    console.error("refresh error:", error);
    message.warn("Failed to refresh .").then();
  }
};
const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => {
    if (a.groupKey !== b.groupKey) {
      const ai = groupOptions.value.findIndex((g) => g.key === a.groupKey);
      const bi = groupOptions.value.findIndex((g) => g.key === b.groupKey);
      return ai - bi;
    }
    return (
      (priorityOrder.value[b.priorityKey] || 0) -
      (priorityOrder.value[a.priorityKey] || 0)
    );
  });
});
const openSettings = (item) => {
  if (!item) {
    const newItem = {
      id: Date.now(),
      text: "",
      groupKey: groupOptions.value[0]?.key ?? null,
      priorityKey: priorityOptions.value[0]?.key ?? null,
      completed: false,
    };
    items.value.unshift(newItem);
    selectedItem.value = newItem;
    isNewItem.value = true;
    ensureValidSelection();
  } else {
    selectedItem.value = item;
    ensureValidSelection();
  }
  showPopup.value = true;
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
  // Estimate total content height = items + headers
  const groupCount = Array.from(
    new Set(sortedItems.value.map((it) => it.groupKey)),
  ).length;
  const totalHeight =
    sortedItems.value.length * ITEM_ROW_HEIGHT + groupCount * HEADER_ROW_HEIGHT;
  const viewportHeight = (70 * window.innerHeight) / 100; // matches existing layout usage
  const minOffset = -(totalHeight - viewportHeight);

  if (newOffset <= maxOffset && newOffset >= minOffset) {
    setDragOffset(newOffset);
  }

  dragStartY.value = currentY;
};
const endDrag = () => {
  isDragging.value = false;
};
</script>
