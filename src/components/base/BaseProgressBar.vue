<template>
  <div class="base-progress">
    <div v-if="label || showValue" class="progress-header">
      <span v-if="label" class="progress-label">{{ label }}</span>
      <span v-if="showValue" class="progress-value">{{ percentage }}%</span>
    </div>
    <div class="progress-track">
      <div 
        class="progress-fill" 
        :style="{ width: `${percentage}%`, backgroundColor: color }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: Number,
    default: 0,
    validator: v => v >= 0 && v <= 100
  },
  label: {
    type: String,
    default: ''
  },
  showValue: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'var(--color-primary)'
  }
});

const percentage = computed(() => Math.min(100, Math.max(0, props.value)));
</script>

<style scoped>
.base-progress {
  width: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.progress-track {
  width: 100%;
  height: 6px;
  background-color: var(--bg-surface-hover);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease-out;
  border-radius: var(--radius-full);
}
</style>
