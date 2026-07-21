import { computed, ref } from "vue";
import { memoApi } from "../api/memoApi";
import { normalizeMemo, normalizeMemoTimestamp } from "../lib/memoModel";

export function useMemo() {
  const notes = ref([]);
  const loading = ref(false);
  const loadingPreview = ref(false);
  const error = ref("");
  const searchQuery = ref("");
  const sortMode = ref("recent");

  const loadNotes = async () => {
    loading.value = true;
    error.value = "";
    try {
      const items = await memoApi.fetchNotes();
      notes.value = items.map(normalizeMemo);
    } catch (e) {
      error.value = "메모를 불러오지 못했습니다.";
      console.error("Failed to load notes", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const filteredNotes = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    const filtered = query
      ? notes.value.filter((note) => (note.title || "").toLowerCase().includes(query))
      : notes.value;

    return [...filtered].sort((a, b) => {
      if (sortMode.value === "title") {
        return (a.title || "").localeCompare(b.title || "", "ko");
      }
      return normalizeMemoTimestamp(b.updatedAt) - normalizeMemoTimestamp(a.updatedAt);
    });
  });

  const getNote = async (id) => {
    loadingPreview.value = true;
    try {
      const data = await memoApi.loadNote(id);
      return normalizeMemo(data);
    } catch (e) {
      console.error("Failed to load note detail", e);
      throw e;
    } finally {
      loadingPreview.value = false;
    }
  };

  const saveNote = async (noteData) => {
    try {
      const saved = normalizeMemo(await memoApi.saveNote(noteData));
      const existingIndex = notes.value.findIndex((note) => note.id === saved.id);
      const summary = {
        id: saved.id,
        title: saved.title,
        updatedAt: saved.updatedAt,
        updated_at: saved.updated_at,
      };
      if (existingIndex >= 0) {
        notes.value.splice(existingIndex, 1, { ...notes.value[existingIndex], ...summary });
      } else if (saved.id) {
        notes.value.unshift(summary);
      }
      return saved;
    } catch (e) {
      console.error("Failed to save note", e);
      throw e;
    }
  };

  const deleteNote = async (id) => {
    try {
      await memoApi.deleteNote(id);
      notes.value = notes.value.filter((note) => note.id !== id);
    } catch (e) {
      console.error("Failed to delete note", e);
      throw e;
    }
  };

  return {
    notes,
    loading,
    loadingPreview,
    error,
    searchQuery,
    sortMode,
    filteredNotes,
    loadNotes,
    getNote,
    saveNote,
    deleteNote,
  };
}
