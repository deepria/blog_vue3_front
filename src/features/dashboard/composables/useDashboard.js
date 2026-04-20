import { ref } from 'vue';
import { fetchNotes } from '@/features/memo/api/memoApi';
import { todoApi } from '@/features/todo/api/todoApi';
import { storageApi } from '@/features/storage/api/storageApi';
import { buildRecentActivities } from '@/features/dashboard/lib/activity';

export function useDashboard() {
  const dashboardLoading = ref(true);
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

  const refreshDashboard = async () => {
    dashboardLoading.value = true;
    try {
      const [rawTasks, notesRaw, s3Response] = await Promise.all([
        todoApi.fetchTodos(),
        fetchNotes(),
        storageApi.listFiles(),
      ]);

      const tasks = rawTasks || [];
      const notes = notesRaw || [];
      const s3Files = s3Response || [];

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
    formatRelativeTime
  };
}
