<template>
  <div 
    class="base-skeleton" 
    :class="[`shape-${shape}`]"
    :style="{ width, height }"
  ></div>
</template>

<script setup>
defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '20px'
  },
  shape: {
    type: String,
    default: 'rect', // rect, circle
    validator: (v) => ['rect', 'circle'].includes(v)
  }
});
</script>

<style scoped>
.base-skeleton {
  background-color: var(--color-bg-panel-strong);
  position: relative;
  overflow: hidden;
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

/* Shapes */
.shape-rect {
  border-radius: var(--radius-md);
}

.shape-circle {
  border-radius: 50%;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.62; }
  50% { opacity: 1; }
}
</style>
