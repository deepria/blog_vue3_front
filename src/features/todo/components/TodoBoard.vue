<template>
  <div class="task-list-container">
    <section v-for="group in groupedItems" :key="group.key" class="task-group">
      <div
        class="group-header"
        :style="{ color: getGroupColor(group.groupKey) }"
      >
        <button
          class="group-toggle"
          type="button"
          :aria-expanded="isGroupOpen(group.key)"
          :aria-controls="groupContentId(group.key)"
          @click="toggleGroup(group.key)"
        >
          <span class="group-header-copy">
            <span class="group-header-name">{{
              getGroupName(group.groupKey)
            }}</span>
            <span class="group-header-count">({{ group.items.length }})</span>
          </span>
          <svg
            class="group-header-chevron"
            :class="{ open: isGroupOpen(group.key) }"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        <button
          class="group-add-button"
          type="button"
          :aria-label="`${getGroupName(group.groupKey)} 그룹에 작업 추가`"
          title="작업 추가"
          @click="addToGroup(group)"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14"></path>
          </svg>
        </button>
      </div>

      <transition name="group-items">
        <div
          :id="groupContentId(group.key)"
          v-show="isGroupOpen(group.key)"
          class="task-group-items"
        >
          <TodoItem
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            :priorityColor="getPriorityColor(item.priorityKey)"
            @edit="handleEdit"
            @delete="$emit('delete', $event)"
            @toggle="$emit('toggle', $event)"
          />
        </div>
      </transition>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import TodoItem from "./TodoItem.vue";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  groupOptions: {
    type: Array,
    default: () => [],
  },
  priorityOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["add", "edit", "delete", "toggle"]);
const expandedGroupKeys = ref(new Set());

const groupedItems = computed(() => {
  const groups = new Map();
  props.items.forEach((item) => {
    const groupKey = item.groupKey ?? null;
    const key = groupKey === null ? "default" : String(groupKey);
    if (!groups.has(key)) groups.set(key, { key, groupKey, items: [] });
    groups.get(key).items.push(item);
  });
  return [...groups.values()];
});

function isGroupOpen(key) {
  return expandedGroupKeys.value.has(key);
}

function toggleGroup(key) {
  const nextExpandedKeys = new Set(expandedGroupKeys.value);
  if (nextExpandedKeys.has(key)) nextExpandedKeys.delete(key);
  else nextExpandedKeys.add(key);
  expandedGroupKeys.value = nextExpandedKeys;
}

function groupContentId(key) {
  return `task-group-${encodeURIComponent(key)}`;
}

function addToGroup(group) {
  const nextExpandedKeys = new Set(expandedGroupKeys.value);
  nextExpandedKeys.add(group.key);
  expandedGroupKeys.value = nextExpandedKeys;
  emit("add", group.groupKey);
}

function handleEdit(item) {
  emit("edit", item);
}

function getGroupName(key) {
  if (key === null || key === undefined) return "임시 작업";
  return (
    props.groupOptions.find((group) => group.key === key)?.name || "기본 그룹"
  );
}

function getGroupColor(key) {
  return (
    props.groupOptions.find((group) => group.key === key)?.color ||
    "var(--color-text-muted)"
  );
}

function getPriorityColor(key) {
  return (
    props.priorityOptions.find((priority) => priority.key === key)?.color ||
    "#666"
  );
}
</script>

<style scoped>
.task-list-container {
  display: grid;
  gap: 16px;
}

.task-group {
  display: grid;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
}

.group-header {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 54px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
}

.group-toggle {
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 54px;
  flex: 1;
  gap: 12px;
  padding: 10px 8px 10px 14px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.group-toggle:hover {
  background: var(--color-bg-panel);
}

.group-add-button {
  width: 36px;
  height: 36px;
  display: inline-grid;
  flex-shrink: 0;
  margin-right: 10px;
  place-items: center;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.group-add-button:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.group-header-copy {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 6px;
}

.group-header-name {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.group-header-count {
  font-size: 14px;
  font-weight: 750;
}

.group-header-chevron {
  margin-left: auto;
  transition: transform 0.16s ease;
}

.group-header-chevron.open {
  transform: rotate(180deg);
}

.task-group-items {
  display: grid;
  gap: 6px;
  overflow: hidden;
  padding: 6px 10px 8px;
}

.group-items-enter-active,
.group-items-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.group-items-enter-from,
.group-items-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
