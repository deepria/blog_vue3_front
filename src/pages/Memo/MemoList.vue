<template>
  <div class="memo-list-page">
    <header class="memo-header">
      <div class="header-copy">
        <h1 class="page-title">Memos</h1>
      </div>
      <div class="header-actions">
         <button class="icon-btn-secondary" @click="handleRefresh" title="Refresh">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
         </button>
         <button class="icon-btn-primary" @click="createMemo" title="New Memo">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         </button>
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
    max-width: var(--max-width);
    margin: 0 auto;
}

.memo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-8);
}

.header-copy {
    display: flex;
    align-items: flex-end;
}

.page-title {
    font-size: var(--font-size-hero);
    font-weight: 800;
    color: var(--color-text-primary);
    margin: 0;
    letter-spacing: var(--tracking-tight);
}

.header-actions {
    display: flex;
    gap: var(--space-2);
}

.search-bar {
    margin-bottom: var(--space-6);
    max-width: 600px;
}

.page-content {
    will-change: transform, opacity;
}

.memo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
}

.memo-wrapper {
    position: relative;
}

.memo-card {
    border-radius: var(--radius-lg);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.memo-main {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-3);
    min-height: 44px;
}

.memo-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background-color: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
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
    font-size: var(--font-size-body);
    line-height: 1.25;
}

.memo-date {
    font-size: var(--font-size-caption);
    color: var(--color-text-muted);
    line-height: 1.2;
}

.memo-actions {
    opacity: 0;
    transition: opacity 0.2s ease;
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
    border-radius: var(--radius-sm);
    transition: all 0.2s ease;
}

.icon-btn-danger:hover {
    background-color: var(--color-danger);
    color: white;
}

/* Preview Panel */
.preview-panel {
    background-color: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-top: none;
    border-bottom-left-radius: var(--radius-lg);
    border-bottom-right-radius: var(--radius-lg);
    padding: var(--space-6);
    margin-top: -2px;
    position: relative;
    z-index: 1;
    box-shadow: var(--shadow-lg);
}

.preview-body {
    color: var(--color-text-primary);
    font-size: var(--font-size-body);
    line-height: 1.6;
}

.preview-body :deep(h1),
.preview-body :deep(h2),
.preview-body :deep(h3),
.preview-body :deep(h4),
.preview-body :deep(h5),
.preview-body :deep(h6),
.preview-body :deep(p),
.preview-body :deep(span),
.preview-body :deep(div),
.preview-body :deep(li),
.preview-body :deep(strong),
.preview-body :deep(em) {
    color: var(--color-text-primary) !important;
}

.preview-body :deep(a) {
    color: var(--color-primary) !important;
}

.preview-body :deep(code),
.preview-body :deep(pre) {
    color: var(--color-primary-strong) !important;
    background-color: var(--color-bg-base) !important;
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-8) 0;
    color: var(--color-text-muted);
    gap: var(--space-3);
}

.empty-icon {
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
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.page-section-enter-from,
.page-section-appear-from {
    opacity: 0;
    transform: translateY(18px);
}

@media (max-width: 768px) {
    .memo-header {
        align-items: center;
        margin-bottom: var(--space-4);
    }
    .memo-grid {
        grid-template-columns: 1fr;
    }
}
</style>
