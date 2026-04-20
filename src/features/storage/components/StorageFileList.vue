<template>
  <BaseCard class="library-panel">
    <template #header>
      <div class="panel-header">
        <div>
          <h3 class="panel-title">File Library</h3>
          <p class="panel-subtitle">{{ loading ? "Loading files..." : `${files.length} files available` }}</p>
        </div>
      </div>
    </template>

    <div v-if="loading" class="grid-skeleton">
      <BaseSkeleton v-for="i in 6" :key="i" height="86px" shape="rect" />
    </div>

    <div v-else-if="files.length === 0" class="empty-state">
      <p>No files uploaded yet</p>
    </div>

    <div v-else class="file-grid">
      <BaseCard v-for="file in files" :key="file.key" class="file-card" hoverable>
        <div class="file-item-row">
          <div class="file-details">
            <div class="file-name">
              {{ file.display_name }}
              <span v-if="file.has_password" class="lock-indicator">Protected</span>
            </div>
            <div class="file-actions">
              <button
                v-if="file.isPreviewable"
                class="icon-text-btn"
                @click.stop="$emit('preview', file)"
              >
                Preview
              </button>
              <button class="icon-text-btn" @click.stop="$emit('download', file)">Download</button>
              <button class="icon-text-btn danger" @click.stop="$emit('delete', file)">Delete</button>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  </BaseCard>
</template>

<script setup>
import BaseCard from "@/shared/ui/BaseCard.vue";
import BaseSkeleton from "@/shared/ui/BaseSkeleton.vue";

defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["preview", "download", "delete"]);
</script>

<style scoped>
.panel-title {
  margin: 0;
}

.panel-subtitle {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
}

.file-grid {
  display: grid;
  gap: 12px;
}

.file-item-row {
  display: flex;
  align-items: center;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.lock-indicator {
  font-size: 12px;
  color: var(--color-primary);
}

.file-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.icon-text-btn {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.danger {
  color: #ef4444;
}
</style>
