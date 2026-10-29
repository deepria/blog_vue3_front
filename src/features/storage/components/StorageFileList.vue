<template>
  <BaseCard class="library-panel">
    <template #header>
      <div class="panel-header">
        <div>
          <h3 class="panel-title">파일 목록</h3>
          <p class="panel-subtitle">
            {{
              loading ? "파일을 불러오는 중입니다." : `파일 ${files.length}개`
            }}
          </p>
        </div>
        <div class="sort-controls" aria-label="파일 정렬 도구">
          <div
            class="sort-toggle"
            :class="`is-${sortKey}`"
            role="group"
            aria-label="파일 정렬 기준"
          >
            <span class="sort-toggle-indicator" aria-hidden="true"></span>
            <button
              v-for="option in sortOptions"
              :key="option.value"
              class="sort-toggle-btn"
              :class="{ active: sortKey === option.value }"
              type="button"
              :aria-pressed="sortKey === option.value"
              @click="sortKey = option.value"
            >
              {{ option.label }}
            </button>
          </div>
          <button
            class="icon-btn-secondary sort-direction-btn"
            type="button"
            :title="sortDirection === 'asc' ? '오름차순' : '내림차순'"
            :aria-label="
              sortDirection === 'asc' ? '오름차순 정렬' : '내림차순 정렬'
            "
            @click="toggleSortDirection"
          >
            <svg
              v-if="sortDirection === 'asc'"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m3 8 4-4 4 4"></path>
              <path d="M7 4v16"></path>
              <path d="M11 12h10"></path>
              <path d="M11 16h7"></path>
              <path d="M11 20h4"></path>
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m3 16 4 4 4-4"></path>
              <path d="M7 20V4"></path>
              <path d="M11 4h10"></path>
              <path d="M11 8h7"></path>
              <path d="M11 12h4"></path>
            </svg>
          </button>
        </div>
      </div>
    </template>

    <div v-if="loading" class="grid-skeleton">
      <BaseSkeleton v-for="i in 6" :key="i" height="64px" shape="rect" />
    </div>

    <div v-else-if="files.length === 0" class="empty-state">
      <p>{{ emptyText }}</p>
    </div>

    <TransitionGroup v-else name="file-list" tag="div" class="file-grid">
      <div
        v-for="file in sortedFiles"
        :key="file.key"
        class="file-card-drag"
        :draggable="!file.isShared"
        :class="{ 'is-shared': file.isShared }"
        @dragstart="handleDragStart($event, file)"
        @dragend="$emit('drag-end')"
      >
        <BaseCard class="file-card" hoverable>
          <div class="file-item-row">
            <div class="file-details">
              <div class="file-name" :title="file.display_name">
                <span class="name-text">{{
                  getFileName(file.display_name)
                }}</span>
                <span class="name-ext">{{
                  getFileExt(file.display_name)
                }}</span>
                <span
                  v-if="file.has_password"
                  class="lock-indicator"
                  title="보호된 파일"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <span v-if="file.isShared" class="shared-indicator">
                  {{ file.owner_name }} 님이 공유함
                </span>
              </div>
              <div class="file-actions">
                <button
                  v-if="!file.isShared"
                  type="button"
                  class="icon-btn-secondary mini-btn"
                  title="폴더 이동"
                  :aria-label="`${file.display_name} 폴더 이동`"
                  @click.stop="$emit('move', file)"
                >
                  ↗
                </button>
                <button
                  class="icon-btn-secondary mini-btn"
                  @click.stop="$emit('preview', file)"
                  title="미리보기"
                  :aria-label="`${file.display_name} 미리보기`"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    ></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button
                  class="icon-btn-secondary mini-btn"
                  @click.stop="$emit('download', file)"
                  title="다운로드"
                  :aria-label="`${file.display_name} 다운로드`"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
                <button
                  v-if="!file.isShared"
                  class="icon-btn-secondary mini-btn"
                  @click.stop="$emit('share', file)"
                  title="공유"
                  :aria-label="`${file.display_name} 공유`"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
                <button
                  v-if="!file.isShared"
                  class="icon-btn-secondary mini-btn delete-btn"
                  @click.stop="$emit('delete', file)"
                  title="삭제"
                  :aria-label="`${file.display_name} 삭제`"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </TransitionGroup>
  </BaseCard>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import BaseCard from "@/shared/ui/BaseCard.vue";
import BaseSkeleton from "@/shared/ui/BaseSkeleton.vue";
import { useAppStore } from "@/store/app";
import { readListState, writeListState } from "@/shared/lib/listState";
import { sortFiles } from "@/features/storage/lib/filePresentation";

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: "아직 업로드한 파일이 없습니다.",
  },
});

const emit = defineEmits([
  "move",
  "preview",
  "download",
  "share",
  "delete",
  "drag-start",
  "drag-end",
]);

const sortOptions = [
  { value: "name", label: "이름" },
  { value: "extension", label: "확장자" },
  { value: "created_at", label: "업로드 날짜" },
];

const owner = useAppStore().user?.id;
const previousSort = readListState(owner, "file-sort");
const sortKey = ref(
  ["name", "extension", "created_at"].includes(previousSort.key)
    ? previousSort.key
    : "created_at",
);
const sortDirection = ref(previousSort.direction === "asc" ? "asc" : "desc");
watch([sortKey, sortDirection], () =>
  writeListState(owner, "file-sort", {
    key: sortKey.value,
    direction: sortDirection.value,
  }),
);
const sortedFiles = computed(() =>
  sortFiles(props.files, sortKey.value, sortDirection.value),
);

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
};

const handleDragStart = (event, file) => {
  if (file.isShared) {
    event.preventDefault();
    return;
  }
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", file.key);
  emit("drag-start", file);
};

const getFileName = (name) => {
  const lastDot = name.lastIndexOf(".");
  return lastDot === -1 ? name : name.slice(0, lastDot);
};

const getFileExt = (name) => {
  const lastDot = name.lastIndexOf(".");
  return lastDot === -1 ? "" : name.slice(lastDot);
};
</script>

<style scoped>
.panel-title {
  margin: 0;
  font-size: var(--font-size-title);
  color: var(--color-text-primary);
}

.library-panel {
  min-width: 0;
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

.sort-toggle {
  height: 34px;
  position: relative;
  display: inline-grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-surface);
  overflow: hidden;
}

.sort-toggle-indicator {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  width: calc((100% - 4px) / 3);
  border-radius: calc(var(--radius-sm) - 2px);
  background: var(--color-primary);
  transition: transform 0.18s ease;
  box-shadow: var(--shadow-sm);
}

.sort-toggle.is-extension .sort-toggle-indicator {
  transform: translateX(100%);
}

.sort-toggle.is-created_at .sort-toggle-indicator {
  transform: translateX(200%);
}

.sort-toggle-btn {
  position: relative;
  z-index: 1;
  min-width: 48px;
  height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: calc(var(--radius-sm) - 2px);
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-caption);
  font-weight: 650;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.sort-toggle-btn:not(.active):hover {
  background: var(--color-bg-panel);
}

.sort-toggle-btn.active {
  color: var(--text-inverse);
}

.sort-toggle-btn:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-primary) 38%, transparent);
  outline-offset: 2px;
}

.sort-direction-btn {
  width: 34px;
  height: 34px;
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

.file-list-move,
.file-list-enter-active,
.file-list-leave-active {
  pointer-events: none;
  transition:
    transform 0.18s ease,
    opacity 0.14s ease;
}

.file-list-enter-from,
.file-list-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.file-list-leave-active {
  pointer-events: none;
  position: absolute;
  width: 100%;
}

.file-card-drag {
  cursor: grab;
  min-width: 0;
}

.file-card-drag:active {
  cursor: grabbing;
}

.file-card-drag.is-shared {
  cursor: default;
}

.file-card :deep(.base-card-body) {
  padding: 10px 12px !important;
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
  width: 100%;
}

.file-name {
  display: flex;
  align-items: center;
  font-weight: 650;
  color: var(--color-text-primary);
  padding-right: var(--space-3);
  min-width: 0;
  max-width: 100%;
  flex: 1;
  font-size: var(--font-size-caption);
  line-height: 1.35;
}

.name-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name-ext {
  flex-shrink: 0;
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

.shared-indicator {
  margin-left: var(--space-2);
  padding: 2px 7px;
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-primary) 14%, transparent);
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.file-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.mini-btn {
  width: 30px;
  height: 30px;
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

  .sort-toggle {
    flex: 1;
  }

  .sort-toggle-btn {
    flex: 1;
    min-width: 0;
  }

  .file-name {
    padding-right: 8px;
  }

  .file-details {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .file-name {
    width: 100%;
  }
  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .file-card :deep(.base-card-body) {
    padding: 9px 10px !important;
  }

  .mini-btn {
    width: 44px;
    height: 44px;
  }
}
</style>
