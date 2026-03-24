import { ref, computed } from 'vue';
import { fetchNotes, loadNote, saveNote as apiSaveNote, deleteNote as apiDeleteNote } from '../api/memoApi';

export function useMemo() {
  const notes = ref([]);
  const loading = ref(false);
  const loadingPreview = ref(false);
  const searchQuery = ref("");

  // Fetches the list of notes (metadata only typically, based on API)
  const loadNotes = async () => {
    loading.value = true;
    try {
      const raw = await fetchNotes();
      notes.value = raw || [];
    } catch (e) {
      console.error("Failed to load notes", e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Filter notes based on the search query
  const filteredNotes = computed(() => {
    if (!searchQuery.value.trim()) return notes.value;
    const query = searchQuery.value.toLowerCase();
    return notes.value.filter(note => 
      (note.title && note.title.toLowerCase().includes(query))
    );
  });

  // Get a single full note for preview or editing
  const getNote = async (id) => {
    loadingPreview.value = true;
    try {
      const data = await loadNote(id);
      return data;
    } catch (e) {
      console.error("Failed to load note detail", e);
      throw e;
    } finally {
      loadingPreview.value = false;
    }
  };

  // Save changes to a note (create or update)
  const saveNote = async (noteData) => {
    try {
      const id = await apiSaveNote(noteData);
      return id;
    } catch (e) {
      console.error("Failed to save note", e);
      throw e;
    }
  };

  // Delete a note
  const deleteNote = async (id) => {
    try {
      await apiDeleteNote(id);
      // Remove from local state to avoid refetching if desired
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
