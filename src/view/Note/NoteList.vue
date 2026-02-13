<template>
  <div class="note-list-page">
    <header class="note-header">
      <div>
        <h1 class="page-title">Notes</h1>
        <p class="page-subtitle">Capture your ideas</p>
      </div>
      <div class="header-actions">
         <BaseButton variant="ghost" @click="loadNotes">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
         </BaseButton>
         <BaseButton variant="primary" @click="createNote">
            + New Note
         </BaseButton>
      </div>
    </header>

    <!-- Search & Filter -->
    <div class="search-bar">
        <BaseInput 
            v-model="searchQuery" 
            placeholder="Search notes..." 
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
      <p>No notes found</p>
      <BaseButton v-if="searchQuery" variant="ghost" size="sm" @click="searchQuery = ''">Clear Search</BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="note-grid">
        <BaseSkeleton v-for="i in 6" :key="i" height="100px" shape="rect" />
    </div>

    <!-- Note Grid -->
    <div v-else class="note-grid">
      <div v-for="note in filteredNotes" :key="note.id" class="note-wrapper">
        <BaseCard 
            class="note-card" 
            :class="{ 'is-expanded': expandedId === note.id }"
            hoverable 
            interactive
            @click="togglePreview(note)"
        >
            <div class="note-main">
                <div class="note-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <div class="note-info">
                    <span class="note-title">{{ note.title || 'Untitled Note' }}</span>
                    <span class="note-date">{{ formatDate(note.updatedAt || Date.now()) }}</span>
                </div>
                <div class="note-actions">
                     <button class="icon-btn-danger" @click.stop="confirmDelete(note)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                     </button>
                </div>
            </div>
        </BaseCard>

        <!-- Preview Section (Inline Expander) -->
        <transition name="expand">
            <div v-if="expandedId === note.id" class="preview-panel" @click.stop>
                <div v-if="loadingPreview" class="preview-loading">
                    <BaseSkeleton height="20px" width="80%" style="margin-bottom: 8px" />
                    <BaseSkeleton height="20px" width="60%" />
                </div>
                <div v-else class="preview-body">
                    <div :id="'viewer-' + note.id" class="toast-viewer"></div>
                </div>
                <div class="preview-footer">
                    <BaseButton size="sm" variant="primary" @click="editNote(note.id)">
                        Edit Note
                    </BaseButton>
                </div>
            </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message, App } from 'ant-design-vue';
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import { fetchNotes, deleteNote, loadNote } from '@/services/noteService';
import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseCard from "@/components/base/BaseCard.vue";
import BaseSkeleton from "@/components/base/BaseSkeleton.vue";

const router = useRouter();
const notes = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const expandedId = ref(null);
const loadingPreview = ref(false);
const { modal } = App.useApp();
let viewerInstance = null;

// Search Logic
const filteredNotes = computed(() => {
    if (!searchQuery.value.trim()) return notes.value;
    const query = searchQuery.value.toLowerCase();
    return notes.value.filter(note => 
        (note.title && note.title.toLowerCase().includes(query))
    );
});

const loadNotes = async () => {
    // Only show full skeleton on initial load if empty
    if(notes.value.length === 0) loading.value = true;
    
    expandedId.value = null;
    if (viewerInstance) {
       viewerInstance.destroy();
       viewerInstance = null;
    }
    try {
        const raw = await fetchNotes();
        notes.value = raw || [];
        message.success("Refreshed");
    } catch (e) {
        console.error(e);
        message.error("Failed to load notes");
    } finally {
        loading.value = false;
    }
};

const editNote = (id) => {
    router.push(`/notes/edit/${id}`);
};

const createNote = () => router.push('/notes/edit');

const formatDate = (ts) => {
    const date = new Date(ts);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const togglePreview = async (note) => {
    if (expandedId.value === note.id) {
        expandedId.value = null;
        if (viewerInstance) {
            viewerInstance.destroy();
            viewerInstance = null;
        }
        return;
    }

    if (viewerInstance) {
        viewerInstance.destroy();
        viewerInstance = null;
    }

    expandedId.value = note.id;
    loadingPreview.value = true;

    try {
        const fullNote = await loadNote(note.id);
        loadingPreview.value = false;
        await nextTick();
        
        const el = document.getElementById('viewer-' + note.id);
        if (el) {
            viewerInstance = new Viewer({
                el: el,
                initialValue: fullNote.content || '(No Content)',
                theme: 'dark'
            });
        }
    } catch (e) {
        console.error(e);
        message.error("Preview failed");
        loadingPreview.value = false;
    }
};

const confirmDelete = (note) => {
    modal.confirm({
        title: 'Delete Note',
        content: `Are you sure you want to delete "${note.title}"?`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        centered: true,
        onOk: async () => {
             try {
                 await deleteNote(note.id);
                 message.success("Deleted");
                 if(expandedId.value === note.id) expandedId.value = null;
                 await loadNotes();
             } catch(e) {
                 console.error(e);
                 message.error("Delete failed");
             }
        }
    });
};

onMounted(loadNotes);
</script>

<style scoped>
.note-list-page {
    padding: var(--space-xl);
    max-width: var(--max-width);
    margin: 0 auto;
}

.note-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: var(--space-lg);
}
.page-title {
    font-size: var(--text-3xl);
    font-weight: 800;
    margin: 0;
}
.page-subtitle {
     color: var(--text-muted);
     margin-top: var(--space-xs);
}
.header-actions {
    display: flex;
    gap: var(--space-sm);
}

.search-bar {
    margin-bottom: var(--space-xl);
}

.note-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-lg);
}

.note-wrapper {
    position: relative;
}

.note-card {
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
    z-index: 2;
    position: relative;
}
.note-card.is-expanded {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom-color: transparent;
}

.note-main {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    width: 100%;
    padding: var(--space-sm) var(--space-md);
}

.note-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
}
.note-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}
.note-title {
    font-weight: 600;
    color: var(--text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.note-date {
    font-size: var(--text-xs);
    color: var(--text-disabled);
}

.note-actions {
    opacity: 0;
    transition: opacity 0.2s;
}
.note-card:hover .note-actions {
    opacity: 1;
}

.icon-btn-danger {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 6px;
    border-radius: var(--radius-sm);
}
.icon-btn-danger:hover {
    background: rgba(239, 68, 68, 0.1);
    color: var(--color-danger);
}

/* Preview Panel */
.preview-panel {
    background: rgba(0,0,0,0.2);
    border: 1px solid var(--border-color);
    border-top: none;
    border-bottom-left-radius: var(--radius-xl);
    border-bottom-right-radius: var(--radius-xl);
    padding: var(--space-lg);
    margin-top: -2px;
    position: relative;
    z-index: 1;
}

.preview-loading {
    padding: var(--space-md);
}

.preview-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid rgba(255,255,255,0.05);
}

.toast-viewer {
    color: var(--text-main);
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-2xl) 0;
    color: var(--text-muted);
}
.empty-icon {
    margin-bottom: var(--space-md);
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
</style>
