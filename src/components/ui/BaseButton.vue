<template>
  <button
    :class="[
      'base-button',
      `variant-${variant}`,
      `size-${size}`,
      { loading: loading, disabled: disabled, block: block }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <div class="button-highlight"></div>
    <div v-if="loading" class="spinner"></div>
    <span :class="{ 'opacity-0': loading }">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
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
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-family: inherit;
  font-weight: 600;
  letter-spacing: -0.01em;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.22s ease, background-color 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, color 0.22s ease, filter 0.22s ease;
  user-select: none;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.button-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  opacity: 0.5;
  z-index: 1;
}

/* Base states */
.base-button:active:not(:disabled) {
  transform: translateY(1px) scale(0.985);
}

.base-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-button.block {
  display: flex;
  width: 100%;
}

/* --- Sizes --- */
.size-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-caption);
  height: 32px;
}
.size-md {
  padding: 0 16px;
  font-size: var(--font-size-body);
  height: 42px;
}
.size-lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-title);
  height: 48px;
}

/* --- Variants --- */
.variant-primary {
  background: linear-gradient(135deg, rgba(103, 232, 180, 0.96) 0%, rgba(27, 120, 86, 0.96) 100%);
  color: #03110b;
  border-color: rgba(182, 255, 227, 0.3);
  box-shadow: 0 14px 30px rgba(103, 232, 180, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.22);
}
.variant-primary::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--surface-gloss);
  opacity: 0.18;
}
.variant-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(66, 184, 131, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.16);
  filter: brightness(1.06);
}

.variant-secondary {
  background: rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--color-text-primary);
  border-color: rgba(255, 255, 255, 0.1);
}
.variant-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.054);
  transform: translateY(-1px);
  border-color: rgba(255, 255, 255, 0.16);
}

.variant-ghost {
  background: rgba(255, 255, 255, 0.014);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: rgba(234, 255, 246, 0.86);
  border-color: rgba(255, 255, 255, 0.08);
}
.variant-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.028);
  color: var(--color-text-primary);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.variant-danger {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: #fff;
  border-color: rgba(239, 68, 68, 0.36);
}
.variant-danger:hover:not(:disabled) {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

/* --- Loading Spinner --- */
.spinner {
  position: absolute;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: inherit; /* Inherit color from text */
  animation: spin 0.8s linear infinite;
}
.variant-primary .spinner, .variant-danger .spinner {
  border-top-color: #fff;
}
.variant-secondary .spinner, .variant-ghost .spinner {
  border-top-color: var(--color-primary);
  border-color: rgba(0,0,0,0.1);
}

.opacity-0 {
  opacity: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
