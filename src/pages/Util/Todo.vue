<template>
  <div class="todo-page">
    <header class="todo-header">
      <div class="header-copy">
        <h1 class="page-title">Tasks</h1>
      </div>
      <div class="header-actions">
        <BaseButton class="action-btn" variant="secondary" @click="openSettings">Options</BaseButton>
        <div class="primary-actions">
          <BaseButton class="action-btn" variant="ghost" @click="handleRefresh">Refresh</BaseButton>
          <BaseButton
            :variant="hasUnsavedChanges ? 'primary' : 'secondary'"
            :class="{ 'pulse-animation': hasUnsavedChanges }"
            @click="handleSave"
          >
            {{ hasUnsavedChanges ? "Save Changes" : "Saved" }}
          </BaseButton>
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
  max-width: 1200px;
  margin: 0 auto;
}

.todo-header,
.header-actions,
.primary-actions,
.form-row,
.option-row {
  display: flex;
  gap: 12px;
}

.todo-header {
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.quick-add-container {
  margin-bottom: 24px;
}

.edit-form {
  display: grid;
  gap: 16px;
}

.form-group,
.option-section {
  flex: 1;
}

.base-select,
.mini-input {
  width: 100%;
}

.base-select,
.mini-input {
  background: #000000;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  min-height: 40px;
  padding: 0 12px;
}

.mini-input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.color-picker {
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  min-height: 40px;
}
</style>
