<template>
  <div class="task-list-container">
    <transition-group name="list" tag="div">
      <template v-for="(item, index) in items" :key="item.id">
        <div
          v-if="index === 0 || items[index - 1].groupKey !== item.groupKey"
          class="group-header"
          :style="{ color: getGroupColor(item.groupKey) }"
        >
          {{ getGroupName(item.groupKey) }}
        </div>
        <TodoItem
          :item="item"
          :priorityColor="getPriorityColor(item.priorityKey)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @toggle="$emit('toggle', $event)"
        />
      </template>
    </transition-group>
  </div>
</template>

<script setup>
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

defineEmits(["edit", "delete", "toggle"]);

function getGroupName(key) {
  return props.groupOptions.find((group) => group.key === key)?.name || "Default";
}

function getGroupColor(key) {
  return props.groupOptions.find((group) => group.key === key)?.color || "var(--color-text-muted)";
}

function getPriorityColor(key) {
  return props.priorityOptions.find((priority) => priority.key === key)?.color || "#666";
}
</script>
