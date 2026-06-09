<template>
  <div class="quick-add-wrapper">
    <select
      :value="groupKey"
      class="quick-group-select"
      @change="$emit('update:groupKey', $event.target.value ? Number($event.target.value) : null)"
    >
      <option :value="null">Default</option>
      <option v-for="group in groupOptions" :key="group.key" :value="group.key">
        {{ group.name }}
      </option>
    </select>
    <BaseInput
      :model-value="modelValue"
      placeholder="Add new task..."
      class="quick-input-flex"
      @update:model-value="$emit('update:modelValue', $event)"
      @enter="$emit('submit')"
    >
      <template #suffix>
        <button class="quick-add-btn" @click="$emit('submit')">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </button>
      </template>
    </BaseInput>
  </div>
</template>

<script setup>
import BaseInput from "@/shared/ui/BaseInput.vue";

defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  groupKey: {
    type: Number,
    default: null,
  },
  groupOptions: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["update:modelValue", "update:groupKey", "submit"]);
</script>

<style scoped>
.quick-add-wrapper {
  display: grid;
  grid-template-columns: minmax(150px, 190px) 1fr;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
}

.quick-group-select {
  min-height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-panel);
  color: var(--color-text-primary);
  padding: 0 12px;
  font-weight: 650;
}

.quick-add-btn {
  border: none;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .quick-add-wrapper {
    grid-template-columns: 1fr;
  }
}
</style>
