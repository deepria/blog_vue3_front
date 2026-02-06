<template>
  <button 
    class="base-button" 
    :class="[
      `variant-${variant}`,
      `size-${size}`,
      { 'is-loading': loading, 'is-block': block }
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner"></span>
    <span class="content" :class="{ 'opacity-0': loading }">
       <slot></slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
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
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: var(--font-sans);
  font-weight: 600;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  outline: none;
  user-select: none;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button.is-block {
  width: 100%;
}

/* Sizes */
.size-sm {
  height: 32px;
  padding: 0 var(--space-md);
  font-size: var(--text-xs);
}

.size-md {
  height: 40px;
  padding: 0 var(--space-lg);
  font-size: var(--text-sm);
}

.size-lg {
  height: 48px;
  padding: 0 var(--space-xl);
  font-size: var(--text-base);
}

/* Variants */
.variant-primary {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  box-shadow: var(--shadow-glow);
}
.variant-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
}
.variant-primary:active:not(:disabled) {
  background-color: var(--color-primary-active);
  transform: translateY(0);
}

.variant-secondary {
  background-color: var(--bg-surface);
  border-color: var(--border-color);
  color: var(--text-main);
}
.variant-secondary:hover:not(:disabled) {
  background-color: var(--bg-surface-hover);
  border-color: var(--border-hover);
}

.variant-danger {
  background-color: var(--color-danger);
  color: #fff;
}
.variant-danger:hover:not(:disabled) {
  filter: brightness(1.1);
}

.variant-ghost {
  background-color: transparent;
  color: var(--text-muted);
}
.variant-ghost:hover:not(:disabled) {
  background-color: rgba(255,255,255,0.05);
  color: var(--text-main);
}

/* Spinner */
.spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.opacity-0 {
  opacity: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
