<template>
  <BaseCard class="upload-panel" hoverable>
    <template #header>
      <div class="panel-header">
        <div>
          <h3 class="panel-title">Upload Zone</h3>
          <p class="panel-subtitle">Drop a file here or tap to choose one</p>
        </div>
        <span class="panel-chip">Protected</span>
      </div>
    </template>

    <div
      class="upload-zone"
      :class="{ 'is-dragging': isDragging }"
      @dragover.prevent="$emit('drag-state', true)"
      @dragleave.prevent="$emit('drag-state', false)"
      @drop.prevent="$emit('drop', $event)"
      @click="openFilePicker"
    >
      <div class="upload-content">
        <div class="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p class="upload-title"><strong>Click to upload</strong> or drag and drop</p>
        <p class="sub-text">Supports all file types and optional protection keys</p>
      </div>
      <input
        ref="inputRef"
        type="file"
        style="display:none"
        @click.stop
        @change="handleChange"
      />
    </div>

  </BaseCard>
</template>

<script setup>
import { ref } from "vue";
import BaseCard from "@/shared/ui/BaseCard.vue";

defineProps({
  isDragging: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["change", "drop", "drag-state"]);

const inputRef = ref(null);

function openFilePicker() {
  inputRef.value?.click();
}

function handleChange(event) {
  emit("change", event);
  if (event?.target) {
    event.target.value = "";
  }
}
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.panel-title {
  margin: 0;
}

.panel-subtitle {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.panel-chip {
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  min-height: 26px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-size: 12px;
  font-weight: 700;
}

.upload-zone {
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  padding: 42px 24px;
  text-align: center;
  cursor: pointer;
  background: var(--color-bg-panel);
  transition: border-color 0.16s ease, background-color 0.16s ease, transform 0.16s ease;
}

.upload-zone.is-dragging {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  transform: translateY(-1px);
}

.upload-content {
  display: grid;
  justify-items: center;
  gap: 10px;
}

.upload-icon {
  width: 52px;
  height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.upload-title {
  margin: 0;
  color: var(--color-text-primary);
}

.sub-text {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

</style>
