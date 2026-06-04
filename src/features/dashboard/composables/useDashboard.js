import { ref } from 'vue';
import { memoApi } from '@/features/memo/api/memoApi';
import { todoApi } from '@/features/todo/api/todoApi';
import { storageApi } from '@/features/storage/api/storageApi';
import { buildRecentActivities } from '@/features/dashboard/lib/activity';
import { useClipboard } from '@/features/dashboard/composables/useClipboard';

export function useDashboard() {
  const dashboardLoading = ref(true);
  const dashboardError = ref("");
  const dashboardWarnings = ref([]);
  const metrics = ref({
    notesTotal: 0,
    tasksActive: 0,
    tasksCompletionRate: 0,
    filesTotal: 0,
  });
  const recentActivities = ref([]);

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

  const { clipboardText, clipboardLoading, clipboardSaving, fetchClipboard, saveClipboard } = useClipboard();

  const refreshDashboard = async () => {
    dashboardLoading.value = true;
    dashboardError.value = "";
    dashboardWarnings.value = [];

    const [tasksResult, notesResult, filesResult, clipboardResult] = await Promise.allSettled([
      todoApi.fetchTodos(),
      memoApi.fetchNotes(),
      storageApi.listFiles(),
      fetchClipboard()
    ]);

    const failedSections = [];
    const getValue = (result, label, fallback) => {
      if (result.status === "fulfilled") return result.value || fallback;
      failedSections.push(label);
      console.error(`Failed to load dashboard ${label}`, result.reason);
      return fallback;
    };

    const tasks = getValue(tasksResult, "tasks", []);
    const notes = getValue(notesResult, "memos", []);
    const s3Files = getValue(filesResult, "files", []);
    if (clipboardResult.status === "rejected") {
      failedSections.push("clipboard");
      console.error("Failed to load dashboard clipboard", clipboardResult.reason);
    }

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
    dashboardWarnings.value = failedSections;
    dashboardError.value = failedSections.length
      ? `${failedSections.join(", ")} data could not be loaded.`
      : "";
    dashboardLoading.value = false;
  };

  return {
    dashboardLoading,
    dashboardError,
    dashboardWarnings,
    metrics,
    recentActivities,
    refreshDashboard,
    formatRelativeTime,
    clipboardText,
    clipboardLoading,
    clipboardSaving,
    saveClipboard,
    fetchClipboard
  };
}
