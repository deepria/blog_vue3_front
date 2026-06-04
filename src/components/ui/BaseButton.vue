<template>
  <button
    v-bind="$attrs"
    :class="[
      'base-button',
      `variant-${variant}`,
      `size-${size}`,
      { loading: loading, disabled: disabled, block: block }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner-wrapper">
      <svg class="spinner" viewBox="0 0 24 24">
        <circle class="path" cx="12" cy="12" r="10" fill="none" stroke-width="3"></circle>
      </svg>
    </span>
    <span class="button-content" :class="{ 'opacity-0': loading }">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
defineOptions({
  inheritAttrs: false,
});

defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: var(--font-family);
  font-weight: 500;
  letter-spacing: 0;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  user-select: none;
  outline: none;
  border: 1px solid transparent;
}

.base-button:focus-visible {
  box-shadow: 0 0 0 2px var(--color-bg-base), 0 0 0 4px var(--color-primary);
}

.base-button:active:not(:disabled) {
  transform: scale(0.97);
}

.base-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button.block {
  display: flex;
  width: 100%;
}

.button-content {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  transition: opacity 0.2s;
}

/* --- Sizes --- */
.size-sm {
  padding: 0 var(--space-3);
  font-size: var(--font-size-caption);
  height: 28px;
  border-radius: var(--radius-sm);
}
.size-md {
  padding: 0 var(--space-4);
  font-size: var(--font-size-body);
  height: 36px;
}
.size-lg {
  padding: 0 var(--space-6);
  font-size: var(--font-size-title);
  height: 44px;
}

/* --- Variants --- */
.variant-primary {
  background-color: var(--color-text-primary);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}
.variant-primary:hover:not(:disabled) {
  background-color: #E4E4E7; /* Zinc 200 */
}

.variant-secondary {
  background-color: var(--color-bg-elevated);
  border-color: var(--color-border);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}
.variant-secondary:hover:not(:disabled) {
  background-color: #3F3F46; /* Zinc 700 */
  border-color: var(--color-border-strong);
}

.variant-ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
}
.variant-ghost:hover:not(:disabled) {
  background-color: var(--color-bg-panel);
  color: var(--color-text-primary);
}

.variant-danger {
  background-color: var(--color-danger);
  color: #fff;
  box-shadow: var(--shadow-sm);
}
.variant-danger:hover:not(:disabled) {
  filter: brightness(1.1);
}

/* --- Loading Spinner --- */
.spinner-wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 18px;
  height: 18px;
  animation: rotate 2s linear infinite;
}

.spinner .path {
  stroke: currentColor;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

.opacity-0 {
  opacity: 0;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}
</style>
