<template>
  <div class="dashboard-container">
    <SketchWidget />

    <header class="dashboard-header">
      <div class="header-content">
        <h1 class="header-title">Welcome Back, deepria</h1>
        <p class="header-subtitle">{{ today }}</p>
      </div>
      <div class="quick-task-wrapper">
        <BaseInput
          v-model="quickTask"
          placeholder="Add new task..."
          class="header-input"
          @keyup.enter="handleQuickTask"
        >
          <template #suffix>
            <button class="icon-btn" @click="handleQuickTask">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </template>
        </BaseInput>
      </div>
    </header>

    <div class="dashboard-grid">
      <div class="kpi-row">
        <BaseCard class="stat-card compact-card transparent-card" hoverable interactive @click="$router.push('/notes')">
          <div class="stat-icon-wrapper green-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="stat-content-compact">
            <div class="stat-value">{{ dashboardLoading ? '-' : metrics.notesTotal }}</div>
            <div class="stat-label">Total Notes</div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card compact-card transparent-card" hoverable interactive @click="$router.push('/todo')">
          <div class="stat-icon-wrapper blue-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div class="stat-content-compact">
            <div class="stat-value">{{ dashboardLoading ? '-' : metrics.tasksActive }}</div>
            <div class="stat-label">Active Tasks</div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card compact-card transparent-card" hoverable interactive @click="$router.push('/todo')">
          <div class="stat-icon-wrapper cyan-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17a1 1 0 001.447.894l7-3.5A1 1 0 0020 13.5v-3a1 1 0 00-.553-.894l-7-3.5A1 1 0 0011 7v10z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h1v12H4z" />
            </svg>
          </div>
          <div class="stat-content-compact">
            <div class="stat-value">{{ dashboardLoading ? '-' : `${metrics.tasksCompletionRate}%` }}</div>
            <div class="stat-label">Task Completion</div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card compact-card transparent-card" hoverable interactive @click="$router.push('/s3')">
          <div class="stat-icon-wrapper amber-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <div class="stat-content-compact">
            <div class="stat-value">{{ dashboardLoading ? '-' : metrics.filesTotal }}</div>
            <div class="stat-label">Stored Files</div>
          </div>
        </BaseCard>
      </div>

      <BaseCard class="list-card transparent-card" padding="md">
        <template #header>
          <div class="card-title">Recent Updates</div>
        </template>
        <ul class="activity-list">
          <li v-if="dashboardLoading" class="activity-item">
            <div class="dot"></div>
            <div class="activity-text">Loading updates...</div>
          </li>
          <li v-else-if="recentActivities.length === 0" class="activity-item">
            <div class="dot"></div>
            <div class="activity-text">No recent updates yet.</div>
          </li>
          <li v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="dot"></div>
            <div class="activity-text">
              <span class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</span>
              {{ activity.text }}
            </div>
          </li>
        </ul>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import BaseCard from "@/components/base/BaseCard.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import SketchWidget from "@/components/SketchWidget.vue";
import { postData, getData } from "@/services/dynamoService.js";
import { fetchNotes } from "@/services/noteService.js";
import { load as loadS3Directory } from "@/services/s3Service.js";
import { message } from "ant-design-vue";

const quickTask = ref("");
const dashboardLoading = ref(true);
const metrics = ref({
  notesTotal: 0,
  tasksActive: 0,
  tasksCompletionRate: 0,
  filesTotal: 0,
});
const recentActivities = ref([]);

const today = computed(() => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const day = days[date.getDay()];
  return `${yyyy}.${mm}.${dd}(${day})`;
});

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
    message.error("Failed to load dashboard data");
  } finally {
    dashboardLoading.value = false;
  }
};

const handleQuickTask = async () => {
  if (!quickTask.value.trim()) return;
  try {
    const raw = await getData("todo", "todo");
    const items = normalizeArray(raw);
    const newItem = {
      id: Date.now(),
      text: quickTask.value,
      groupKey: 1,
      priorityKey: 1,
      completed: false,
    };
    items.unshift(newItem);
    await postData("todo", "todo", "todo", JSON.stringify(items));
    message.success("Task added");
    quickTask.value = "";
    await refreshDashboard();
  } catch (e) {
    message.error("Failed to add task");
  }
};

onMounted(() => {
  refreshDashboard();
});
</script>

<style scoped>
.dashboard-container {
  padding: var(--space-xl);
  max-width: var(--max-width);
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
  gap: var(--space-lg);
}

.header-content {
  flex: 1;
  min-width: 200px;
}

.header-title {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  letter-spacing: -0.5px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.header-subtitle {
  color: var(--text-muted);
  margin-top: var(--space-xs);
  font-size: var(--text-base);
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.quick-task-wrapper {
  width: 300px;
}

.header-input :deep(input) {
  background: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(4px);
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-lg);
}

.compact-card :deep(.card-body) {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-lg) !important;
  height: 100%;
}

.transparent-card {
  background: rgba(20, 20, 20, 0.4) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
  flex-shrink: 0;
}

.green-glow {
  color: var(--color-success);
  background: rgba(66, 185, 131, 0.2);
  box-shadow: 0 0 20px rgba(66, 185, 131, 0.2);
}

.blue-glow {
  color: var(--color-info);
  background: rgba(59, 130, 246, 0.2);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
}

.cyan-glow {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.2);
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
}

.amber-glow {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.2);
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.2);
}

.stat-content-compact {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.list-card {
  min-height: 300px;
}

.card-title {
  font-weight: 700;
  color: var(--text-main);
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.activity-item:last-child {
  border-bottom: none;
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.activity-text {
  font-size: var(--text-sm);
  color: var(--text-muted);
  line-height: 1.4;
}

.activity-time {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-disabled);
  margin-bottom: 2px;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.icon-btn:hover {
  color: var(--color-primary);
}

@media (max-width: 640px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }

  .quick-task-wrapper {
    width: 100%;
  }

  .kpi-row {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }
}
</style>
