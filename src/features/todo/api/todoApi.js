import { getData, postData } from "@/services/dynamoService.js";

/**
 * Todo API Service
 * Encapsulates the DynamoDB calls specific to the Todo domain.
 */
export const todoApi = {
  /**
   * Fetch the list of todos
   */
  async fetchTodos() {
    const raw = await getData("todo", "todo");
    return raw || [];
  },

  /**
   * Save the modified list of todos
   * @param {Array} todos 
   */
  async saveTodos(todos) {
    if (!todos) return;
    await postData("todo", "todo", "todo", JSON.stringify(todos));
  },

  /**
   * Fetch Todo metadata (Groups & Priorities)
   */
  async fetchMeta() {
    const raw = await getData("todo", "meta");
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  },

  /**
   * Save Todo metadata (Groups & Priorities)
   * @param {Object} meta 
   */
  async saveMeta(meta) {
    if (!meta) return;
    meta.updatedAt = Date.now();
    await postData("todo", "meta", "meta", JSON.stringify(meta));
  }
};
