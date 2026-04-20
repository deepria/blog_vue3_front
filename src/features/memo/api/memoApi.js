import { apiClient, unwrapData } from "@/shared/api/http";

export const fetchNotes = async () => {
  const response = await apiClient.get("/api/memos");
  return unwrapData(response)?.items || [];
};

export const loadNote = async (id) => {
  const response = await apiClient.get(`/api/memos/${id}`);
  return unwrapData(response);
};

export const saveNote = async (note) => {
  const payload = {
    title: note.title,
    content: note.content,
  };
  const response = note.id
    ? await apiClient.put(`/api/memos/${note.id}`, payload)
    : await apiClient.post("/api/memos", payload);
  return unwrapData(response);
};

export const deleteNote = async (id) => {
  const response = await apiClient.delete(`/api/memos/${id}`);
  return unwrapData(response);
};
