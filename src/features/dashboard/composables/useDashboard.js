import { ref } from 'vue';
import { getData } from '@/services/dynamoService.js';
import { fetchNotes } from '@/features/memo/api/memoApi';
import { load as loadS3Directory } from '@/services/s3Service.js';

export function useDashboard() {
  const dashboardLoading = ref(true);
  const metrics = ref({
    notesTotal: 0,
    tasksActive: 0,
    tasksCompletionRate: 0,
    filesTotal: 0,
  });
  const recentActivities = ref([]);

  const normalizeArray = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (Array.isArray(parsed?.data)) return parsed.data;
      } catch (e) {
        return [];
      }
    }
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}d ago`;
  };

  const buildRecentActivities = (notes, tasks) => {
    const noteActivities = notes
      .filter((note) => note?.updatedAt)
      .map((note) => ({
        id: `note-${note.id}`,
        timestamp: new Date(note.updatedAt).getTime(),
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
      .filter((a) => Number.isFinite(a.timestamp))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);
  };

  const refreshDashboard = async () => {
    dashboardLoading.value = true;
    try {
      const [rawTasks, notesRaw, s3Response] = await Promise.all([
        getData("todo", "todo"),
        fetchNotes(),
        loadS3Directory(),
      ]);

      const tasks = normalizeArray(rawTasks);
      const notes = normalizeArray(notesRaw);
      const s3Files = normalizeArray(s3Response?.data?.files).map((f) =>
        String(f).replace("upload/", "")
      );

      const completedTasks = tasks.filter((task) => task?.completed).length;
      const totalTasks = tasks.length;
      const taskCompletionRate =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

      metrics.value = {
        notesTotal: notes.length,
        tasksActive: totalTasks - completedTasks,
        tasksCompletionRate: taskCompletionRate,
        filesTotal: s3Files.length,
      };

      recentActivities.value = buildRecentActivities(notes, tasks);
    } catch (e) {
      console.error("Failed to load dashboard data", e);
      throw e;
    } finally {
      dashboardLoading.value = false;
    }
  };

  return {
    dashboardLoading,
    metrics,
    recentActivities,
    refreshDashboard,
    normalizeArray,
    formatRelativeTime
  };
}
