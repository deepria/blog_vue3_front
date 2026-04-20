<template>
  <div class="memo-list-page">
    <header class="memo-header">
      <div class="header-copy">
        <h1 class="page-title">Memos</h1>
      </div>
      <div class="header-actions">
         <BaseButton variant="ghost" @click="handleRefresh">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
         </BaseButton>
         <BaseButton variant="secondary" @click="createMemo">
            + New Memo
         </BaseButton>
      </div>
    </header>

    <transition name="page-section" appear>
      <div v-if="contentVisible" class="page-content">
        <!-- Search & Filter -->
        <div class="search-bar">
            <BaseInput 
                v-model="searchQuery" 
                placeholder="Search memos..." 
                class="search-input"
            >
                <template #suffix>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </template>
            </BaseInput>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && filteredNotes.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <p>No memos found</p>
          <BaseButton v-if="searchQuery" variant="ghost" size="sm" @click="searchQuery = ''">Clear Search</BaseButton>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="memo-grid">
            <BaseSkeleton v-for="i in 6" :key="i" height="100px" shape="rect" />
        </div>

        <!-- Memo Grid -->
        <div v-else class="memo-grid">
      <div v-for="note in filteredNotes" :key="note.id" class="memo-wrapper">
        <BaseCard 
            class="memo-card" 
            :class="{ 'is-expanded': expandedId === note.id }"
            hoverable 
            interactive
            @click="togglePreview(note)"
        >
            <div class="memo-main">
                <div class="memo-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div class="memo-info">
                    <span class="memo-title">{{ note.title || 'Untitled Memo' }}</span>
                    <span class="memo-date">{{ formatDate(note.updatedAt || note.updated_at || Date.now()) }}</span>
                </div>
                <div class="memo-actions">
                     <button class="icon-btn-danger" @click.stop="confirmDelete(note)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                     </button>
                </div>
            </div>
        </BaseCard>

        <!-- Preview Section -->
        <transition name="expand">
            <div v-if="expandedId === note.id" class="preview-panel" @click.stop>
                <div v-if="loadingPreview" class="preview-loading">
                    <BaseSkeleton height="20px" width="80%" style="margin-bottom: 8px" />
                    <BaseSkeleton height="20px" width="60%" />
                </div>
                <div v-else class="preview-body">
                    <MarkdownViewer :content="previewContent" />
                </div>
                <div class="preview-footer">
                    <BaseButton size="sm" variant="primary" @click="editMemo(note.id)">
                        Edit Memo
                    </BaseButton>
                </div>
            </div>
        </transition>
      </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message, App } from 'ant-design-vue';
import { useMemo } from '@/features/memo/composables/useMemo';
import BaseButton from "@/shared/ui/BaseButton.vue";
import BaseInput from "@/shared/ui/BaseInput.vue";
import BaseCard from "@/shared/ui/BaseCard.vue";
import BaseSkeleton from "@/shared/ui/BaseSkeleton.vue";
import MarkdownViewer from "@/components/ui/MarkdownViewer.vue";

const router = useRouter();
const { modal } = App.useApp();

// Use the newly created composable
const {
  loading,
  loadingPreview,
  searchQuery,
  filteredNotes,
  loadNotes,
  getNote,
  deleteNote
} = useMemo();

const expandedId = ref(null);
const previewContent = ref("");
const contentVisible = ref(false);

const handleRefresh = async () => {
    await loadNotes();
    expandedId.value = null;
    message.success("Refreshed");
};

const editMemo = (id) => {
    router.push(`/memo/edit/${id}`);
};

const createMemo = () => router.push('/memo/edit');

const formatDate = (ts) => {
    const date = /^\d+$/.test(String(ts))
      ? new Date(Number(ts) * 1000)
      : new Date(ts);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const togglePreview = async (note) => {
    if (expandedId.value === note.id) {
        expandedId.value = null;
        return;
    }

    expandedId.value = note.id;
    const fullNote = await getNote(note.id);
    previewContent.value = fullNote?.content || '(No Content)';
};

const confirmDelete = (note) => {
    modal.confirm({
        title: 'Delete Memo',
        content: `Are you sure you want to delete "${note.title}"?`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        centered: true,
        onOk: async () => {
            try {
                await deleteNote(note.id);
                message.success("Deleted");
                if (expandedId.value === note.id) expandedId.value = null;
            } catch {
                message.error("Delete failed");
            }
        }
    });
};

onMounted(async () => {
    await loadNotes();
    requestAnimationFrame(() => {
        contentVisible.value = true;
    });
});
</script>

<style scoped>
.memo-list-page {
    padding: var(--space-6);
    max-width: 1200px;
    margin: 0 auto;
}

.memo-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 12px;
    margin-bottom: var(--space-8);
}

.header-copy {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: flex-end;
}
.page-title {
    font-size: 2.5rem;
    font-weight: 900;
    margin: 0;
    background: linear-gradient(135deg, #fff 0%, #888 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.search-bar {
    margin-bottom: var(--space-8);
    max-width: 600px;
}

.page-content {
    will-change: transform, opacity;
}

.memo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
}

.memo-wrapper {
    position: relative;
}

.memo-card {
    border-radius: var(--radius-lg);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.memo-card :deep(.base-card-body) {
    padding: 12px 14px !important;
}

.memo-main {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    min-height: 44px;
}

.memo-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.08);
    border: var(--glass-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    box-shadow: inset 0 0 10px rgba(255,255,255,0.05);
}

.memo-icon svg {
    width: 20px;
    height: 20px;
}

.memo-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 2px;
}

.memo-title {
    font-weight: 600;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.95rem;
    line-height: 1.25;
}

.memo-date {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.2;
}

.memo-actions {
    opacity: 0;
    transition: opacity 0.2s;
}
.memo-card:hover .memo-actions {
    opacity: 1;
}

.icon-btn-danger {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
}
.icon-btn-danger:hover {
    background: rgba(239, 68, 68, 0.1);
    color: var(--color-danger, #ef4444);
}

/* Preview Panel */
.preview-panel {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: var(--glass-border-light);
    border-top: none;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    padding: var(--space-6);
    margin-top: -2px;
    position: relative;
    z-index: 1;
    box-shadow: var(--glass-shadow-deep);
}

.preview-body {
    color: var(--color-text-primary);
}

.preview-body :deep(*) {
    color: inherit;
}

.preview-body :deep(p),
.preview-body :deep(li),
.preview-body :deep(blockquote) {
    color: var(--color-text-secondary) !important;
}

.preview-body :deep(h1),
.preview-body :deep(h2),
.preview-body :deep(h3),
.preview-body :deep(h4),
.preview-body :deep(h5),
.preview-body :deep(h6),
.preview-body :deep(strong),
.preview-body :deep(code) {
    color: var(--color-text-primary) !important;
}

.preview-body :deep(a) {
    color: #93c5fd !important;
}

.preview-body :deep(pre) {
    background: rgba(255, 255, 255, 0.08) !important;
    color: var(--color-text-primary) !important;
    border-radius: 12px;
}

.preview-body :deep(code) {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 0.1em 0.35em;
}

.preview-loading {
    padding: var(--space-3);
}

.preview-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--space-3);
    padding-top: var(--space-3);
    border-top: 1px solid var(--color-border);
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-8) 0;
    color: var(--color-text-muted);
}
.empty-icon {
    margin-bottom: var(--space-3);
    opacity: 0.5;
}

/* Transitions */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.page-section-enter-active,
.page-section-appear-active {
    transition: opacity 0.42s ease, transform 0.42s ease;
}

.page-section-enter-from,
.page-section-appear-from {
    opacity: 0;
    transform: translateY(18px);
}

@media (max-width: 768px) {
    .memo-list-page {
        padding: var(--mobile-shell-gutter);
    }

    .memo-header {
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
    }

    .header-actions {
        margin-left: auto;
        flex-shrink: 0;
    }

    .search-bar {
        margin-bottom: 14px;
    }

    .memo-grid {
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .memo-card :deep(.base-card-body) {
        padding: 10px 12px !important;
    }

    .memo-main {
        grid-template-columns: 36px minmax(0, 1fr) auto;
        gap: 8px;
        min-height: 38px;
    }

    .memo-icon {
        width: 36px;
        height: 36px;
    }

    .memo-icon svg {
        width: 18px;
        height: 18px;
    }

    .memo-title {
        font-size: 0.9rem;
    }

    .preview-panel {
        padding: 14px;
    }
}
</style>
