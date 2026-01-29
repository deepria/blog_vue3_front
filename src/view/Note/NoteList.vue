<template>
  <div class="main-container">
    <!-- Empty State -->
    <div v-if="!loading && notes.length === 0" class="empty-state">
      <p>작성된 노트가 없습니다.</p>
    </div>

    <!-- Note Grid -->
    <div class="file-grid">
      <div 
        v-for="note in notes" 
        :key="note.id" 
        class="file-item-wrapper"
      >
        <div class="file-item" @click="togglePreview(note)">
            <span class="file-name">
            {{ note.title || 'Untitled' }}
            </span>
            
            <div class="button-group">
                <!-- Toggle Icon (Optional, user just said select item) -->
                <!-- Delete -->
                <button class="button-primary" @click.stop="confirmDelete(note)">
                    <delete-outlined />
                </button>
            </div>
        </div>
        
        <!-- Preview Section -->
        <div v-if="expandedId === note.id" class="preview-section" @click.stop>
            <div v-if="loadingPreview" class="preview-loading">
                Loading...
            </div>
            <div v-else class="preview-content">
                <!-- Viewer Target -->
                <div :id="'viewer-' + note.id"></div>
            </div>
            <div class="preview-actions">
                <button class="button-primary" @click="editNote(note.id)">
                    <edit-outlined style="margin-right: 6px"/> 편집하기
                </button>
            </div>
        </div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <div class="button-container">
      <button class="refresh-button" @click="loadNotes">
        <reload-outlined />
      </button>
      <button class="add-button" @click="createNote">
        <plus-outlined />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import { fetchNotes, deleteNote, loadNote } from '@/services/noteService';
import "@/assets/styles/layout.css";
import "@/assets/styles/s3.css";

const router = useRouter();
const notes = ref([]);
const loading = ref(true);
const expandedId = ref(null);
const loadingPreview = ref(false);
let viewerInstance = null;

const loadNotes = async () => {
  loading.value = true;
  expandedId.value = null;
  loadingPreview.value = false;
  if (viewerInstance) {
      viewerInstance.destroy();
      viewerInstance = null;
  }
  try {
    notes.value = await fetchNotes();
  } catch (error) {
    message.error("Failed to load notes.");
  } finally {
    loading.value = false;
  }
};

const createNote = () => {
  router.push('/notes/edit');
};

const editNote = (id) => {
  router.push(`/notes/edit/${id}`);
};

const togglePreview = async (note) => {
  // Collapse if same
  if (expandedId.value === note.id) {
    expandedId.value = null;
    if (viewerInstance) {
        viewerInstance.destroy();
        viewerInstance = null;
    }
    return;
  }

  // Expand new
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
  } catch (error) {
    console.error(error);
    message.error("Failed to load preview");
    loadingPreview.value = false;
  }
};

const confirmDelete = (note) => {
  Modal.confirm({
    title: '노트 삭제',
    content: `"${note.title}" 노트를 삭제하시겠습니까?`,
    okText: '삭제',
    okType: 'danger',
    cancelText: '취소',
    onOk: async () => {
      try {
        await deleteNote(note.id);
        message.success('노트가 삭제되었습니다.');
        // If deleted node was expanded, clear it
        if (expandedId.value === note.id) {
            expandedId.value = null;
            if (viewerInstance) {
                viewerInstance.destroy();
                viewerInstance = null;
            }
        }
        await loadNotes();
      } catch (error) {
        message.error('삭제 실패');
      }
    },
  });
};

onMounted(() => {
  loadNotes();
});
</script>

<style scoped>
.empty-state {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-color);
  font-size: 1.2rem;
  opacity: 0.5;
}

.file-item-wrapper {
    width: 100%;
    margin-bottom: 0; /* Items are tight, but grid handles gap */
    display: flex;
    flex-direction: column;
}

/* Override s3.css specific grid for this view since we want full width items for preview? 
   Actually current s3.css .file-grid uses flex-direction column. 
   So items are already full width (stacked). This is good for preview expansion.
   Just need to ensure wrapper behaves like item.
*/

.file-item {
    cursor: pointer;
    /* Reuse styles from s3.css .file-item but ensure it applies to this structure */
}

.preview-section {
    width: 100%;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-top: none;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    padding: 20px;
    margin-top: -12px; /* Pull up to connect with card */
    margin-bottom: 20px;
    position: relative;
    z-index: 0; /* Behind the card? No, card should be on top visually or connected. */
    animation: fadeIn 0.3s ease;
}

/* Adjust file-item to loose bottom radius when expanded */
/* Since it's hard to target parent state in CSS easily without complex selectors, 
   we can just leave it as is, or add a class if expanded.
*/

.preview-loading {
    color: #888;
    text-align: center;
    padding: 20px;
}

.preview-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 15px;
}

.button-primary span {
  display: flex;
  align-items: center;
}
</style>
