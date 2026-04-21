<template>
  <div class="todo-page">
    <header class="todo-header">
      <div class="header-copy">
        <h1 class="page-title">Tasks</h1>
      </div>
      <div class="header-actions">
        <div class="primary-actions">
          <button class="icon-btn-secondary" @click="handleRefresh" title="Refresh">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          </button>
          <button class="icon-btn-secondary" @click="openSettings" title="Options">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
          <button
            class="icon-btn-primary"
            :class="{ 'pulse-animation': hasUnsavedChanges }"
            @click="handleSave"
            title="Save"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          </button>
        </div>
      </div>
    </header>

    <div class="quick-add-container">
      <TodoQuickAdd
        v-model="quickAddText"
        v-model:group-key="quickAddGroupKey"
        :group-options="groupOptions"
        @submit="handleQuickAdd"
      />
    </div>

    <TodoBoard
      :items="sortedItems"
      :group-options="groupOptions"
      :priority-options="priorityOptions"
      @edit="openEditModal"
      @delete="deleteItem"
      @toggle="toggleCompletion"
    />

    <BaseModal v-model="showPopup" :title="settingsMode ? 'Manage Groups & Priorities' : isNewItem ? 'New Task' : 'Edit Task'">
      <div class="edit-form">
        <BaseInput v-model="selectedItem.text" label="Task Description" placeholder="What needs to be done?" />

        <div class="form-row">
          <div class="form-group">
            <label>Group</label>
            <div class="select-wrapper">
              <select v-model="selectedItem.groupKey" class="base-select">
                <option v-for="g in groupOptions" :key="g.key" :value="g.key">{{ g.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Priority</label>
            <div class="select-wrapper">
              <select v-model="selectedItem.priorityKey" class="base-select">
                <option v-for="p in priorityOptions" :key="p.key" :value="p.key">{{ p.name }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="options-toggle" @click="settingsMode = !settingsMode">
          <span>{{ settingsMode ? "Hide Options Manager" : "Manage Groups & Tags" }}</span>
        </div>

        <div v-if="settingsMode" class="options-manager">
          <div class="option-section">
            <h4>Groups</h4>
            <div v-for="(g, idx) in groupOptions" :key="g.key" class="option-row">
              <input v-model="g.name" class="mini-input" />
              <input type="color" v-model="g.color" class="color-picker" />
              <button class="icon-btn-danger" @click="groupOptions.splice(idx, 1); markUnsaved()">×</button>
            </div>
            <div class="option-row add-new">
              <input v-model="newGroup.name" class="mini-input" placeholder="New Group" />
              <input type="color" v-model="newGroup.color" class="color-picker" />
              <button class="icon-btn-primary" @click="addGroup">+</button>
            </div>
          </div>

          <div class="option-section">
            <h4>Priorities</h4>
            <div v-for="(p, idx) in priorityOptions" :key="p.key" class="option-row">
              <input v-model="p.name" class="mini-input" />
              <input type="color" v-model="p.color" class="color-picker" />
              <button class="icon-btn-danger" @click="priorityOptions.splice(idx, 1); markUnsaved()">×</button>
            </div>
            <div class="option-row add-new">
              <input v-model="newPriority.name" class="mini-input" placeholder="New Priority" />
              <input type="color" v-model="newPriority.color" class="color-picker" />
              <button class="icon-btn-primary" @click="addPriority">+</button>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="secondary" @click="showPopup = false">Cancel</BaseButton>
        <BaseButton variant="primary" @click="confirmPopup">Done</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { message } from "ant-design-vue";
import { onMounted, ref } from "vue";
import TodoBoard from "@/features/todo/components/TodoBoard.vue";
import TodoQuickAdd from "@/features/todo/components/TodoQuickAdd.vue";
import { useTodos } from "@/features/todo/composables/useTodos";
import BaseButton from "@/shared/ui/BaseButton.vue";
import BaseInput from "@/shared/ui/BaseInput.vue";
import BaseModal from "@/shared/ui/BaseModal.vue";

const {
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

const quickAddText = ref("");
const quickAddGroupKey = ref(null);
const showPopup = ref(false);
const isNewItem = ref(false);
const settingsMode = ref(false);
const selectedItem = ref({ text: "", groupKey: null, priorityKey: null });
const newGroup = ref({ name: "", color: "#666666" });
const newPriority = ref({ name: "", color: "#ef4444" });

function handleQuickAdd() {
  if (!quickAddText.value.trim()) return;
  addItem(quickAddText.value.trim(), quickAddGroupKey.value, null);
  quickAddText.value = "";
}

function openEditModal(item) {
  selectedItem.value = item;
  isNewItem.value = false;
  showPopup.value = true;
}

function openSettings() {
  selectedItem.value = {
    text: "",
    groupKey: groupOptions.value[0]?.key,
    priorityKey: priorityOptions.value[0]?.key,
  };
  isNewItem.value = true;
  settingsMode.value = true;
  showPopup.value = true;
}

function confirmPopup() {
  showPopup.value = false;
  markUnsaved();
}

function addGroup() {
  if (!newGroup.value.name) return;
  groupOptions.value.push({ key: nextGroupKey.value, ...newGroup.value });
  newGroup.value = { name: "", color: "#666666" };
  markUnsaved();
}

function addPriority() {
  if (!newPriority.value.name) return;
  priorityOptions.value.push({ key: nextPriorityKey.value, ...newPriority.value });
  newPriority.value = { name: "", color: "#ef4444" };
  markUnsaved();
}

async function handleRefresh() {
  if (hasUnsavedChanges.value && !confirm("You have unsaved changes. Discard them?")) return;
  await fetchAll();
  message.success("Refreshed");
}

async function handleSave() {
  try {
    await saveAll();
    message.success("All changes saved");
  } catch {
    message.error("Failed to save");
  }
}

onMounted(() => {
  fetchAll();
});
</script>

<style scoped>
.todo-page {
  padding: var(--space-6);
  max-width: var(--max-width);
  margin: 0 auto;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.page-title {
  font-size: var(--font-size-hero);
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: var(--tracking-tight);
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

.quick-add-container {
  margin-bottom: var(--space-6);
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
  background-color: var(--color-bg-elevated);
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
  box-shadow: 0 0 0 1px var(--color-primary);
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
  background-color: var(--color-bg-base);
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
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--color-primary), 0.4); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 6px rgba(var(--color-primary), 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--color-primary), 0); }
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
  }
}
</style>
