import { ref, computed } from "vue";
import { memoApi } from "../api/memoApi";

export function useMemo() {
  const notes = ref([]);
  const loading = ref(false);
  const loadingPreview = ref(false);
  const searchQuery = ref("");

  const loadNotes = async () => {
    loading.value = true;
    try {
      notes.value = await memoApi.fetchNotes();
    } catch (e) {
      console.error("Failed to load notes", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const filteredNotes = computed(() => {
    if (!searchQuery.value.trim()) return notes.value;
    const query = searchQuery.value.toLowerCase();
    return notes.value.filter((note) => note.title && note.title.toLowerCase().includes(query));
  });

  const getNote = async (id) => {
    loadingPreview.value = true;
    try {
      const data = await memoApi.loadNote(id);
      return data;
    } catch (e) {
      console.error("Failed to load note detail", e);
      throw e;
    } finally {
      loadingPreview.value = false;
    }
  };

  const saveNote = async (noteData) => {
    try {
      return await memoApi.saveNote(noteData);
    } catch (e) {
      console.error("Failed to save note", e);
      throw e;
    }
  };

  const deleteNote = async (id) => {
    try {
      await memoApi.deleteNote(id);
      notes.value = notes.value.filter(n => n.id !== id);
    } catch (e) {
      console.error("Failed to delete note", e);
      throw e;
    }
  };

  return {
    notes,
    loading,
    loadingPreview,
    searchQuery,
    filteredNotes,
    loadNotes,
    getNote,
    saveNote,
    deleteNote
  };
}
