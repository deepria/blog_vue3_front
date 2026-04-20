<template>
  <div class="dashboard-container">
    <div class="dashboard-grid">
      <section class="hero-cluster">
        <BaseCard class="hero-card dashboard-card dashboard-glass dashboard-card--elevated" glass hoverable>
          <div class="hero-copy">
            <p class="eyebrow">Today Brief</p>
            <h1 class="header-title">Welcome Back, deepria</h1>
            <p class="header-subtitle">{{ today }}</p>
          </div>
          <div class="hero-meta">
            <span class="meta-chip">Notes {{ dashboardLoading ? '-' : metrics.notesTotal }}</span>
            <span class="meta-chip">Tasks {{ dashboardLoading ? '-' : metrics.tasksActive }}</span>
          </div>
        </BaseCard>

        <BaseCard class="quick-task-card dashboard-card dashboard-glass dashboard-card--elevated" glass hoverable>
          <div class="quick-task-head">
            <div>
              <p class="eyebrow">Quick Capture</p>
              <p class="quick-task-title">Add a task without leaving this view</p>
            </div>
            <BaseButton size="sm" variant="ghost" @click="refreshDashboard">Refresh</BaseButton>
          </div>
          <BaseInput
              v-model="quickTask"
              placeholder="Add new task..."
              class="header-input"
              @keyup.enter="handleQuickTask"
          >
            <template #suffix>
              <button class="icon-btn" @click="handleQuickTask" aria-label="Add task">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </template>
          </BaseInput>
        </BaseCard>
      </section>

      <section class="kpi-row">
        <BaseCard class="stat-card dashboard-card dashboard-glass" glass hoverable interactive
                  @click="$router.push('/memo')">
          <div class="stat-topline">
            <span class="stat-tag">Memo</span>
            <div class="stat-icon-wrapper blue-glow">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardLoading ? '-' : metrics.notesTotal }}</div>
            <div class="stat-label">Total Notes</div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card dashboard-card dashboard-glass" glass hoverable interactive
                  @click="$router.push('/todo')">
          <div class="stat-topline">
            <span class="stat-tag">Todo</span>
            <div class="stat-icon-wrapper purple-glow">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardLoading ? '-' : metrics.tasksActive }}</div>
            <div class="stat-label">Active Tasks</div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card dashboard-card dashboard-glass" glass hoverable interactive
                  @click="$router.push('/todo')">
          <div class="stat-topline">
            <span class="stat-tag">Flow</span>
            <div class="stat-icon-wrapper cyan-glow">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 17a1 1 0 001.447.894l7-3.5A1 1 0 0020 13.5v-3a1 1 0 00-.553-.894l-7-3.5A1 1 0 0011 7v10z"
                />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h1v12H4z"/>
              </svg>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardLoading ? '-' : `${metrics.tasksCompletionRate}%` }}</div>
            <div class="stat-label">Completion</div>
          </div>
        </BaseCard>

        <BaseCard class="stat-card dashboard-card dashboard-glass" glass hoverable interactive
                  @click="$router.push('/s3')">
          <div class="stat-topline">
            <span class="stat-tag">Storage</span>
            <div class="stat-icon-wrapper amber-glow">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                />
              </svg>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ dashboardLoading ? '-' : metrics.filesTotal }}</div>
            <div class="stat-label">Stored Files</div>
          </div>
        </BaseCard>
      </section>

      <BaseCard class="activity-card dashboard-card dashboard-glass dashboard-card--elevated" glass>
        <template #header>
          <div class="activity-header">
            <h3 class="card-title">Recent Activity</h3>
            <span class="activity-pill">{{ recentActivities.length }} items</span>
          </div>
        </template>
        <div class="activity-list">
          <BaseCard v-if="dashboardLoading" class="activity-entry dashboard-card dashboard-glass" glass>
            <div class="activity-item">
              <div class="dot"></div>
              <div class="activity-text">Loading updates...</div>
            </div>
          </BaseCard>
          <BaseCard v-else-if="recentActivities.length === 0" class="activity-entry dashboard-card dashboard-glass"
                    glass>
            <div class="activity-item">
              <div class="dot"></div>
              <div class="activity-text">No recent updates yet.</div>
            </div>
          </BaseCard>
          <BaseCard
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-entry dashboard-card dashboard-glass"
              glass
          >
            <div class="activity-item">
              <div class="dot"></div>
              <div class="activity-text">
                <span class="activity-time">{{ formatRelativeTime(activity.timestamp) }}</span>
                {{ activity.text }}
              </div>
            </div>
          </BaseCard>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import {message} from "ant-design-vue";
import BaseCard from "@/shared/ui/BaseCard.vue";
import BaseInput from "@/shared/ui/BaseInput.vue";
import BaseButton from "@/shared/ui/BaseButton.vue";
import { todoApi } from "@/features/todo/api/todoApi";
import {useDashboard} from "@/features/dashboard/composables/useDashboard";

const quickTask = ref("");
const {
  dashboardLoading,
  metrics,
  recentActivities,
  refreshDashboard,
  formatRelativeTime
} = useDashboard();

const today = computed(() => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const day = days[date.getDay()];
  return `${yyyy}.${mm}.${dd}(${day})`;
});

const handleQuickTask = async () => {
  if (!quickTask.value.trim()) return;
  try {
    const items = await todoApi.fetchTodos();
    const newItem = {
      id: Date.now(),
      text: quickTask.value,
      groupKey: 1,
      priorityKey: 1,
      completed: false
    };
    items.unshift(newItem);
    await todoApi.saveTodos(items);
    message.success("Task added");
    quickTask.value = "";
    await refreshDashboard();
  } catch (e) {
    console.error("Failed to add task", e);
    message.error("Failed to add task");
  }
};

onMounted(() => {
  refreshDashboard();
});
</script>

<style scoped>
.dashboard-container {
  padding: clamp(14px, 3vw, var(--space-8));
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
}

.dashboard-grid {
  display: grid;
  gap: clamp(10px, 2vw, var(--space-8));
}

.hero-cluster {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
  gap: clamp(10px, 2vw, var(--space-6));
  align-items: stretch;
}

:deep(.dashboard-card) {
  --card-bg-color: rgba(255, 255, 255, 0.01);
  --card-bg-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.002));
  --card-border: 1px solid rgba(255, 255, 255, 0.08);
  --card-shadow:
    0 18px 40px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

:deep(.dashboard-card--elevated) {
  --card-bg-color: rgba(255, 255, 255, 0.014);
  --card-bg-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.003));
  --card-border: 1px solid rgba(255, 255, 255, 0.09);
  --card-shadow:
    0 24px 54px rgba(0, 0, 0, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

:deep(.dashboard-glass) {
  backdrop-filter: blur(26px);
  -webkit-backdrop-filter: blur(26px);
}



:deep(.activity-card .base-card-header) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.014), rgba(255, 255, 255, 0.002)),
  rgba(255, 255, 255, 0.005);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

:deep(.hero-card .base-card-body) {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-6);
}

.hero-copy {
  display: grid;
  gap: 6px;
}

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(255, 255, 255, 0.72);
}

.header-title {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #888 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-subtitle {
  color: var(--color-text-muted);
  margin: 0;
  font-size: 1rem;
}

.hero-meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.meta-chip,
.activity-pill {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.78rem;
  font-weight: 600;
}

:deep(.quick-task-card .base-card-body) {
  display: grid;
  gap: 14px;
}

.quick-task-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.quick-task-title {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.header-input :deep(.base-input) {
  background: rgba(255, 255, 255, 0.035);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--color-text-primary);
  padding: 0;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(10px, 1.8vw, var(--space-6));
}

:deep(.stat-card) {
  min-height: 168px;
}

:deep(.stat-card .base-card-body) {
  display: grid;
  align-content: space-between;
  gap: 22px;
  padding: 18px !important;
}

.stat-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.stat-tag {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.blue-glow {
  color: #42b883;
  box-shadow: 0 0 14px rgba(66, 184, 131, 0.12);
}

.purple-glow {
  color: #64d8a0;
  box-shadow: 0 0 14px rgba(100, 216, 160, 0.11);
}

.cyan-glow {
  color: #7ee2b8;
  box-shadow: 0 0 14px rgba(126, 226, 184, 0.11);
}

.amber-glow {
  color: #b4f5d3;
  box-shadow: 0 0 14px rgba(180, 245, 211, 0.11);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-value {
  font-size: clamp(1.8rem, 4vw, 2.3rem);
  font-weight: 800;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

:deep(.activity-card) {
  min-height: 320px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.activity-list {
  display: grid;
  gap: 10px;
}

:deep(.activity-entry) {
  --card-bg-color: rgba(255, 255, 255, 0.008);
  --card-bg-image: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.002));
  --card-border: 1px solid rgba(255, 255, 255, 0.075);
  --card-shadow: 0 10px 24px rgba(0, 0, 0, 0.06),
  inset 0 1px 0 rgba(255, 255, 255, 0.035);
}

:deep(.activity-entry .base-card-body) {
  padding: 14px 16px;
}

.activity-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  margin-top: 6px;
  box-shadow: 0 0 8px var(--color-primary-glow);
}

.activity-text {
  font-size: 0.95rem;
  color: #ffffff;
  line-height: 1.5;
}

.activity-time {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}

@media (max-width: 1024px) {
  .hero-cluster {
    grid-template-columns: 1fr;
  }

  .kpi-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: var(--mobile-shell-gutter);
  }

  .dashboard-grid {
    gap: var(--mobile-panel-gap);
  }

  .hero-card :deep(.base-card-body),
  .quick-task-card :deep(.base-card-body) {
    gap: 14px;
  }

  .quick-task-head {
    flex-direction: column;
    align-items: stretch;
  }

  .kpi-row {
    gap: var(--mobile-panel-gap);
  }

  .stat-card {
    min-height: 146px;
  }

  .stat-card :deep(.base-card-body) {
    padding: 14px !important;
    gap: 16px;
  }

  .stat-icon-wrapper {
    width: 42px;
    height: 42px;
    border-radius: 14px;
  }

  .stat-label {
    letter-spacing: 0.08em;
    font-size: 0.72rem;
  }

  .activity-card {
    min-height: 0;
  }

  .card-title {
    font-size: 1.05rem;
  }

  .activity-item {
    gap: 12px;
  }

  .activity-entry :deep(.base-card-body) {
    padding: 12px 14px;
  }
}
</style>
