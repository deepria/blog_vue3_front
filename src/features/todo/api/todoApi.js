import { apiClient, unwrapData } from "@/shared/api/http";
import { normalizeTodo } from "../lib/todoModel";

export { normalizeTodo } from "../lib/todoModel";

/**
 * Todo API Service
 * Encapsulates the DynamoDB calls specific to the Todo domain.
 */
export const todoApi = {
  async fetchTodos() {
    const response = await apiClient.get("/api/todos");
    return (unwrapData(response)?.items || []).map(normalizeTodo);
  },

  async saveTodos(todos) {
    const response = await apiClient.post("/api/todos", { items: todos || [] });
    return (unwrapData(response)?.items || []).map(normalizeTodo);
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
