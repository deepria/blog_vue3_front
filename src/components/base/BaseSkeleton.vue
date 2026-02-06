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
  background-color: var(--bg-surface-hover);
  position: relative;
  overflow: hidden;
}

/* Shapes */
.shape-rect {
  border-radius: var(--radius-md);
}

.shape-circle {
  border-radius: 50%;
}

/* Shimmer Animation */
.base-skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.05) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
