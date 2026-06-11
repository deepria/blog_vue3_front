<template>
  <PageShell
    class="memo-list-page"
    title="메모"
    eyebrow="Knowledge"
    :description="summaryText"
  >
    <template #actions>
      <button class="icon-button" type="button" title="새로고침" @click="handleRefresh">
        <ReloadOutlined />
      </button>
      <button class="primary-action" type="button" @click="createMemo">
        <PlusOutlined />
        <span>새 메모</span>
      </button>
    </template>

    <transition name="page-section" appear>
      <div v-if="contentVisible" class="memo-workbench">
        <section class="memo-toolbar" aria-label="메모 검색과 정렬">
          <BaseInput v-model="searchQuery" placeholder="제목으로 메모 검색" class="search-input">
            <template #suffix>
              <SearchOutlined />
            </template>
          </BaseInput>

          <div class="sort-control" aria-label="정렬">
            <button
              type="button"
              :class="{ active: sortMode === 'recent' }"
              @click="sortMode = 'recent'"
            >
              최근순
            </button>
            <button
              type="button"
              :class="{ active: sortMode === 'title' }"
              @click="sortMode = 'title'"
            >
              제목순
            </button>
          </div>
        </section>

        <div v-if="error && !loading" class="state-panel">
          <ExclamationCircleOutlined />
          <strong>{{ error }}</strong>
          <BaseButton variant="ghost" size="sm" @click="handleRefresh">다시 시도</BaseButton>
        </div>

        <section v-else class="memo-layout">
          <aside class="memo-list-panel" aria-label="메모 목록">
            <div class="panel-meta">
              <span>{{ filteredNotes.length }}개 메모</span>
              <span v-if="searchQuery">검색 중</span>
            </div>

            <div v-if="loading" class="memo-list">
              <BaseSkeleton v-for="i in 6" :key="i" height="84px" shape="rect" />
            </div>

            <div v-else-if="filteredNotes.length === 0" class="state-panel compact">
              <FileTextOutlined />
              <strong>{{ emptyTitle }}</strong>
              <p>{{ emptyDescription }}</p>
              <BaseButton v-if="searchQuery" variant="ghost" size="sm" @click="searchQuery = ''">
                검색 지우기
              </BaseButton>
              <BaseButton v-else size="sm" @click="createMemo">첫 메모 쓰기</BaseButton>
            </div>

            <div v-else class="memo-list">
              <button
                v-for="note in filteredNotes"
                :key="note.id"
                type="button"
                class="memo-row"
                :class="{ selected: selectedId === note.id }"
                @click="selectMemo(note)"
              >
                <span class="memo-row-icon"><FileTextOutlined /></span>
                <span class="memo-row-copy">
                  <strong>{{ note.title || "제목 없는 메모" }}</strong>
                  <small>{{ formatDate(note.updatedAt || note.updated_at) }}</small>
                </span>
                <DeleteOutlined class="delete-icon" title="삭제" @click.stop="confirmDelete(note)" />
              </button>
            </div>
          </aside>

          <article class="preview-panel" aria-label="선택한 메모 미리보기">
            <div v-if="!selectedId && !loading" class="state-panel preview-empty">
              <FileSearchOutlined />
              <strong>메모를 선택하세요</strong>
              <p>목록에서 메모를 선택하면 이곳에서 내용을 확인하고 바로 편집할 수 있습니다.</p>
            </div>

            <div v-else-if="loadingPreview" class="preview-loading">
              <BaseSkeleton height="28px" width="62%" />
              <BaseSkeleton height="18px" width="86%" />
              <BaseSkeleton height="18px" width="74%" />
            </div>

            <template v-else-if="selectedNote">
              <header class="preview-header">
                <div>
                  <p>{{ formatDate(selectedNote.updatedAt || selectedNote.updated_at) }}</p>
                  <h2>{{ selectedNote.title || "제목 없는 메모" }}</h2>
                </div>
                <BaseButton size="sm" @click="editMemo(selectedNote.id)">편집</BaseButton>
              </header>

              <div class="preview-body">
                <MarkdownViewer :content="previewContent || '아직 내용이 없습니다.'" />
              </div>
            </template>
          </article>
        </section>
      </div>
    </transition>
  </PageShell>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { App, message } from "ant-design-vue";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons-vue";
import { useMemo } from "@/features/memo/composables/useMemo";
import BaseButton from "@/shared/ui/BaseButton.vue";
import BaseInput from "@/shared/ui/BaseInput.vue";
import BaseSkeleton from "@/shared/ui/BaseSkeleton.vue";
import MarkdownViewer from "@/components/ui/MarkdownViewer.vue";
import PageShell from "@/shared/ui/PageShell.vue";

const router = useRouter();
const { modal } = App.useApp();

const {
  notes,
  loading,
  loadingPreview,
  error,
  searchQuery,
  sortMode,
  filteredNotes,
  loadNotes,
  getNote,
  deleteNote,
} = useMemo();

const selectedId = ref("");
const selectedNote = ref(null);
const previewContent = ref("");
const contentVisible = ref(false);

const summaryText = computed(() => {
  if (loading.value) return "메모를 불러오는 중입니다.";
  if (!notes.value.length) return "생각을 붙잡고 다시 이어 쓰는 개인 지식 책상입니다.";
  return `총 ${notes.value.length}개의 메모가 있습니다.`;
});

const emptyTitle = computed(() => (searchQuery.value ? "검색 결과가 없습니다" : "아직 메모가 없습니다"));
const emptyDescription = computed(() =>
  searchQuery.value
    ? "검색어를 바꾸거나 지운 뒤 다시 확인해보세요."
    : "짧은 아이디어부터 긴 초안까지 이곳에 모아둘 수 있습니다."
);

const formatDate = (value) => {
  if (!value) return "날짜 없음";
  const text = String(value);
  const date = /^\d+$/.test(text) ? new Date(Number(text) * 1000) : new Date(text);
  if (!Number.isFinite(date.getTime())) return "날짜 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const createMemo = () => router.push("/memo/edit");
const editMemo = (id) => router.push(`/memo/edit/${id}`);

const selectMemo = async (note) => {
  selectedId.value = note.id;
  selectedNote.value = note;
  previewContent.value = "";
  try {
    const fullNote = await getNote(note.id);
    if (selectedId.value !== note.id) return;
    selectedNote.value = fullNote;
    previewContent.value = fullNote?.content || "";
  } catch {
    message.error("메모 내용을 불러오지 못했습니다.");
  }
};

const selectFirstMemo = async () => {
  await nextTick();
  const first = filteredNotes.value[0];
  if (!first) {
    selectedId.value = "";
    selectedNote.value = null;
    previewContent.value = "";
    return;
  }
  if (!selectedId.value || !filteredNotes.value.some((note) => note.id === selectedId.value)) {
    await selectMemo(first);
  }
};

const handleRefresh = async () => {
  try {
    await loadNotes();
    await selectFirstMemo();
    message.success("새로고침 완료");
  } catch {
    message.error("새로고침 실패");
  }
};

const confirmDelete = (note) => {
  modal.confirm({
    title: "메모 삭제",
    content: `"${note.title || "제목 없는 메모"}" 메모를 삭제할까요?`,
    okText: "삭제",
    okType: "danger",
    cancelText: "취소",
    centered: true,
    onOk: async () => {
      try {
        await deleteNote(note.id);
        if (selectedId.value === note.id) {
          selectedId.value = "";
          selectedNote.value = null;
          previewContent.value = "";
          await selectFirstMemo();
        }
        message.success("삭제했습니다.");
      } catch {
        message.error("삭제하지 못했습니다.");
      }
    },
  });
};

watch([filteredNotes, searchQuery], () => {
  selectFirstMemo();
});

onMounted(async () => {
  try {
    await loadNotes();
    await selectFirstMemo();
  } catch {
    // error state is rendered by the page.
  } finally {
    requestAnimationFrame(() => {
      contentVisible.value = true;
    });
  }
});
</script>

<style scoped>
.memo-workbench {
  display: grid;
  gap: 16px;
}

.memo-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.search-input {
  max-width: 620px;
}

.sort-control {
  display: inline-flex;
  height: 40px;
  padding: 3px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-panel);
}

.sort-control button {
  min-width: 72px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.sort-control button.active {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}

.memo-layout {
  display: grid;
  grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
  min-height: 560px;
}

.memo-list-panel,
.preview-panel {
  min-width: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
}

.memo-list-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
  font-weight: 700;
}

.memo-list {
  display: grid;
  gap: 8px;
  overflow: auto;
  padding: 10px;
}

.memo-row {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 28px;
  gap: 10px;
  align-items: center;
  min-height: 72px;
  width: 100%;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.memo-row:hover,
.memo-row.selected {
  border-color: var(--color-border);
  background: var(--color-bg-panel);
}

.memo-row-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.memo-row-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.memo-row-copy strong {
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.memo-row-copy small {
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}

.delete-icon {
  color: var(--color-text-muted);
  opacity: 0.72;
  transition: color 0.18s ease, opacity 0.18s ease;
}

.delete-icon:hover {
  color: var(--color-danger);
  opacity: 1;
}

.preview-panel {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  padding: 24px 28px 18px;
  border-bottom: 1px solid var(--color-border);
}

.preview-header p {
  margin: 0 0 8px;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
  font-weight: 700;
}

.preview-header h2 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 22px;
  line-height: 1.25;
  letter-spacing: 0;
}

.preview-body {
  flex: 1;
  overflow: auto;
  padding: 24px 28px 36px;
  color: var(--color-text-primary);
  line-height: 1.7;
}

.preview-loading {
  display: grid;
  gap: 14px;
  padding: 28px;
}

.state-panel {
  display: grid;
  place-items: center;
  gap: 12px;
  min-height: 220px;
  padding: 28px;
  color: var(--color-text-muted);
  text-align: center;
}

.state-panel :deep(svg),
.state-panel > span[role="img"] {
  color: var(--color-primary);
  font-size: 30px;
}

.state-panel strong {
  color: var(--color-text-primary);
  font-size: 16px;
}

.state-panel p {
  max-width: 360px;
  margin: 0;
}

.state-panel.compact,
.preview-empty {
  min-height: 100%;
}

.icon-button,
.primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font: inherit;
  font-weight: 750;
  cursor: pointer;
}

.icon-button {
  width: 40px;
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
}

.primary-action {
  gap: 8px;
  padding: 0 14px;
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.page-section-enter-active,
.page-section-appear-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.page-section-enter-from,
.page-section-appear-from {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 900px) {
  .memo-toolbar,
  .memo-layout {
    grid-template-columns: 1fr;
  }

  .memo-layout {
    min-height: auto;
  }

  .memo-list {
    max-height: 420px;
  }
}

@media (max-width: 620px) {
  .memo-toolbar {
    gap: 10px;
  }

  .sort-control {
    width: 100%;
  }

  .sort-control button {
    flex: 1;
  }

  .preview-header {
    align-items: stretch;
    flex-direction: column;
    padding: 20px;
  }

  .preview-body {
    padding: 20px;
  }
}
</style>
