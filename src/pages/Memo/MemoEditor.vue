<template>
  <div class="editor-page">
    <header class="editor-header">
      <div class="left-section">
        <button class="icon-btn-secondary" @click="goBack" title="Back">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <input
          v-model="title"
          placeholder="Untitled Memo"
          class="title-input-naked"
          @input="markDirty"
        />
      </div>

      <div class="right-section">
        <span class="save-indicator" :class="saveStatusClass">{{ saveStatusLabel }}</span>

        <div class="font-size-control" aria-label="Editor font size">
          <button
            class="font-size-button"
            type="button"
            title="Decrease font size"
            :disabled="editorFontSize <= MIN_FONT_SIZE"
            @click="decreaseFontSize"
          >
            A-
          </button>
          <span class="font-size-value">{{ editorFontSize }}px</span>
          <button
            class="font-size-button"
            type="button"
            title="Increase font size"
            :disabled="editorFontSize >= MAX_FONT_SIZE"
            @click="increaseFontSize"
          >
            A+
          </button>
        </div>

        <button
          class="icon-btn-primary"
          :class="{ loading: saving }"
          :disabled="saving || loadingNote"
          title="Save"
          @click="save"
        >
          <svg v-if="!saving" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          <span v-else class="spinner"></span>
        </button>
      </div>
    </header>

    <div class="editor-container">
      <div class="editor-wrapper" :class="{ 'is-loading': loadingNote }">
        <div v-if="loadingNote" class="editor-loading">
          <BaseSkeleton height="22px" width="60%" />
          <BaseSkeleton height="18px" width="92%" />
          <BaseSkeleton height="18px" width="84%" />
        </div>
        <MemoMilkdownEditor
          v-else
          v-model="content"
          :editor-key="editorKey"
          :font-size="editorFontSize"
          @update:model-value="handleContentUpdate"
          @ready="handleEditorReady"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { App, message } from "ant-design-vue";
import BaseSkeleton from "@/shared/ui/BaseSkeleton.vue";
import MemoMilkdownEditor from "@/features/memo/components/MemoMilkdownEditor.vue";
import { useMemo } from "@/features/memo/composables/useMemo";

const props = defineProps({
  id: String,
});

const MIN_FONT_SIZE = 13;
const MAX_FONT_SIZE = 22;
const DEFAULT_FONT_SIZE = 16;
const FONT_SIZE_STORAGE_KEY = "memo-editor-font-size";

const router = useRouter();
const { modal } = App.useApp();
const { getNote, saveNote } = useMemo();

const title = ref("");
const content = ref("");
const savedSnapshot = ref({ title: "", content: "" });
const saving = ref(false);
const loadingNote = ref(false);
const loadError = ref(false);
const editorReady = ref(false);
const editorKey = ref(0);
const saveState = ref("saved");

const storedFontSize = Number(localStorage.getItem(FONT_SIZE_STORAGE_KEY));
const editorFontSize = ref(
  Number.isFinite(storedFontSize)
    ? Math.min(Math.max(storedFontSize, MIN_FONT_SIZE), MAX_FONT_SIZE)
    : DEFAULT_FONT_SIZE
);

const isDirty = computed(
  () => title.value !== savedSnapshot.value.title || content.value !== savedSnapshot.value.content
);

const saveStatusLabel = computed(() => {
  if (loadingNote.value) return "Loading...";
  if (saving.value) return "Saving...";
  if (saveState.value === "failed") return "Save failed";
  if (isDirty.value) return "Unsaved changes";
  return "Saved";
});

const saveStatusClass = computed(() => ({
  "is-saving": saving.value,
  "is-dirty": isDirty.value && !saving.value,
  "is-error": saveState.value === "failed",
}));

const persistFontSize = () => {
  localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(editorFontSize.value));
};

const increaseFontSize = () => {
  editorFontSize.value = Math.min(editorFontSize.value + 1, MAX_FONT_SIZE);
  persistFontSize();
};

const decreaseFontSize = () => {
  editorFontSize.value = Math.max(editorFontSize.value - 1, MIN_FONT_SIZE);
  persistFontSize();
};

const snapshotCurrent = () => {
  savedSnapshot.value = {
    title: title.value,
    content: content.value,
  };
  saveState.value = "saved";
};

const markDirty = () => {
  if (saveState.value !== "failed") saveState.value = "dirty";
};

const handleContentUpdate = (nextContent) => {
  content.value = nextContent;
  if (editorReady.value) markDirty();
};

const handleEditorReady = () => {
  editorReady.value = true;
};

const confirmLeave = () =>
  new Promise((resolve) => {
    modal.confirm({
      title: "Leave memo?",
      content: "You have unsaved changes. Leave without saving?",
      okText: "Leave",
      okType: "danger",
      cancelText: "Stay",
      centered: true,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });

const goBack = async () => {
  if (isDirty.value) {
    const shouldLeave = await confirmLeave();
    if (!shouldLeave) return;
  }
  router.push("/memo");
};

const loadContent = async () => {
  editorReady.value = false;
  loadError.value = false;

  if (!props.id) {
    title.value = "";
    content.value = "";
    snapshotCurrent();
    editorKey.value += 1;
    return;
  }

  loadingNote.value = true;
  try {
    const note = await getNote(props.id);
    if (note) {
      title.value = note.title || "";
      content.value = note.content || "";
      snapshotCurrent();
    } else {
      message.warn("Memo not found");
      title.value = "";
      content.value = "";
      snapshotCurrent();
    }
  } catch {
    loadError.value = true;
    saveState.value = "failed";
    message.error("Failed to load content");
  } finally {
    loadingNote.value = false;
    editorKey.value += 1;
  }
};

const save = async () => {
  const nextTitle = title.value.trim() || "Untitled Memo";

  saving.value = true;
  saveState.value = "saving";
  try {
    const savedMemo = await saveNote({
      id: props.id,
      title: nextTitle,
      content: content.value,
    });

    title.value = savedMemo?.title || nextTitle;
    content.value = savedMemo?.content ?? content.value;
    snapshotCurrent();

    if (!props.id && savedMemo?.id) {
      await router.replace(`/memo/edit/${savedMemo.id}`);
      message.success("Memo created");
    } else {
      message.success("Saved");
    }
  } catch {
    saveState.value = "failed";
    message.error("Save failed");
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadContent();
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
  gap: var(--space-4);
  padding: 0 var(--space-6);
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 10;
}

.left-section {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.title-input-naked {
  width: 100%;
  min-width: 0;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 20px;
  font-weight: 750;
  letter-spacing: 0;
  outline: none;
}

.title-input-naked::placeholder {
  color: var(--color-text-muted);
}

.right-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
}

.save-indicator {
  min-width: 112px;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
  text-align: right;
  white-space: nowrap;
}

.save-indicator.is-dirty {
  color: var(--color-warning);
}

.save-indicator.is-saving {
  color: var(--color-primary);
}

.save-indicator.is-error {
  color: var(--color-danger);
}

.font-size-control {
  display: inline-flex;
  align-items: center;
  height: 36px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-panel);
}

.font-size-button {
  width: 42px;
  height: 34px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
}

.font-size-button:hover:not(:disabled) {
  background: var(--color-bg-panel-strong);
  color: var(--color-text-primary);
}

.font-size-button:disabled {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.font-size-value {
  min-width: 44px;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
  text-align: center;
  white-space: nowrap;
}

.editor-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background-color: var(--color-bg-surface);
  padding: 18px;
}

.editor-wrapper {
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
}

.editor-wrapper.is-loading {
  padding: 28px 32px;
}

.editor-loading {
  display: grid;
  gap: 14px;
}

@media (max-width: 720px) {
  .editor-header {
    min-height: auto;
    align-items: stretch;
    flex-direction: column;
    padding: 12px 16px;
  }

  .left-section,
  .right-section {
    width: 100%;
  }

  .right-section {
    justify-content: space-between;
    gap: var(--space-2);
  }

  .title-input-naked {
    font-size: 16px;
  }

  .save-indicator {
    min-width: 0;
    text-align: left;
  }

  .font-size-control {
    height: 34px;
  }

  .font-size-button {
    width: 36px;
    height: 32px;
  }

  .font-size-value {
    min-width: 36px;
  }

  .editor-container {
    padding: 10px;
  }

  .editor-wrapper.is-loading {
    padding: 20px 16px;
  }
}
</style>
