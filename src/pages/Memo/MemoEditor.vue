<template>
  <div class="editor-page">
    <header class="editor-header">
      <div class="left-section">
        <button class="icon-btn-secondary" @click="goBack" title="Back">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <input
          v-model="title"
          placeholder="Untitled Memo"
          class="title-input-naked"
        />
      </div>
      <div class="right-section">
        <span v-if="saving" class="save-indicator">Saving...</span>
        <button class="icon-btn-primary" :class="{ 'loading': saving }" @click="save" title="Save" :disabled="saving">
           <svg v-if="!saving" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
           <span v-else class="spinner"></span>
        </button>
      </div>
    </header>

    <div class="editor-container">
        <div class="editor-wrapper" ref="editorRef"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';


import { useMemo } from "@/features/memo/composables/useMemo";

const props = defineProps({
  id: String,
});

const router = useRouter();
const { getNote, saveNote } = useMemo();

const editorRef = ref(null);
const editorInstance = ref(null);
const title = ref('');
const saving = ref(false);

const goBack = () => router.push('/memo');

const initEditor = (initialValue = '') => {
  if (editorInstance.value) {
      editorInstance.value.setMarkdown(initialValue);
      return;
  }
  
  editorInstance.value = new Editor({
    el: editorRef.value,
    height: '100%',
    initialEditType: 'wysiwyg',
    previewStyle: 'vertical',
    initialValue: initialValue,
    theme: 'dark',
    usageStatistics: false,
    toolbarItems: [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task'],
      ['table', 'image', 'link'],
      ['code', 'codeblock'],
    ],
  });
};

const loadContent = async () => {
  if (!props.id) {
    initEditor();
    return;
  }

  try {
    const note = await getNote(props.id);
    if (note) {
        title.value = note.title || '';
        initEditor(note.content || '');
    } else {
        message.warn("Memo not found");
        initEditor();
    }
  } catch {
    message.error("Failed to load content");
    initEditor();
  }
};

const save = async () => {
  if (!title.value.trim()) {
    message.warn("Please enter a title");
    return;
  }
  
  saving.value = true;
  try {
    const content = editorInstance.value.getMarkdown();
    const savedMemo = await saveNote({
      id: props.id,
      title: title.value,
      content,
    });

    if (!props.id && savedMemo?.id) {
       message.success("Memo created");
    } else {
       message.success("Saved");
    }
    router.push('/memo');
  } catch {
    message.error("Save failed");
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadContent();
});

onBeforeUnmount(() => {
  if (editorInstance.value) {
    editorInstance.value.destroy();
  }
});
</script>

<style scoped>
.editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-base);
}

.editor-header {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  background: var(--color-bg-surface);
  backdrop-filter: none;
  border-bottom: 1px solid var(--color-border);
  z-index: 10;
}

.left-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.title-input-naked {
  background: transparent;
  border: none;
  font-size: 20px;
  font-weight: 750;
  color: var(--color-text-primary);
  width: 100%;
  outline: none;
  font-family: inherit;
}
.title-input-naked::placeholder {
  color: var(--color-text-muted);
}

.right-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.save-indicator {
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
}

.editor-container {
  flex: 1;
  overflow: hidden;
  background-color: var(--color-bg-surface);
  padding: 18px;
}

.editor-wrapper {
  height: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* Toast UI Overrides for seamless integration */
:deep(.toastui-editor-defaultUI) {
    border: none !important;
    background-color: transparent !important;
}
:deep(.toastui-editor-toolbar) {
    background-color: var(--color-bg-panel) !important;
    border-bottom: 1px solid var(--color-border) !important;
}
:deep(.toastui-editor-md-container), :deep(.toastui-editor-ww-container) {
    background-color: var(--color-bg-surface) !important;
}

@media (max-width: 720px) {
  .editor-header {
    padding: 12px 16px;
  }

  .left-section {
    min-width: 0;
  }

  .title-input-naked {
    font-size: 16px;
  }

  .editor-container {
    padding: 10px;
  }
}
</style>
