<template>
  <div :class="['base-card', { hoverable: hoverable, glass: glass }]">
    <div v-if="glass" class="gloss-overlay"></div>
    <div v-if="glass" class="specular-highlight"></div>
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
  glass: {
    type: Boolean,
    default: true
  }
});
</script>

<style scoped>
.base-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.018), rgba(255, 255, 255, 0.006));
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.base-card.glass {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.008)),
    var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  position: relative;
  overflow: hidden;
}

.specular-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  z-index: 5;
}

.gloss-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--surface-gloss);
  pointer-events: none;
  z-index: 1;
}

.base-card.hoverable:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: var(--glass-shadow-deep);
}

.base-card.hoverable:hover .gloss-overlay {
  background: var(--surface-shine);
  opacity: 0.8;
  transition: opacity 0.5s ease;
}

.base-card.glass.hoverable:hover {
  background: var(--glass-bg-hover);
  border-color: rgba(255, 255, 255, 0.1);
}

.base-card-header {
  padding: var(--space-4) var(--space-4) 0 var(--space-4);
}

.base-card-title {
  margin: 0;
  font-size: var(--font-size-title);
  font-weight: 600;
  color: var(--color-text-primary);
}

.base-card-body {
  padding: var(--space-4);
  flex: 1;
}

.base-card-footer {
  padding: 0 var(--space-4) var(--space-4) var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

@media (max-width: 768px) {
  .base-card {
    border-radius: 18px;
  }

  .base-card-header {
    padding: 14px 14px 0 14px;
  }

  .base-card-body {
    padding: 14px;
  }

  .base-card-footer {
    padding: 0 14px 14px 14px;
  }
}
</style>
