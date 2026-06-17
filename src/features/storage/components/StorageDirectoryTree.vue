<template>
  <BaseCard class="directory-panel" :class="{ 'is-mobile-open': isMobileOpen }">
    <template #header>
      <div class="panel-header">
        <button
          class="mobile-folder-toggle"
          type="button"
          :aria-expanded="isMobileOpen"
          @click="isMobileOpen = !isMobileOpen"
        >
          <span class="mobile-folder-copy">
            <span class="panel-title">Folders</span>
          </span>
          <span class="mobile-folder-chevron" :class="{ open: isMobileOpen }">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
          </span>
        </button>
        <div class="desktop-folder-title">
          <h3 class="panel-title">Folders</h3>
          <p class="panel-subtitle">{{ directories.length }} folders</p>
        </div>
        <button class="icon-btn-secondary add-btn" type="button" title="Add folder" aria-label="Add folder" @click="$emit('create')">
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
        </button>
      </div>
    </template>

    <div class="directory-list" :class="{ 'mobile-open': isMobileOpen }">
      <button
        class="directory-row"
        :class="{ active: selectedId === 'all' }"
        type="button"
        @click="selectDirectory('all')"
      >
        <span class="folder-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h5l2 3h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M3 7V5a2 2 0 0 1 2-2h4l2 4"></path></svg>
        </span>
        <span class="directory-name">All files</span>
        <span class="directory-count">{{ totalFiles }}</span>
      </button>

      <button
        class="directory-row"
        :class="{ active: selectedId === 'unassigned', 'is-drop-target': dragOverId === 'unassigned' }"
        type="button"
        @click="selectDirectory('unassigned')"
        @dragover.prevent="dragOverId = 'unassigned'"
        @dragleave="dragOverId = null"
        @drop.prevent="handleDrop($event, null)"
      >
        <span class="folder-icon muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9V5a2 2 0 0 1 2-2h4l2 3h10a2 2 0 0 1 2 2v1"></path><path d="M2 13h20"></path><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"></path></svg>
        </span>
        <span class="directory-name">Unassigned</span>
        <span class="directory-count">{{ unassignedCount }}</span>
      </button>

      <div v-if="directories.length === 0" class="empty-folders">
        <p>No folders yet</p>
      </div>

      <div
        v-for="directory in visibleDirectories"
        :key="directory.id"
        class="directory-row folder-row"
        :class="{ active: selectedId === directory.id, 'is-drop-target': dragOverId === directory.id }"
        :style="{ paddingLeft: `${12 + directory.depth * 18}px` }"
        @dragover.prevent="dragOverId = directory.id"
        @dragleave="dragOverId = null"
        @drop.prevent="handleDrop($event, directory.id)"
      >
        <button class="directory-main" type="button" @click="selectDirectory(directory.id)">
          <span class="folder-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h5l2 3h11v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M3 7V5a2 2 0 0 1 2-2h4l2 4"></path></svg>
          </span>
          <input
            v-if="editingId === directory.id"
            ref="editInput"
            v-model="editingName"
            class="directory-input"
            type="text"
            maxlength="80"
            @click.stop
            @compositionstart="isComposing = true"
            @compositionend="finishComposition"
            @keyup.enter.prevent="commitRename(directory, $event)"
            @keydown.esc.prevent="cancelRename"
            @blur="commitRename(directory, $event)"
          />
          <span v-else class="directory-name" :title="directory.name">{{ directory.name }}</span>
          <span class="directory-count">{{ fileCounts[directory.id] || 0 }}</span>
        </button>
        <button class="row-icon-btn" type="button" title="Rename" aria-label="Rename folder" @click.stop="startRename(directory)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"></path></svg>
        </button>
        <button class="row-icon-btn danger" type="button" title="Delete" aria-label="Delete folder" @click.stop="$emit('delete', directory.id)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path></svg>
        </button>
      </div>
    </div>
  </BaseCard>
</template>

<script setup>
import { computed, nextTick, ref } from "vue";
import BaseCard from "@/shared/ui/BaseCard.vue";

const props = defineProps({
  directories: {
    type: Array,
    default: () => [],
  },
  selectedId: {
    type: String,
    default: "all",
  },
  fileCounts: {
    type: Object,
    default: () => ({}),
  },
  totalFiles: {
    type: Number,
    default: 0,
  },
  unassignedCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["create", "rename", "delete", "select", "move-file"]);

const dragOverId = ref(null);
const editingId = ref(null);
const editingName = ref("");
const editInput = ref(null);
const isComposing = ref(false);
const isMobileOpen = ref(false);

const visibleDirectories = computed(() => {
  const byParent = new Map();
  props.directories.forEach((directory) => {
    const parentId = directory.parent_id || "root";
    if (!byParent.has(parentId)) byParent.set(parentId, []);
    byParent.get(parentId).push(directory);
  });

  byParent.forEach((items) => {
    items.sort((left, right) => {
      if (left.sort_order !== right.sort_order) return left.sort_order - right.sort_order;
      return left.name.localeCompare(right.name);
    });
  });

  const result = [];
  const visit = (parentId, depth) => {
    (byParent.get(parentId) || []).forEach((directory) => {
      result.push({ ...directory, depth });
      visit(directory.id, depth + 1);
    });
  };
  visit("root", 0);
  return result;
});

function handleDrop(event, directoryId) {
  dragOverId.value = null;
  const fileKey = event.dataTransfer?.getData("text/plain");
  if (!fileKey) return;
  emit("move-file", { fileKey, directoryId });
}

function selectDirectory(id) {
  emit("select", id);
  isMobileOpen.value = false;
}

function startRename(directory) {
  editingId.value = directory.id;
  editingName.value = directory.name;
  nextTick(() => {
    const target = Array.isArray(editInput.value) ? editInput.value[0] : editInput.value;
    target?.focus();
    target?.select();
  });
}

function finishComposition(event) {
  isComposing.value = false;
  editingName.value = event?.target?.value || "";
}

function commitRename(directory, event) {
  if (editingId.value !== directory.id) return;
  if (isComposing.value || event?.isComposing) return;

  const name = (event?.target?.value ?? editingName.value).trim();
  editingId.value = null;
  editingName.value = "";
  if (name && name !== directory.name) {
    emit("rename", { id: directory.id, name });
  }
}

function cancelRename() {
  editingId.value = null;
  editingName.value = "";
}
</script>

<style scoped>
.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.mobile-folder-toggle {
  display: none;
}

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

.add-btn {
  width: 34px;
  height: 34px;
}

.directory-list {
  display: grid;
  gap: 6px;
}

.directory-row {
  width: 100%;
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  text-align: left;
  cursor: pointer;
}

.directory-row:hover,
.directory-row.active {
  background: var(--color-bg-panel);
  border-color: var(--color-border);
}

.directory-row.is-drop-target {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.folder-row {
  cursor: default;
}

.directory-main {
  flex: 1;
  min-width: 0;
  height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.folder-icon {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--color-primary);
}

.folder-icon.muted {
  color: var(--color-text-muted);
}

.directory-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--font-size-caption);
  font-weight: 650;
}

.directory-count {
  flex-shrink: 0;
  min-width: 22px;
  color: var(--color-text-muted);
  font-size: 12px;
  text-align: right;
}

.directory-input {
  flex: 1;
  min-width: 0;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  font: inherit;
}

.row-icon-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
}

.row-icon-btn:hover {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
}

.row-icon-btn.danger:hover {
  color: var(--color-danger);
}

.empty-folders {
  padding: 8px 10px;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}

.empty-folders p {
  margin: 0;
}

@media (max-width: 640px) {
  .directory-panel :deep(.base-card-header) {
    padding: 10px 12px;
  }

  .directory-panel :deep(.base-card-body) {
    padding: 0 12px;
    transition: padding-bottom 0.18s ease;
  }

  .directory-panel.is-mobile-open :deep(.base-card-body) {
    padding-bottom: 12px;
  }

  .panel-header {
    align-items: center;
  }

  .desktop-folder-title {
    display: none;
  }

  .mobile-folder-toggle {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-text-primary);
    text-align: left;
    cursor: pointer;
  }

  .mobile-folder-chevron {
    display: inline-flex;
    flex-shrink: 0;
    color: var(--color-text-muted);
    transition: transform 0.16s ease;
  }

  .mobile-folder-chevron.open {
    transform: rotate(180deg);
  }

  .directory-list {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-4px);
    transition: max-height 0.18s ease, opacity 0.14s ease, transform 0.18s ease;
  }

  .directory-list.mobile-open {
    display: grid;
    max-height: 420px;
    opacity: 1;
    transform: translateY(0);
    margin-top: 0;
  }

  .directory-row {
    min-height: 34px;
  }
}
</style>
