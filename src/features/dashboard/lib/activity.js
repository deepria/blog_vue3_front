export function buildRecentActivities(notes, tasks) {
  const noteActivities = notes
    .filter((note) => note?.updatedAt || note?.updated_at)
    .map((note) => ({
      id: `note-${note.id}`,
      timestamp: new Date(note.updatedAt || note.updated_at).getTime(),
      text: `Updated note "${note.title || "Untitled Note"}"`,
    }));

  const taskActivities = tasks
    .filter((task) => Number.isFinite(Number(task?.id)))
    .map((task) => ({
      id: `task-${task.id}`,
      timestamp: Number(task.id),
      text: `${task.completed ? "Completed" : "Added"} task "${task.text || "Untitled Task"}"`,
    }));

  return [...noteActivities, ...taskActivities]
    .filter((activity) => Number.isFinite(activity.timestamp))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 8);
}
