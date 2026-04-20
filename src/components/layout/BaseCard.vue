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
  --card-bg-color: rgba(255, 255, 255, 0.008);
  --card-bg-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.002));
  --card-border: 1px solid rgba(255, 255, 255, 0.08);
  --card-shadow:
    0 24px 64px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  background-color: var(--card-bg-color);
  background-image: var(--card-bg-image);
  border-radius: var(--radius-md);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.base-card.glass {
  background-color: var(--card-bg-color);
  background-image: var(--card-bg-image);
  backdrop-filter: blur(34px) saturate(155%);
  -webkit-backdrop-filter: blur(34px) saturate(155%);
  border: var(--card-border);
}

.base-card.glass::before,
.base-card.glass::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.base-card.glass::before {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.008) 36%, rgba(255, 255, 255, 0) 72%),
    radial-gradient(circle at top left, rgba(182, 255, 227, 0.035), transparent 44%);
  opacity: 0.18;
  z-index: 0;
}

.base-card.glass::after {
  inset: 1px 1px auto 1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
  opacity: 0.45;
  z-index: 5;
}

.base-card.hoverable:hover {
  transform: translateY(-6px);
  box-shadow: var(--glass-shadow-deep);
}

.base-card.hoverable:hover::before {
  background: var(--surface-shine);
  opacity: 0.95;
  transition: opacity 0.5s ease, background 0.5s ease;
}

.base-card.glass.hoverable:hover {
  --card-bg-color: rgba(255, 255, 255, 0.014);
  border-color: rgba(255, 255, 255, 0.12);
}

.base-card.interactive {
  cursor: pointer;
}

.base-card.interactive:active {
  transform: scale(0.985);
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

.base-card-header,
.base-card-body,
.base-card-footer {
  position: relative;
  z-index: 2;
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
