import { nextTick, ref, watch } from "vue";

export function useMemoSelection({ filteredNotes, getNote, deleteNote, notify, confirm }) {
  const selectedId = ref("");
  const selectedNote = ref(null);
  const previewContent = ref("");
  const isMobileListOpen = ref(false);

  async function selectMemo(note) {
    isMobileListOpen.value = false;
    selectedId.value = note.id;
    selectedNote.value = note;
    previewContent.value = "";
    try {
      const fullNote = await getNote(note.id);
      if (selectedId.value !== note.id) return;
      selectedNote.value = fullNote;
      previewContent.value = fullNote?.content || "";
    } catch {
      notify.error("메모 내용을 불러오지 못했습니다.");
    }
  }

  async function selectFirstMemo() {
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
  }

  function confirmDelete(note) {
    confirm({
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
          notify.success("삭제했습니다.");
        } catch {
          notify.error("삭제하지 못했습니다.");
        }
      },
    });
  }

  watch(filteredNotes, selectFirstMemo);

  return {
    selectedId,
    selectedNote,
    previewContent,
    isMobileListOpen,
    selectMemo,
    selectFirstMemo,
    confirmDelete,
  };
}
