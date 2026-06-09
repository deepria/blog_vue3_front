<template>
  <section class="page-shell">
    <header class="page-shell-header">
      <div class="page-shell-copy">
        <p v-if="eyebrow" class="page-shell-eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p v-if="description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="page-shell-actions">
        <slot name="actions"></slot>
      </div>
    </header>
    <div class="page-shell-body">
      <slot></slot>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  eyebrow: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.page-shell {
  width: min(100%, var(--max-width));
  margin: 0 auto;
  padding: 36px 28px 96px;
}

.page-shell-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.page-shell-copy {
  min-width: 0;
}

.page-shell-eyebrow {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-shell h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: clamp(24px, 3vw, var(--font-size-hero));
  line-height: 1.16;
  font-weight: 760;
  letter-spacing: 0;
}

.page-shell-copy p:not(.page-shell-eyebrow) {
  max-width: 680px;
  margin: 8px 0 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.page-shell-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.page-shell-body {
  display: grid;
  gap: 20px;
}

@media (max-width: 720px) {
  .page-shell {
    padding: 24px 16px 104px;
  }

  .page-shell-header {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
  }

  .page-shell-actions {
    justify-content: flex-start;
  }
}
</style>
