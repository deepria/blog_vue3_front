<template>
  <div class="sidebar-shell">
    <div class="sidebar-header">
      <BaseButton variant="primary" block @click="$emit('create')">
        <plus-outlined /> 새 대화
      </BaseButton>

      <label class="search-box">
        <search-outlined />
        <input v-model="searchQuery" type="search" placeholder="대화 검색" />
      </label>
    </div>

    <div class="session-list">
      <p v-if="!groupedSessions.length" class="empty-sessions">검색 결과가 없습니다.</p>

      <section v-for="group in groupedSessions" :key="group.label" class="session-group">
        <h2>{{ group.label }}</h2>

        <div
          v-for="session in group.items"
          :key="session.id"
          class="session-item"
          :class="{ active: currentSessionId === session.id }"
          @click="$emit('select', session.id)"
        >
          <message-outlined class="session-icon" />

          <div class="session-main">
            <input
              v-if="editingId === session.id"
              v-model="editingTitle"
              class="rename-input"
              @click.stop
              @keydown.enter.prevent="commitRename(session.id)"
              @keydown.esc.prevent="cancelRename"
            />
            <template v-else>
              <span class="session-title">{{ session.title || "New Chat" }}</span>
              <small>{{ getPreview(session) }}</small>
            </template>
          </div>

          <div class="session-actions">
            <template v-if="editingId === session.id">
              <button type="button" title="저장" @click.stop="commitRename(session.id)">
                <check-outlined />
              </button>
              <button type="button" title="취소" @click.stop="cancelRename">
                <close-outlined />
              </button>
            </template>
            <template v-else>
              <button type="button" title="이름 변경" @click.stop="startRename(session)">
                <edit-outlined />
              </button>
              <button type="button" title="삭제" @click.stop="confirmDelete(session.id)">
                <delete-outlined />
              </button>
            </template>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  MessageOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons-vue";
import BaseButton from "@/shared/ui/BaseButton.vue";

const props = defineProps({
  sessions: {
    type: Array,
    default: () => [],
  },
  currentSessionId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["create", "select", "delete", "rename"]);

const searchQuery = ref("");
const editingId = ref(null);
const editingTitle = ref("");

const filteredSessions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return props.sessions;
  return props.sessions.filter((session) => {
    const title = session.title || "";
    const latestMessage = session.messages?.at(-1)?.content || "";
    return `${title} ${latestMessage}`.toLowerCase().includes(query);
  });
});

const groupedSessions = computed(() => {
  const groups = new Map();
  filteredSessions.value.forEach((session) => {
    const label = getDateGroup(session.lastModified || session.createdAt || Date.now());
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(session);
  });
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
});

function getDateGroup(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.floor((startOfToday - startOfDate) / 86400000);

  if (diffDays <= 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return "최근 7일";
  return "이전 대화";
}

function getPreview(session) {
  const latest = session.messages?.at(-1)?.content?.trim();
  if (!latest) return "아직 메시지가 없습니다";
  return latest.length > 44 ? `${latest.slice(0, 44)}...` : latest;
}

function startRename(session) {
  editingId.value = session.id;
  editingTitle.value = session.title || "New Chat";
}

function commitRename(id) {
  const title = editingTitle.value.trim();
  if (title) emit("rename", { id, title });
  cancelRename();
}

function cancelRename() {
  editingId.value = null;
  editingTitle.value = "";
}

function confirmDelete(id) {
  if (window.confirm("이 대화를 삭제할까요?")) {
    emit("delete", id);
  }
}
</script>

<style scoped>
.sidebar-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: var(--color-text-primary);
  background: var(--color-bg-surface);
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-bottom: 1px solid var(--color-border);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 11px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-panel);
  color: var(--color-text-muted);
}

.search-box:focus-within {
  border-color: var(--color-border-bright);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
}

.search-box input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-body);
}

.search-box input::placeholder {
  color: var(--color-text-muted);
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-sessions {
  margin: 24px 4px;
  color: var(--color-text-muted);
  font-size: var(--font-size-body);
  text-align: center;
}

.session-group + .session-group {
  margin-top: 18px;
}

.session-group h2 {
  margin: 0 4px 8px;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0;
}

.session-item {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-height: 58px;
  padding: 9px 8px;
  border-radius: var(--radius-md);
  cursor: pointer;
  margin-bottom: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid transparent;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.session-item.active {
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  border-color: var(--color-border-bright);
}

.session-item:hover {
  background: var(--color-bg-panel);
  color: var(--color-text-primary);
}

.session-icon {
  color: currentColor;
}

.session-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 3px;
}

.session-title,
.session-main small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-body);
  font-weight: 650;
}

.session-main small {
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}

.rename-input {
  width: 100%;
  min-width: 0;
  height: 32px;
  border: 1px solid var(--color-border-bright);
  border-radius: var(--radius-sm);
  padding: 0 8px;
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  outline: none;
}

.session-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.session-item:hover .session-actions,
.session-item.active .session-actions,
.session-item:focus-within .session-actions {
  opacity: 1;
}

.session-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
}

.session-actions button:hover {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .session-actions {
    opacity: 1;
  }
}
</style>
