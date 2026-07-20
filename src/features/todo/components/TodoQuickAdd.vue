<template>
  <div class="quick-add-wrapper">
    <BaseInput
      :model-value="modelValue"
      placeholder="Add new task..."
      class="quick-input-flex"
      @update:model-value="$emit('update:modelValue', $event)"
      @enter="$emit('submit')"
    >
      <template #suffix>
        <button
          class="quick-add-btn"
          type="button"
          aria-label="작업 추가"
          @click="$emit('submit')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
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
});

defineEmits(["update:modelValue", "submit"]);
</script>

<style scoped>
.quick-add-wrapper {
  min-width: 0;
}

.quick-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
}
</style>
