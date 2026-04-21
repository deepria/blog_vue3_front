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
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  font-weight: 500;
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
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  outline: none;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.base-input::placeholder {
  color: var(--color-text-disabled);
}

.base-input:hover:not(:disabled) {
  border-color: var(--color-border-bright);
}

.base-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary), var(--shadow-sm);
}

.base-input:disabled {
  background-color: var(--color-bg-panel);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.base-input.is-error {
  border-color: var(--color-danger);
}
.base-input.is-error:focus {
  box-shadow: 0 0 0 1px var(--color-danger);
}

/* Sizes */
.size-sm {
  height: 32px;
  padding: 0 var(--space-3);
  font-size: var(--font-size-caption);
  border-radius: var(--radius-sm);
}
.size-md {
  height: 40px;
  padding: 0 var(--space-3);
  font-size: var(--font-size-body);
}
.size-lg {
  height: 48px;
  padding: 0 var(--space-4);
  font-size: var(--font-size-body);
}

/* Slots */
.has-prefix { padding-left: 36px; }
.has-suffix { padding-right: 36px; }

.prefix-slot, .suffix-slot {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  z-index: 2;
}
.prefix-slot { left: var(--space-3); }
.suffix-slot { right: var(--space-3); }

.error-message {
  font-size: var(--font-size-caption);
  color: var(--color-danger);
}
</style>
