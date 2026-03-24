<template>
  <div 
    class="task-item" 
    :class="{ 'is-completed': item.completed }"
    @click="$emit('edit', item)"
  >
    <div class="gloss-overlay"></div>
    <div class="specular-highlight"></div>
    <div 
      class="task-priority-indicator" 
      :style="{ backgroundColor: priorityColor }"
    ></div>

    <button class="delete-btn" @click.stop="$emit('delete', item.id)">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    </button>

    <div
      class="custom-checkbox"
      :class="{ 'checked': item.completed }"
      :style="{ borderColor: item.completed ? 'var(--color-primary)' : 'var(--color-border)' }"
      @click.stop="$emit('toggle', item)"
    >
        <svg v-if="item.completed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    </div>

    <div class="task-content">
      <span class="task-text">{{ item.text }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  },
  priorityColor: {
    type: String,
    default: '#666'
  }
});

defineEmits(['edit', 'delete', 'toggle']);
</script>

<style scoped>
.task-item {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: var(--glass-border);
    border-radius: var(--radius-sm);
    padding: var(--space-3) var(--space-4);
    display: flex;
    align-items: center;
    gap: var(--space-4);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
    min-height: 60px;
}

.specular-highlight {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
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
    opacity: 0.5;
}

.task-item:hover {
    transform: translateY(-4px) scale(1.01);
    background: var(--glass-bg-hover);
    box-shadow: var(--glass-shadow-deep);
}

.task-item:hover .gloss-overlay {
    background: var(--surface-shine);
    opacity: 0.8;
}

.task-priority-indicator {
    width: 4px;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 6;
}

.task-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.task-text {
    font-size: var(--font-size-body);
    color: var(--color-text-primary);
    font-weight: 500;
}

/* Delete Button */
.delete-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 0;
    opacity: 0.5;
    transition: all 0.2s;
}
.delete-btn:hover {
    color: var(--color-danger, #ef4444);
    opacity: 1;
}

/* Custom Checkbox */
.custom-checkbox {
    width: 28px;
    height: 28px;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    background: var(--color-bg-base); /* Using base bg */
    cursor: pointer;
}
.custom-checkbox.checked {
    border-color: var(--color-primary);
    background: rgba(66, 184, 131, 0.12);
}
.custom-checkbox:hover {
    border-color: var(--color-primary);
}

.is-completed .task-text {
    opacity: 0.5;
    text-decoration: line-through;
    color: var(--color-text-muted);
}
</style>
