import { apiClient, unwrapData } from "@/shared/api/http";

export const memoApi = {
  async fetchNotes() {
    const response = await apiClient.get("/api/memos");
    return unwrapData(response)?.items || [];
  },

  async loadNote(id) {
    const response = await apiClient.get(`/api/memos/${id}`);
    return unwrapData(response);
  },

  async saveNote(note) {
    const payload = {
      title: note.title,
      content: note.content,
    };
    const response = note.id
      ? await apiClient.put(`/api/memos/${note.id}`, payload)
      : await apiClient.post("/api/memos", payload);
    return unwrapData(response);
  },

  async deleteNote(id) {
    const response = await apiClient.delete(`/api/memos/${id}`);
    return unwrapData(response);
  }
};
