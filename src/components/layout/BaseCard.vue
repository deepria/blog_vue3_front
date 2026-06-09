<template>
  <div :class="['base-card', { hoverable: hoverable, glass: glass, interactive: interactive }]">
    <div v-if="$slots.header || title" class="base-card-header">
      <slot name="header">
        <h3 v-if="title" class="base-card-title">{{ title }}</h3>
      </slot>
    </div>
    
    <div class="base-card-body">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="base-card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  hoverable: {
    type: Boolean,
    default: false
  },
  interactive: {
    type: Boolean,
    default: false
  },
  glass: {
    type: Boolean,
    default: true
  }
});
</script>

<style scoped>
.base-card {
  --card-bg: var(--color-bg-surface);
  --card-border: 1px solid var(--color-border);
  --card-shadow: var(--shadow-sm);
  
  background-color: var(--card-bg);
  border-radius: var(--radius-lg);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.base-card.glass {
  --card-bg: var(--color-bg-surface);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: var(--glass-border);
}

.base-card.glass::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0));
  opacity: 0.4;
  z-index: 0;
}

.base-card.hoverable:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-strong);
}

.base-card.glass.hoverable:hover {
  --card-bg: var(--glass-bg-hover);
  box-shadow: var(--shadow-md);
}

.base-card.hoverable:hover::before {
  background: var(--surface-shine);
  opacity: 1;
}

.base-card.interactive {
  cursor: pointer;
}

.base-card.interactive:active {
  transform: scale(0.99);
}

.base-card-header {
  padding: 18px 18px 0;
  position: relative;
  z-index: 1;
}

.base-card-title {
  margin: 0;
  font-size: var(--font-size-title);
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 0;
}

.base-card-body {
  padding: 18px;
  flex: 1;
  position: relative;
  z-index: 1;
}

.base-card-footer {
  padding: 0 18px 18px;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .base-card {
    border-radius: var(--radius-lg);
  }
}
</style>
