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
  --card-bg: var(--color-bg-elevated);
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
  --card-bg: var(--glass-bg-elevated);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: var(--glass-border);
}

.base-card.glass::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: var(--surface-gloss);
  opacity: 0.38;
  z-index: 0;
}

.base-card.hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-strong);
}

.base-card.glass.hoverable:hover {
  --card-bg: var(--glass-bg-hover);
  box-shadow: var(--shadow-lg);
}

.base-card.hoverable:hover::before {
  background: var(--surface-shine);
  opacity: 1;
}

.base-card.interactive {
  cursor: pointer;
}

.base-card.interactive:active {
  transform: scale(0.98);
}

.base-card-header {
  padding: var(--space-4) var(--space-4) 0;
  position: relative;
  z-index: 1;
}

.base-card-title {
  margin: 0;
  font-size: var(--font-size-title);
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: var(--tracking-tight);
}

.base-card-body {
  padding: var(--space-4);
  flex: 1;
  position: relative;
  z-index: 1;
}

.base-card-footer {
  padding: 0 var(--space-4) var(--space-4);
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
