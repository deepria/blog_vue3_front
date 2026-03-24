<template>
  <div class="editor-page">
    <header class="editor-header">
      <div class="left-section">
        <BaseButton variant="ghost" @click="goBack">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </BaseButton>
        <input
          v-model="title"
          placeholder="Untitled Memo"
          class="title-input-naked"
        />
      </div>
      <div class="right-section">
        <span v-if="saving" class="save-indicator">Saving...</span>
        <BaseButton variant="primary" :loading="saving" @click="save">
           Save
        </BaseButton>
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

import BaseButton from "@/components/ui/BaseButton.vue";
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
  } catch (error) {
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
    const noteToSave = {
        id: props.id,
        title: title.value,
        content: content
    };
    
    await saveNote(noteToSave);
    
    if (!props.id) {
       message.success("Memo created");
    } else {
       message.success("Saved");
    }
    router.push('/memo');
  } catch (error) {
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
  background-color: transparent;
}

.editor-header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-bottom: var(--glass-border);
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
  font-size: var(--font-size-title);
  font-weight: 600;
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
  background-color: var(--color-bg-base);
}

.editor-wrapper {
  height: 100%;
}

/* Toast UI Overrides for seamless integration */
:deep(.toastui-editor-defaultUI) {
    border: none !important;
    background-color: transparent !important;
}
:deep(.toastui-editor-toolbar) {
    background-color: var(--color-bg-surface) !important;
    border-bottom: 1px solid var(--color-border) !important;
}
:deep(.toastui-editor-md-container), :deep(.toastui-editor-ww-container) {
    background-color: var(--color-bg-base) !important;
}
</style>
