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
              <p class="eyebrow">Quick Clipboard</p>
              <p class="quick-task-title">Sync text instantly across devices</p>
            </div>
            <div class="clipboard-actions">
               <span v-if="clipboardSaving" class="status-msg">Saving...</span>
               <button class="icon-btn-secondary" @click="handleCopyClipboard" title="Copy to Clipboard">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
               </button>
            </div>
          </div>
          <textarea
              v-model="clipboardText"
              placeholder="Paste or type text here..."
              class="clipboard-textarea"
              @blur="handleSaveClipboard"
          ></textarea>
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
import { computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import BaseCard from "@/shared/ui/BaseCard.vue";
import { useDashboard } from "@/features/dashboard/composables/useDashboard";

const {
  dashboardLoading,
  metrics,
  recentActivities,
  refreshDashboard,
  formatRelativeTime,
  clipboardText,
  clipboardSaving,
  saveClipboard
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

const handleSaveClipboard = async () => {
  try {
    await saveClipboard(clipboardText.value);
  } catch {
    message.error("Failed to save clipboard");
  }
};

const handleCopyClipboard = async () => {
  if (!clipboardText.value) return;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(clipboardText.value);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = clipboardText.value;
      textArea.style.position = "fixed";  // Avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    message.success("Copied to clipboard!");
  } catch {
    message.error("Failed to copy");
  }
};

onMounted(() => {
  refreshDashboard();
});
</script>

/* ... replacing everything under style ... */
<style scoped>
.dashboard-container {
  padding: var(--space-4);
  max-width: var(--max-width);
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  gap: var(--space-6);
}

.hero-cluster {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: var(--space-6);
  align-items: stretch;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.eyebrow {
  font-size: var(--font-size-caption);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  font-weight: 600;
  margin: 0;
}

.header-title {
  font-size: var(--font-size-hero);
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: var(--tracking-tight);
}

.header-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
  margin: 0 0 var(--space-4) 0;
}

.hero-meta {
  display: flex;
  gap: var(--space-3);
  margin-top: auto;
}

.meta-chip,
.activity-pill {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: var(--font-size-caption);
  font-weight: 600;
}

.quick-task-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.clipboard-textarea {
  width: 100%;
  height: 80px;
  background-color: var(--color-bg-base);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  resize: none;
  transition: all 0.2s ease;
}

.clipboard-textarea:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 1px var(--color-primary);
}

.clipboard-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.status-msg {
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
}
.quick-task-title {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
  margin: var(--space-1) 0 0;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: var(--color-primary);
  color: var(--text-inverse);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.icon-btn:hover {
  transform: scale(1.05);
}

.icon-btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-base);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn-secondary:hover {
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border-color: var(--color-border-bright);
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
}

.stat-topline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-tag {
  font-size: var(--font-size-caption);
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-bright);
}

.blue-glow { color: #3b82f6; }
.purple-glow { color: #a855f7; }
.cyan-glow { color: #06b6d4; }
.amber-glow { color: #f59e0b; }

.stat-content {
  margin-top: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: var(--font-size-title);
  font-weight: 600;
  margin: 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.activity-item {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-primary);
  margin-top: 6px;
}

.activity-text {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
}

.activity-time {
  display: block;
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
  margin-bottom: var(--space-1);
}

@media (max-width: 1024px) {
  .hero-cluster {
    grid-template-columns: 1fr;
  }
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: var(--space-4);
  }
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }
  .stat-card {
    min-height: 120px;
  }
  .stat-content {
    margin-top: var(--space-3);
  }
  .stat-value {
    font-size: 20px;
  }
  .stat-icon-wrapper {
    width: 32px;
    height: 32px;
  }
  .stat-icon-wrapper svg {
    width: 16px;
    height: 16px;
  }
  .stat-label {
    font-size: 10px;
    letter-spacing: 0;
  }
  .header-title {
    font-size: var(--font-size-title);
  }
}
</style>
