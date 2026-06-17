<template>
  <BaseCard class="library-panel">
    <template #header>
      <div class="panel-header">
        <div>
          <h3 class="panel-title">File Library</h3>
          <p class="panel-subtitle">{{ loading ? "Loading files..." : `${files.length} files available` }}</p>
        </div>
        <div class="sort-controls" aria-label="File sort controls">
          <label class="sort-field">
            <span class="sr-only">Sort files by</span>
            <select v-model="sortKey" class="sort-select">
              <option value="original">Default</option>
              <option value="name">File name</option>
              <option value="extension">Extension</option>
            </select>
          </label>
          <button
            class="icon-btn-secondary sort-direction-btn"
            type="button"
            :disabled="sortKey === 'original'"
            :title="sortDirection === 'asc' ? 'Ascending' : 'Descending'"
            :aria-label="sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'"
            @click="toggleSortDirection"
          >
            <svg v-if="sortDirection === 'asc'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 4-4 4 4"></path><path d="M7 4v16"></path><path d="M11 12h10"></path><path d="M11 16h7"></path><path d="M11 20h4"></path></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"></path><path d="M7 20V4"></path><path d="M11 4h10"></path><path d="M11 8h7"></path><path d="M11 12h4"></path></svg>
          </button>
        </div>
      </div>
    </template>

    <div v-if="loading" class="grid-skeleton">
      <BaseSkeleton v-for="i in 6" :key="i" height="64px" shape="rect" />
    </div>

    <div v-else-if="files.length === 0" class="empty-state">
      <p>No files uploaded yet</p>
    </div>

    <div v-else class="file-grid">
      <div
        v-for="file in sortedFiles"
        :key="file.key"
        class="file-card-drag"
        draggable="true"
        @dragstart="handleDragStart($event, file)"
        @dragend="$emit('drag-end')"
      >
        <BaseCard class="file-card" hoverable>
          <div class="file-item-row">
            <div class="file-details">
              <div class="file-name" :title="file.display_name">
                <span class="name-text">{{ getFileName(file.display_name) }}</span>
                <span class="name-ext">{{ getFileExt(file.display_name) }}</span>
                <span v-if="file.has_password" class="lock-indicator" title="Protected">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
              </div>
              <div class="file-actions">
                <button
                  class="icon-btn-secondary mini-btn"
                  @click.stop="$emit('preview', file)"
                  title="Preview"
                  :aria-label="`Preview ${file.display_name}`"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
                <button class="icon-btn-secondary mini-btn" @click.stop="$emit('download', file)" title="Download" :aria-label="`Download ${file.display_name}`">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </button>
                <button class="icon-btn-secondary mini-btn delete-btn" @click.stop="$emit('delete', file)" title="Delete" :aria-label="`Delete ${file.display_name}`">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed, ref } from "vue";
import BaseCard from "@/shared/ui/BaseCard.vue";
import BaseSkeleton from "@/shared/ui/BaseSkeleton.vue";

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["preview", "download", "delete", "drag-start", "drag-end"]);

const sortKey = ref("original");
const sortDirection = ref("asc");
const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const sortedFiles = computed(() => {
  if (sortKey.value === "original") return props.files;

  const direction = sortDirection.value === "asc" ? 1 : -1;
  return [...props.files].sort((left, right) => {
    const primary = getSortValue(left.display_name, sortKey.value);
    const secondary = getSortValue(right.display_name, sortKey.value);
    const primaryResult = collator.compare(primary, secondary);
    if (primaryResult !== 0) return primaryResult * direction;

    return collator.compare(left.display_name || "", right.display_name || "") * direction;
  });
});

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
};

const handleDragStart = (event, file) => {
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", file.key);
  emit("drag-start", file);
};

const getSortValue = (name = "", key) => {
  if (key === "extension") return getFileExt(name).toLowerCase();
  return name;
};

const getFileName = (name) => {
  const lastDot = name.lastIndexOf('.');
  return lastDot === -1 ? name : name.slice(0, lastDot);
};

const getFileExt = (name) => {
  const lastDot = name.lastIndexOf('.');
  return lastDot === -1 ? '' : name.slice(lastDot);
};
</script>

<style scoped>
.panel-title {
  margin: 0;
  font-size: var(--font-size-title);
  color: var(--color-text-primary);
}

.panel-subtitle {
  margin: var(--space-1) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.sort-field {
  display: flex;
}

.sort-select {
  height: 34px;
  min-width: 122px;
  padding: 0 32px 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-caption);
  line-height: 1;
  cursor: pointer;
}

.sort-select:focus {
  outline: 2px solid color-mix(in srgb, var(--color-primary) 38%, transparent);
  outline-offset: 2px;
}

.sort-direction-btn {
  width: 34px;
  height: 34px;
}

.sort-direction-btn:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.file-grid {
  display: grid;
  gap: 10px;
}

.file-card-drag {
  cursor: grab;
}

.file-card-drag:active {
  cursor: grabbing;
}

.file-card :deep(.base-card-body) {
  padding: var(--space-3) var(--space-4) !important;
}

.file-item-row {
  display: flex;
  align-items: center;
}

.file-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.file-name {
  display: flex;
  align-items: center;
  font-weight: 650;
  color: var(--color-text-primary);
  padding-right: var(--space-3);
  min-width: 0;
  flex: 1;
}

.name-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name-ext {
  white-space: nowrap;
}

.lock-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-warning);
  margin-left: var(--space-2);
  flex-shrink: 0;
}

.file-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.mini-btn {
  width: 32px;
  height: 32px;
}

/* User wants cyan (테마에 어울리는 청록색) for delete */
.delete-btn:hover {
  background-color: var(--color-bg-elevated);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.empty-state {
  text-align: center;
  padding: 36px 20px;
  color: var(--color-text-muted);
}

@media (max-width: 640px) {
  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-controls {
    width: 100%;
  }

  .sort-field {
    flex: 1;
  }

  .sort-select {
    width: 100%;
  }

  .file-details {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
