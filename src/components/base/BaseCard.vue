<template>
  <div 
    class="base-card" 
    :class="[
      { 'is-hoverable': hoverable, 'is-interactive': interactive },
      paddingClass
    ]"
    @click="$emit('click', $event)"
  >
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    
    <div class="card-body">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  hoverable: {
    type: Boolean,
    default: false
  },
  interactive: {
    type: Boolean,
    default: false // Adds cursor pointer + active state
  },
  padding: {
    type: String,
    default: 'md', // none, sm, md, lg
    validator: (v) => ['none', 'sm', 'md', 'lg'].includes(v)
  }
});

defineEmits(['click']);

const paddingClass = computed(() => `padding-${props.padding}`);
</script>

<style scoped>
.base-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
}

/* Interactions */
.is-hoverable:hover {
  transform: translateY(-4px);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-lg);
}

.is-interactive {
  cursor: pointer;
}
.is-interactive:active {
  transform: scale(0.98);
}

/* Padding Variants */
.padding-none .card-body { padding: 0; }
.padding-sm .card-body { padding: var(--space-sm); }
.padding-md .card-body { padding: var(--space-md); }
.padding-lg .card-body { padding: var(--space-lg); }

/* Header/Footer (Optional) */
.card-header {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  background-color: rgba(255, 255, 255, 0.02);
}

.card-footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--border-color);
  background-color: rgba(255, 255, 255, 0.02);
}

.card-body {
  flex: 1;
}
</style>
