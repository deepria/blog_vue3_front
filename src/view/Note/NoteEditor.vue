<template>
  <div class="editor-page">
    <div class="editor-header">
      <div class="left-section">
        <button class="icon-btn" @click="goBack">
          <arrow-left-outlined />
        </button>
        <input
          v-model="title"
          placeholder="제목 없는 노트"
          class="title-input"
        />
      </div>
      <div class="right-section">
        <span v-if="saving" class="save-status">저장 중...</span>
        <button class="button-primary save-btn" @click="save" :disabled="saving">
          <save-outlined style="margin-right: 6px;" /> 저장
        </button>
      </div>
    </div>

    <div class="editor-wrapper" ref="editorRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons-vue';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
import { loadNote, saveNote } from '@/services/noteService';
import "@/assets/styles/layout.css";

const props = defineProps({
  id: String,
});

const router = useRouter();
const editorRef = ref(null);
const editorInstance = ref(null);
const title = ref('');
const saving = ref(false);

const goBack = () => {
  router.push('/notes');
};

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
    theme: 'dark', // Enable dark theme
    usageStatistics: false,
    toolbarItems: [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task', 'indent', 'outdent'],
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
    const note = await loadNote(props.id);
    if (note) {
        title.value = note.title || '';
        initEditor(note.content || '');
    } else {
        message.warn("노트를 찾을 수 없습니다.");
        initEditor();
    }
  } catch (error) {
    message.error("노트 내용을 불러오지 못했습니다.");
    initEditor();
  }
};

const save = async () => {
  if (!title.value.trim()) {
    message.warn("제목을 입력해주세요.");
    return;
  }
  
  saving.value = true;
  try {
    const content = editorInstance.value.getMarkdown();
    const noteToSave = {
        id: props.id, // undefined if new
        title: title.value,
        content: content
    };
    
    // saveNote returns the ID (new or existing)
    const savedId = await saveNote(noteToSave);
    
    if (!props.id) {
       message.success("노트가 생성되었습니다.");
       // Redirect to edit page with new ID
       router.replace(`/notes/edit/${savedId}`);
    } else {
       message.success("저장되었습니다.");
    }
  } catch (error) {
    message.error("저장 실패");
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
  background-color: var(--background-dark, #fff);
  position: relative; 
  z-index: 100; /* Ensure it sits on top if needed */
}

.editor-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.left-section {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12px;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-color, #333);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.title-input {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color, #333);
  width: 100%;
  outline: none;
}

.title-input::placeholder {
  color: rgba(150, 150, 150, 0.5);
}

.right-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-status {
  font-size: 0.85rem;
  color: #888;
}

.save-btn {
  width: auto !important;
  padding: 0 20px !important;
  font-weight: 600;
}

.editor-wrapper {
  flex: 1;
  overflow: hidden;
  background-color: #fff;
}
</style>
