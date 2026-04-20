<template>
  <div class="base-input-wrapper">
    <label v-if="label" class="base-input-label" :for="inputId">{{ label }}</label>
    <div class="input-container">
      <div v-if="$slots.prefix" class="prefix-slot">
        <slot name="prefix"></slot>
      </div>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'base-input',
          `size-${size}`,
          { 'has-prefix': $slots.prefix, 'has-suffix': $slots.suffix, 'is-error': error }
        ]"
        @input="onInput"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
        @keyup.enter="$emit('enter')"
      />
      <div v-if="$slots.suffix" class="suffix-slot">
        <slot name="suffix"></slot>
      </div>
    </div>
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'enter']);

// Simple random ID generator for accessibility mapping
const inputId = computed(() => `input-${Math.random().toString(36).substring(2, 9)}`);

const onInput = (event) => {
  emit('update:modelValue', event.target.value);
};
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
}

.base-input-label {
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
  font-weight: 500;
  margin-left: var(--space-1);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.base-input {
  width: 100%;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.022);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--color-text-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.base-input:focus {
  border-color: rgba(182, 255, 227, 0.28);
  background: rgba(255, 255, 255, 0.035);
  box-shadow: 0 0 0 4px rgba(103, 232, 180, 0.12);
}

.base-input:disabled {
  background-color: var(--color-bg-base);
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.8;
}

.base-input.is-error {
  border-color: var(--color-danger, #ef4444);
}
.base-input.is-error:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

/* Base Input Sizes */
.size-sm {
  height: 32px;
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-caption);
}
.size-md {
  height: 40px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-body);
}
.size-lg {
  height: 48px;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-title);
}

/* Prefix / Suffix Spacing Adjustments */
.has-prefix {
  padding-left: 36px;
}
.has-suffix {
  padding-right: 36px;
}

.prefix-slot, .suffix-slot {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  pointer-events: none; /* Let clicks pass through to input */
}

.prefix-slot {
  left: var(--space-3);
}

.suffix-slot {
  right: var(--space-3);
}

.error-message {
  font-size: 12px;
  color: var(--color-danger, #ef4444);
  margin-left: var(--space-1);
}
</style>
