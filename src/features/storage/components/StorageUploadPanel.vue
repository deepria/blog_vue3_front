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
      @click="$emit('pick')"
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
      <input ref="inputRef" type="file" style="display:none" @change="$emit('change', $event)" />
    </div>

    <div v-if="uploadTask" class="upload-status-card">
      <div class="upload-info">
        <span>{{ uploadTask.name }}</span>
        <span>{{ uploadTask.progress }}%</span>
      </div>
      <BaseProgressBar :value="uploadTask.progress" />
    </div>
  </BaseCard>
</template>

<script setup>
import { ref, watch } from "vue";
import BaseCard from "@/shared/ui/BaseCard.vue";
import BaseProgressBar from "@/shared/ui/BaseProgressBar.vue";

const props = defineProps({
  isDragging: {
    type: Boolean,
    default: false,
  },
  uploadTask: {
    type: Object,
    default: null,
  },
  triggerKey: {
    type: Number,
    default: 0,
  },
});

defineEmits(["pick", "change", "drop", "drag-state"]);

const inputRef = ref(null);

watch(
  () => props.triggerKey,
  () => {
    inputRef.value?.click();
  },
);
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.panel-title {
  margin: 0;
}

.panel-subtitle {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
}

.panel-chip {
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.08);
}

.upload-zone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-12);
  text-align: center;
  cursor: pointer;
}

.upload-zone.is-dragging {
  border-color: var(--color-primary);
}

.upload-status-card {
  margin-top: 16px;
}

.upload-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
</style>
