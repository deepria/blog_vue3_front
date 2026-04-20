import { apiClient, unwrapData } from "@/shared/api/http";

/**
 * Todo API Service
 * Encapsulates the DynamoDB calls specific to the Todo domain.
 */
export const todoApi = {
  async fetchTodos() {
    const response = await apiClient.get("/api/todos");
    return unwrapData(response)?.items || [];
  },

  async saveTodos(todos) {
    const response = await apiClient.post("/api/todos", { items: todos || [] });
    return unwrapData(response)?.items || [];
  },

  async fetchMeta() {
    const response = await apiClient.get("/api/todo-meta");
    return unwrapData(response);
  },

  async saveMeta(meta) {
    const response = await apiClient.put("/api/todo-meta", {
      ...meta,
      updated_at: Date.now(),
    });
    return unwrapData(response);
  },
};
