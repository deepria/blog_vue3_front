<template>
  <div class="editor-page">
    <header class="editor-header">
      <div class="title-zone">
        <button class="icon-button" type="button" title="목록으로" @click="goBack">
          <ArrowLeftOutlined />
        </button>
        <div class="title-stack">
          <input
            v-model="title"
            placeholder="제목 없는 메모"
            class="title-input"
            :disabled="loadingNote"
            @input="markDirty"
          />
          <span class="editor-meta">{{ editorMeta }}</span>
        </div>
      </div>

      <div class="toolbar-zone">
        <span class="save-indicator" :class="saveStatusClass">{{ saveStatusLabel }}</span>
        <button
          class="primary-icon-button"
          type="button"
          title="저장"
          :disabled="saving || loadingNote || !canSave"
          @click="saveNow"
        >
          <LoadingOutlined v-if="saving" />
          <SaveOutlined v-else />
        </button>
      </div>
    </header>

    <main class="editor-main">
      <section v-if="loadError" class="editor-state">
        <ExclamationCircleOutlined />
        <strong>메모를 불러오지 못했습니다.</strong>
        <BaseButton size="sm" @click="loadContent">다시 시도</BaseButton>
      </section>

      <section v-else class="editor-split" :class="{ loading: loadingNote }">
        <div class="editor-surface">
          <div v-if="loadingNote" class="editor-loading">
            <BaseSkeleton height="26px" width="52%" />
            <BaseSkeleton height="18px" width="92%" />
            <BaseSkeleton height="18px" width="84%" />
          </div>
          <textarea
            v-else
            v-model="content"
            class="markdown-editor"
            placeholder="여기에 메모를 작성하세요. Markdown을 그대로 사용할 수 있습니다."
            @input="handleContentUpdate(content)"
          ></textarea>
        </div>

        <aside class="reader-preview" aria-label="읽기 모드 미리보기">
          <header class="reader-preview-header">
            <span>읽기 모드</span>
            <small>{{ previewTitle }}</small>
          </header>
          <div class="reader-preview-body">
            <MarkdownViewer :content="content.trim() || '아직 내용이 없습니다.'" />
          </div>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import { App, message } from "ant-design-vue";
import {
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  SaveOutlined,
} from "@ant-design/icons-vue";
import BaseButton from "@/shared/ui/BaseButton.vue";
import BaseSkeleton from "@/shared/ui/BaseSkeleton.vue";
import MarkdownViewer from "@/components/ui/MarkdownViewer.vue";
import { useMemo } from "@/features/memo/composables/useMemo";

const props = defineProps({
  id: String,
});

const AUTO_SAVE_DELAY = 1200;

const router = useRouter();
const { modal } = App.useApp();
const { getNote, saveNote } = useMemo();

const title = ref("");
const content = ref("");
const currentId = ref(props.id || "");
const savedSnapshot = ref({ title: "", content: "" });
const saving = ref(false);
const loadingNote = ref(false);
const loadError = ref(false);
const editorReady = ref(false);
const saveState = ref("saved");
const lastSavedAt = ref("");
const autoSaveTimer = ref(null);

const isDirty = computed(
  () => title.value !== savedSnapshot.value.title || content.value !== savedSnapshot.value.content
);

const canSave = computed(() => Boolean(title.value.trim() || content.value.trim()));

const editorMeta = computed(() => {
  const text = content.value.replace(/[#*_>`\-[\]()]/g, " ").trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  if (lastSavedAt.value) return `${wordCount} words · 마지막 저장 ${lastSavedAt.value}`;
  return `${wordCount} words`;
});

const previewTitle = computed(() => title.value.trim() || "제목 없는 메모");

const saveStatusLabel = computed(() => {
  if (loadingNote.value) return "불러오는 중";
  if (saving.value) return "저장 중";
  if (saveState.value === "failed") return "저장 실패";
  if (isDirty.value) return "자동저장 대기";
  return "저장됨";
});

const saveStatusClass = computed(() => ({
  saving: saving.value,
  dirty: isDirty.value && !saving.value,
  error: saveState.value === "failed",
}));

const formatTime = (value) =>
  new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);

const parseMemoDate = (value) => {
  if (!value) return null;
  const text = String(value);
  const date = /^\d+$/.test(text) ? new Date(Number(text) * 1000) : new Date(text);
  return Number.isFinite(date.getTime()) ? date : null;
};

const clearAutoSaveTimer = () => {
  if (!autoSaveTimer.value) return;
  clearTimeout(autoSaveTimer.value);
  autoSaveTimer.value = null;
};

const snapshotCurrent = () => {
  savedSnapshot.value = {
    title: title.value,
    content: content.value,
  };
  saveState.value = "saved";
};

const markDirty = () => {
  if (!editorReady.value && !currentId.value) return;
  if (saveState.value !== "failed") saveState.value = "dirty";
};

const scheduleAutoSave = () => {
  clearAutoSaveTimer();
  if (!editorReady.value || loadingNote.value || saving.value || !isDirty.value || !canSave.value) return;
  autoSaveTimer.value = setTimeout(() => {
    saveNow({ silent: true });
  }, AUTO_SAVE_DELAY);
};

const handleContentUpdate = (nextContent) => {
  content.value = nextContent;
  if (editorReady.value) markDirty();
};

const loadContent = async () => {
  clearAutoSaveTimer();
  editorReady.value = false;
  loadError.value = false;
  currentId.value = props.id || "";

  if (!currentId.value) {
    title.value = "";
    content.value = "";
    lastSavedAt.value = "";
    snapshotCurrent();
    editorReady.value = true;
    return;
  }

  loadingNote.value = true;
  try {
    const note = await getNote(currentId.value);
    title.value = note?.title || "";
    content.value = note?.content || "";
    const updatedAt = parseMemoDate(note?.updatedAt);
    lastSavedAt.value = updatedAt ? formatTime(updatedAt) : "";
    snapshotCurrent();
  } catch {
    loadError.value = true;
    saveState.value = "failed";
  } finally {
    loadingNote.value = false;
    editorReady.value = true;
  }
};

const saveNow = async ({ silent = false } = {}) => {
  clearAutoSaveTimer();
  if (saving.value || loadingNote.value || !canSave.value) return null;

  const nextTitle = title.value.trim() || "제목 없는 메모";
  saving.value = true;
  saveState.value = "saving";
  try {
    const savedMemo = await saveNote({
      id: currentId.value,
      title: nextTitle,
      content: content.value,
    });

    currentId.value = savedMemo?.id || currentId.value;
    title.value = savedMemo?.title || nextTitle;
    content.value = savedMemo?.content ?? content.value;
    lastSavedAt.value = formatTime(new Date());
    snapshotCurrent();

    if (!props.id && currentId.value) {
      await router.replace(`/memo/edit/${currentId.value}`);
    }
    if (!silent) message.success("저장했습니다.");
    return savedMemo;
  } catch {
    saveState.value = "failed";
    if (!silent) message.error("저장하지 못했습니다.");
    return null;
  } finally {
    saving.value = false;
  }
};

const confirmLeave = () =>
  new Promise((resolve) => {
    modal.confirm({
      title: "메모를 나갈까요?",
      content: "아직 저장되지 않은 변경사항이 있습니다.",
      okText: "나가기",
      okType: "danger",
      cancelText: "계속 쓰기",
      centered: true,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });

const goBack = async () => {
  if (isDirty.value && canSave.value) {
    await saveNow({ silent: true });
  }
  if (isDirty.value) {
    const shouldLeave = await confirmLeave();
    if (!shouldLeave) return;
  }
  router.push("/memo");
};

watch([title, content], scheduleAutoSave);

watch(
  () => props.id,
  (nextId, previousId) => {
    if (nextId !== previousId) loadContent();
  }
);

onBeforeRouteLeave(async () => {
  if (isDirty.value && canSave.value) {
    await saveNow({ silent: true });
  }
  if (!isDirty.value) return true;
  return await confirmLeave();
});

onMounted(() => {
  loadContent();
});

onBeforeUnmount(() => {
  clearAutoSaveTimer();
});
</script>

<style scoped>
.editor-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-base);
}

.editor-header {
  min-height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.title-zone {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.title-stack {
  min-width: 0;
  display: grid;
  gap: 4px;
  flex: 1;
}

.title-input {
  min-width: 0;
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  font-size: 21px;
  font-weight: 780;
  letter-spacing: 0;
  line-height: 1.2;
  outline: 0;
}

.title-input::placeholder,
.editor-meta {
  color: var(--color-text-muted);
}

.editor-meta {
  font-size: var(--font-size-caption);
}

.toolbar-zone {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.save-indicator {
  min-width: 88px;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
}

.save-indicator.dirty {
  color: var(--color-warning);
}

.save-indicator.saving {
  color: var(--color-primary);
}

.save-indicator.error {
  color: var(--color-danger);
}

.icon-button,
.primary-icon-button {
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font: inherit;
  cursor: pointer;
}

.icon-button {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
}

.primary-icon-button {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.primary-icon-button:disabled {
  opacity: 0.54;
  cursor: not-allowed;
}

.editor-main {
  flex: 1;
  min-height: 0;
  padding: 18px;
}

.editor-split,
.editor-state {
  width: min(100%, 1280px);
  min-height: calc(100vh - 112px);
  margin: 0 auto;
}

.editor-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 42%);
  gap: 14px;
}

.editor-surface,
.reader-preview {
  min-width: 0;
  min-height: calc(100vh - 112px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.editor-split.loading .editor-surface {
  padding: 28px;
}

.editor-loading {
  display: grid;
  gap: 14px;
}

.markdown-editor {
  width: 100%;
  min-height: calc(100vh - 114px);
  height: 100%;
  resize: none;
  border: 0;
  outline: 0;
  padding: 30px 34px 96px;
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  font-size: 16px;
  line-height: 1.72;
}

.markdown-editor::placeholder {
  color: var(--color-text-muted);
}

.reader-preview {
  display: flex;
  flex-direction: column;
}

.reader-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 54px;
  padding: 0 18px;
  border-bottom: 1px solid var(--color-border);
}

.reader-preview-header span {
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 800;
}

.reader-preview-header small {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reader-preview-body {
  flex: 1;
  overflow: auto;
  padding: 28px 30px 96px;
  color: var(--color-text-primary);
  line-height: 1.72;
}

.editor-state {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 14px;
  min-height: 420px;
  padding: 32px;
  color: var(--color-text-muted);
  text-align: center;
}

.editor-state > span[role="img"] {
  color: var(--color-danger);
  font-size: 32px;
}

.editor-state strong {
  color: var(--color-text-primary);
}

@media (max-width: 760px) {
  .editor-header {
    align-items: stretch;
    flex-direction: column;
    padding: 12px 16px;
  }

  .title-zone,
  .toolbar-zone {
    width: 100%;
  }

  .toolbar-zone {
    justify-content: space-between;
  }

  .title-input {
    font-size: 17px;
  }

  .save-indicator {
    min-width: 0;
    text-align: left;
  }

  .editor-main {
    padding: 10px;
  }

  .editor-surface,
  .reader-preview,
  .editor-state {
    min-height: calc(100vh - 156px);
  }

  .markdown-editor {
    min-height: calc(100vh - 158px);
    padding: 22px 18px 88px;
  }
}

@media (max-width: 980px) {
  .editor-split {
    grid-template-columns: 1fr;
  }

  .editor-surface,
  .reader-preview {
    min-height: 520px;
  }

  .reader-preview {
    min-height: 420px;
  }
}
</style>
