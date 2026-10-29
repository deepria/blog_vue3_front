<template>
  <PageShell
    class="todo-page"
    title="할 일"
    eyebrow="작업 계획"
    description="할 일을 기록하고 그룹과 우선순위로 정리하세요."
  >
    <template #actions>
      <div class="primary-actions">
        <button
          class="icon-btn-secondary"
          @click="handleRefresh"
          title="새로고침"
        >
          <ReloadOutlined />
          <svg
            v-if="false"
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
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path
              d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
            ></path>
          </svg>
          <svg
            v-if="false"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M20 11a8 8 0 1 0 2 5.3"></path>
            <path d="M20 4v7h-7"></path>
          </svg>
        </button>
        <button
          class="icon-btn-secondary settings-button"
          @click="openSettings"
          title="작업 설정"
        >
          <SettingOutlined />
          <svg
            v-if="false"
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
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            ></path>
          </svg>
          <svg
            v-if="false"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M12 2v3m0 14v3M2 12h3m14 0h3M4.93 4.93l2.12 2.12m9.9 9.9 2.12 2.12m0-14.14-2.12 2.12m-9.9 9.9-2.12 2.12"
            ></path>
          </svg>
        </button>
        <button
          class="icon-btn-primary"
          :class="{ 'pulse-animation': hasUnsavedChanges }"
          :disabled="saving || loading || !!error"
          @click="handleSave"
          title="저장"
        >
          <SaveOutlined />
        </button>
      </div>
    </template>

    <div class="quick-add-container">
      <TodoQuickAdd
        :disabled="loading || !!error"
        v-model="quickAddText"
        @submit="handleQuickAdd"
      />
      <div class="mobile-task-actions" aria-label="작업 도구">
        <button
          class="icon-btn-secondary"
          type="button"
          title="새로고침"
          @click="handleRefresh"
        >
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
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path
              d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
            ></path>
          </svg>
        </button>
        <button
          class="icon-btn-secondary settings-button"
          type="button"
          title="옵션"
          @click="openSettings"
        >
          <SettingOutlined />
          <svg
            v-if="false"
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
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            ></path>
          </svg>
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
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M12 2v3m0 14v3M2 12h3m14 0h3M4.93 4.93l2.12 2.12m9.9 9.9 2.12 2.12m0-14.14-2.12 2.12m-9.9 9.9-2.12 2.12"
            ></path>
          </svg>
        </button>
        <button
          class="icon-btn-primary"
          :class="{ 'pulse-animation': hasUnsavedChanges }"
          :disabled="saving || loading || !!error"
          type="button"
          title="저장"
          @click="handleSave"
        >
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
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            ></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <div class="task-state" role="status" v-if="loading">
      할 일을 불러오는 중입니다.
    </div>
    <div class="task-state task-error" role="alert" v-if="error">
      <span>{{ error }}</span
      ><BaseButton variant="secondary" size="sm" @click="handleRefresh"
        >다시 시도</BaseButton
      >
    </div>
    <div class="task-toolbar">
      <div class="task-filters" aria-label="할 일 필터">
        <button
          v-for="filter in filters"
          :key="filter.id"
          :aria-pressed="filterMode === filter.id"
          @click="filterMode = filter.id"
        >
          {{ filter.label }}
        </button>
      </div>
      <span role="status"
        >{{
          loading
            ? "불러오는 중"
            : error
              ? "불러오기 실패"
              : saving
                ? "저장 중"
                : hasUnsavedChanges
                  ? "저장되지 않은 변경"
                  : "저장됨"
        }}
        · {{ completedCount }}/{{ items.length }}개 완료</span
      >
    </div>
    <p v-if="!loading && !error && !visibleItems.length" class="task-state">
      {{
        items.length
          ? "조건에 맞는 할 일이 없습니다."
          : "아직 할 일이 없습니다. 첫 작업을 추가해 보세요."
      }}
    </p>
    <TodoBoard
      :items="visibleItems"
      :group-options="groupOptions"
      :priority-options="priorityOptions"
      @add="addItem('', $event, null)"
      @edit="openEditModal"
      @delete="deleteItem"
      @toggle="toggleCompletion"
    />

    <BaseModal
      v-model="showPopup"
      :title="
        settingsMode
          ? '그룹과 우선순위 관리'
          : isNewItem
            ? '새 할 일'
            : '할 일 편집'
      "
    >
      <div class="edit-form">
        <template v-if="!settingsMode"
          ><BaseInput
            v-model="selectedItem.text"
            label="작업 내용"
            placeholder="어떤 일을 해야 하나요?"
          />

          <div class="form-row">
            <div class="form-group">
              <label>그룹</label>
              <div class="select-wrapper">
                <select v-model="selectedItem.groupKey" class="base-select">
                  <option v-for="g in groupOptions" :key="g.key" :value="g.key">
                    {{ g.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>우선순위</label>
              <div class="select-wrapper">
                <select v-model="selectedItem.priorityKey" class="base-select">
                  <option
                    v-for="p in priorityOptions"
                    :key="p.key"
                    :value="p.key"
                  >
                    {{ p.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </template>

        <div v-if="settingsMode" class="options-manager">
          <div class="option-section">
            <h4>그룹</h4>
            <div
              v-for="(g, idx) in groupOptions"
              :key="g.key"
              class="option-row"
            >
              <input v-model="g.name" @input="markUnsaved" class="mini-input" />
              <input
                type="color"
                v-model="g.color"
                @input="markUnsaved"
                class="color-picker"
              />
              <button
                class="icon-btn-danger"
                @click="
                  groupOptions.splice(idx, 1);
                  markUnsaved();
                "
              >
                ×
              </button>
            </div>
            <div class="option-row add-new">
              <input
                v-model="newGroup.name"
                class="mini-input"
                placeholder="새 그룹 이름"
              />
              <input
                type="color"
                v-model="newGroup.color"
                class="color-picker"
              />
              <button class="icon-btn-primary" @click="addGroup">+</button>
            </div>
          </div>

          <div class="option-section">
            <h4>우선순위</h4>
            <div
              v-for="(p, idx) in priorityOptions"
              :key="p.key"
              class="option-row"
            >
              <input v-model="p.name" @input="markUnsaved" class="mini-input" />
              <input
                type="color"
                v-model="p.color"
                @input="markUnsaved"
                class="color-picker"
              />
              <button
                class="icon-btn-danger"
                @click="
                  priorityOptions.splice(idx, 1);
                  markUnsaved();
                "
              >
                ×
              </button>
            </div>
            <div class="option-row add-new">
              <input
                v-model="newPriority.name"
                class="mini-input"
                placeholder="새 우선순위 이름"
              />
              <input
                type="color"
                v-model="newPriority.color"
                class="color-picker"
              />
              <button class="icon-btn-primary" @click="addPriority">+</button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="showPopup = false">{{
          settingsMode ? "닫기" : "취소"
        }}</BaseButton>
        <BaseButton variant="primary" @click="confirmPopup">완료</BaseButton>
      </template>
    </BaseModal>
  </PageShell>
</template>

<script setup>
import {
  ReloadOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { computed, onMounted, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { useWorkProtection } from "@/shared/composables/useWorkProtection";
import TodoBoard from "@/features/todo/components/TodoBoard.vue";
import TodoQuickAdd from "@/features/todo/components/TodoQuickAdd.vue";
import { useTodos } from "@/features/todo/composables/useTodos";
import { useTodoEditor } from "@/features/todo/composables/useTodoEditor";
import BaseButton from "@/shared/ui/BaseButton.vue";
import BaseInput from "@/shared/ui/BaseInput.vue";
import BaseModal from "@/shared/ui/BaseModal.vue";
import PageShell from "@/shared/ui/PageShell.vue";

const {
  items,
  loading,
  saving,
  error,
  groupOptions,
  priorityOptions,
  hasUnsavedChanges,
  sortedItems,
  nextGroupKey,
  nextPriorityKey,
  markUnsaved,
  fetchAll,
  saveAll,
  addItem,
  deleteItem,
  toggleCompletion,
} = useTodos();

const {
  quickAddText,
  showPopup,
  isNewItem,
  settingsMode,
  selectedItem,
  newGroup,
  newPriority,
  addQuickItem,
  openEditModal,
  openSettings,
  confirmPopup,
  addGroup,
  addPriority,
} = useTodoEditor({
  groupOptions,
  priorityOptions,
  nextGroupKey,
  nextPriorityKey,
  markUnsaved,
});

const filterMode = ref("all");
const filters = [
  { id: "all", label: "전체" },
  { id: "active", label: "진행 중" },
  { id: "done", label: "완료" },
];
const visibleItems = computed(() =>
  sortedItems.value.filter(
    (item) =>
      filterMode.value === "all" ||
      (filterMode.value === "done" ? item.completed : !item.completed),
  ),
);
const completedCount = computed(
  () => items.value.filter((item) => item.completed).length,
);
useWorkProtection(
  "할 일 편집",
  () =>
    hasUnsavedChanges.value ||
    saving.value ||
    quickAddText.value.trim().length > 0 ||
    showPopup.value,
);
onBeforeRouteLeave(
  () =>
    !hasUnsavedChanges.value ||
    window.confirm(
      "저장되지 않은 할 일이 있습니다. 변경사항을 버리고 나갈까요?",
    ),
);
const handleQuickAdd = () => addQuickItem(addItem);

async function handleRefresh() {
  if (
    hasUnsavedChanges.value &&
    !confirm("저장되지 않은 변경사항을 버리고 다시 불러올까요?")
  )
    return;
  if (await fetchAll()) message.success("새로고침했습니다.");
}

async function handleSave() {
  try {
    if (await saveAll()) message.success("변경사항을 저장했습니다.");
  } catch {
    message.error("저장하지 못했습니다. 다시 시도해 주세요.");
  }
}

onMounted(() => {
  fetchAll();
});
</script>

<style scoped>
.todo-page {
  display: block;
}

.header-actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.primary-actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.settings-button > svg {
  display: none;
}

.quick-add-container {
  display: flex;
  gap: 10px;
  margin-bottom: 0;
}

.quick-add-container > :first-child {
  min-width: 0;
  flex: 1;
}

.mobile-task-actions {
  display: none;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: flex;
  gap: var(--space-4);
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-size: var(--font-size-caption);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.select-wrapper {
  position: relative;
}

.base-select,
.mini-input {
  width: 100%;
  background-color: var(--color-bg-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-height: 40px;
  padding: 0 var(--space-3);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  transition: all 0.2s ease;
}

.base-select:focus,
.mini-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-glow);
}

.mini-input::placeholder {
  color: var(--color-text-disabled);
}

.options-toggle {
  display: flex;
  justify-content: flex-end;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  cursor: pointer;
  margin-top: var(--space-2);
}

.options-toggle:hover {
  color: var(--color-primary);
}

.options-manager {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-4);
  background-color: var(--color-bg-panel);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.option-section h4 {
  font-size: var(--font-size-body);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3) 0;
}

.option-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.color-picker {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: transparent;
  cursor: pointer;
  padding: 2px;
}

.icon-btn-danger,
.icon-btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  color: white;
  font-weight: bold;
}

.icon-btn-danger {
  color: var(--text-danger-inverse, white);
  background-color: var(--color-danger);
}

.icon-btn-primary {
  background-color: var(--color-primary);
  color: var(--text-inverse);
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--color-primary), 0.4);
  }
  70% {
    transform: scale(1.02);
    box-shadow: 0 0 0 6px rgba(var(--color-primary), 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--color-primary), 0);
  }
}

@media (max-width: 640px) {
  .todo-page :deep(.page-shell-header) {
    display: none;
  }

  .quick-add-container {
    flex-direction: row;
    align-items: center;
  }

  .mobile-task-actions {
    display: flex;
    align-self: auto;
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
  }

  .mobile-task-actions .icon-btn-secondary,
  .mobile-task-actions .icon-btn-primary {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
  }

  .form-row {
    flex-direction: column;
  }
}
.task-state {
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.task-error {
  color: var(--color-danger);
}
.task-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.task-toolbar > span {
  font-size: 12px;
  color: var(--color-text-muted);
}
.task-filters {
  display: flex;
  gap: 5px;
}
.task-filters button {
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}
.task-filters button[aria-pressed="true"] {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
