export const normalizeTodo = (todo = {}) => ({
  id: todo.id,
  text: typeof todo.text === "string" ? todo.text : "",
  groupKey: todo.groupKey ?? null,
  priorityKey: todo.priorityKey ?? null,
  completed: Boolean(todo.completed),
});
