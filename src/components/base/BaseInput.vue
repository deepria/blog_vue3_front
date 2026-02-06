<template>
  <div class="base-input-wrapper" :class="{ 'has-error': error }">
    <label v-if="label" class="input-label" :for="id">{{ label }}</label>
    <div class="input-container">
      <input
        :id="id"
        ref="inputRef"
        v-bind="$attrs"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        class="base-input"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="focused = true"
        @blur="focused = false"
      />
      <span v-if="suffixIcon || $slots.suffix" class="input-suffix">
        <slot name="suffix">{{ suffixIcon }}</slot>
      </span>
    </div>
    <p v-if="error" class="input-error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  suffixIcon: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);

const focused = ref(false);
const inputRef = ref(null);

defineExpose({ focus: () => inputRef.value?.focus() });
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  width: 100%;
}

.input-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  margin-left: var(--space-xs);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.base-input {
  width: 100%;
  height: 48px;
  padding: 0 var(--space-md);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-size: var(--text-base);
  transition: all 0.2s ease;
  outline: none;
}

.base-input::placeholder {
  color: var(--text-disabled);
}

.base-input:hover:not(:disabled) {
  border-color: var(--border-hover);
  background-color: var(--bg-surface-hover);
}

.base-input:focus:not(:disabled) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
  background-color: var(--bg-surface);
}

.base-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: rgba(255, 255, 255, 0.02);
}

/* Error State */
.has-error .base-input {
  border-color: var(--color-danger);
}
.has-error .base-input:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}
.has-error .input-label {
  color: var(--color-danger);
}

.input-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  margin-left: var(--space-xs);
  margin-top: 0;
}

.input-suffix {
  position: absolute;
  right: var(--space-md);
  color: var(--text-muted);
  pointer-events: none;
  display: flex;
  align-items: center;
}
</style>
