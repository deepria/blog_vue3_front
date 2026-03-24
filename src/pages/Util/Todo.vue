<template>
  <div class="todo-page">
    <header class="todo-header">
      <div class="header-copy">
        <h1 class="page-title">Tasks</h1>
      </div>
      <div class="header-actions">
        <BaseButton class="action-btn" variant="secondary" @click="openSettings(null)">
          <span>Options</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:6px"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 .51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </BaseButton>
        <div class="primary-actions">
          <BaseButton class="action-btn" variant="ghost" @click="handleRefresh">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          </BaseButton>
          <BaseButton class="icon-only-mobile" :variant="hasUnsavedChanges ? 'primary' : 'secondary'" :class="{ 'pulse-animation': hasUnsavedChanges }" @click="handleSave">
            <span class="desktop-text">{{ hasUnsavedChanges ? 'Save Changes' : 'Saved' }}</span>
            <span class="mobile-text">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            </span>
          </BaseButton>
        </div>
      </div>
    </header>

    <!-- Quick Add -->
    <div class="quick-add-container">
        <div class="quick-add-wrapper">
             <select
                v-model="quickAddGroupKey"
                class="quick-group-select"
                :style="{ color: quickAddGroupKey ? getGroupColor(quickAddGroupKey) : 'var(--color-text-muted)' }"
             >
                 <option :value="null">Default</option>
                 <option v-for="g in groupOptions" :key="g.key" :value="g.key">{{ g.name }}</option>
            </select>
            <BaseInput
                v-model="quickAddText"
                placeholder="Add new task..."
                class="quick-input-flex"
                @enter="handleQuickAdd"
            >
                <template #suffix>
                     <button class="quick-add-btn" @click="handleQuickAdd">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                     </button>
                </template>
            </BaseInput>
        </div>
    </div>

    <!-- Task List -->
    <div class="task-list-container">
       <transition-group name="list" tag="div">
          <template v-for="(item, index) in sortedItems" :key="item.id">
             <!-- Group Header -->
             <div
                v-if="index === 0 || sortedItems[index - 1].groupKey !== item.groupKey"
                class="group-header"
                :style="{ color: getGroupColor(item.groupKey) }"
             >
                {{ getGroupNameByKey(item.groupKey) }}
             </div>

             <!-- Task Component -->
             <TodoItem 
               :item="item"
               :priorityColor="getPriorityColorByKey(item.priorityKey)"
               @edit="openEditModal"
               @delete="deleteItem"
               @toggle="toggleCompletion"
             />
          </template>
       </transition-group>
    </div>

    <!-- Edit/Add Modal -->
    <BaseModal v-model="showPopup" :title="isNewItem ? 'New Task' : 'Edit Task'">
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

             <!-- Option Management Section (Toggleable) -->
            <div class="options-toggle" @click="toggleSettingsMode">
                <span>{{ settingsMode ? 'Hide Options Manager' : 'Manage Groups & Tags' }}</span>
                <svg :style="{ transform: settingsMode ? 'rotate(180deg)' : '' }" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>

            <div v-if="settingsMode" class="options-manager">
                 <!-- Group Manager -->
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

                 <!-- Priority Manager -->
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

                 <div class="options-actions">
                     <BaseButton size="sm" variant="secondary" @click="loadMeta">Reset Defaults</BaseButton>
                     <BaseButton size="sm" variant="primary" @click="confirmOptions">Save Options</BaseButton>
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
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import BaseInput from "@/components/ui/BaseInput.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import TodoItem from "@/features/todo/components/TodoItem.vue";
import { useTodos } from "@/features/todo/composables/useTodos";

// Using the composable for state & logic isolation
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
  loadMeta,
  addItem,
  deleteItem,
  toggleCompletion
} = useTodos();

// Component-specific (UI toggle) state
const quickAddText = ref("");
const quickAddGroupKey = ref(null);
const showPopup = ref(false);
const isNewItem = ref(false);
const settingsMode = ref(false);
const selectedItem = ref({ text: '', groupKey: null, priorityKey: null });

// Option addition state
const newGroup = ref({ name: "", color: "#666666" });
const newPriority = ref({ name: "", color: "#ef4444" });

const getGroupNameByKey = (key) => groupOptions.value.find(x => x.key === key)?.name || "Default";
const getGroupColor = (key) => groupOptions.value.find(x => x.key === key)?.color || "var(--color-text-muted)";
const getPriorityColorByKey = (key) => priorityOptions.value.find(x => x.key === key)?.color || "#666";

const handleQuickAdd = () => {
    if(!quickAddText.value.trim()) return;
    addItem(quickAddText.value, quickAddGroupKey.value, null);
    quickAddText.value = "";
};

const openEditModal = (item) => {
    selectedItem.value = item;
    isNewItem.value = false;
    showPopup.value = true;
};

const openSettings = () => {
   selectedItem.value = { text: '', groupKey: groupOptions.value[0]?.key, priorityKey: priorityOptions.value[0]?.key };
   isNewItem.value = true;
   settingsMode.value = true;
   showPopup.value = true;
};

const confirmPopup = () => {
    showPopup.value = false;
    markUnsaved();
};

const toggleSettingsMode = () => settingsMode.value = !settingsMode.value;

const addGroup = () => {
    if(!newGroup.value.name) return;
    groupOptions.value.push({ key: nextGroupKey.value, name: newGroup.value.name, color: newGroup.value.color });
    newGroup.value = { name: "", color: "#666666" };
    markUnsaved();
};

const addPriority = () => {
    if(!newPriority.value.name) return;
    priorityOptions.value.push({ key: nextPriorityKey.value, name: newPriority.value.name, color: newPriority.value.color });
    newPriority.value = { name: "", color: "#ef4444" };
    markUnsaved();
};

const confirmOptions = () => {
  markUnsaved();
  message.success("Options updated (Remember to Save)");
};

const handleRefresh = async () => {
    if(hasUnsavedChanges.value) {
        if(!confirm("You have unsaved changes. Discard them?")) return;
    }
    await fetchAll();
    message.success("Refreshed");
}

const handleSave = async () => {
    try {
        await saveAll();
        message.success("All changes saved");
    } catch(e) {
        message.error("Failed to save");
    }
};

onMounted(async () => {
    await fetchAll();
});
</script>

<style scoped>
/* Scoped styles that cannot be moved to UI components */
.todo-page {
    padding: var(--space-6);
    max-width: 900px;
    margin: 0 auto;
    padding-bottom: 120px;
}

.todo-header {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: var(--space-8);
}
.page-title {
    font-size: 2.5rem;
    font-weight: 900;
    margin: 0;
    background: linear-gradient(135deg, #fff 0%, #888 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.header-copy {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: flex-end;
}

.header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: nowrap;
}

.primary-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    width: auto;
}

.action-btn {
    white-space: nowrap;
}

.header-actions > .action-btn {
    width: auto;
}

.action-btn :deep(.base-button),
.icon-only-mobile :deep(.base-button) {
    min-width: 0;
}

.header-actions > .action-btn :deep(.base-button) {
    width: auto;
}

.action-btn :deep(.content),
.icon-only-mobile :deep(.content) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    white-space: nowrap;
}

.icon-only-mobile {
    flex: 1;
    min-width: 0;
}

.desktop-text,
.mobile-text {
    display: inline-flex;
    align-items: center;
}

.mobile-text {
    display: none;
}

.quick-add-container {
    margin-bottom: var(--space-12);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border: var(--glass-border);
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    box-shadow: var(--glass-shadow);
}

.task-list-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}
.group-header {
    font-size: var(--font-size-caption);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: var(--space-4);
    margin-bottom: var(--space-1);
    padding-left: var(--space-1);
}

.edit-form { display: flex; flex-direction: column; gap: var(--space-4); }
.form-row { display: flex; gap: var(--space-3); }
.form-group { flex: 1; display: flex; flex-direction: column; gap: var(--space-1); }
.form-group label { font-size: var(--font-size-caption); color: var(--color-text-muted); }
.select-wrapper { position: relative; }
.base-select { 
  width: 100%; height: 42px; padding: 0 var(--space-3); 
  background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border); 
  border-radius: 8px; color: var(--color-text-primary); appearance: none; outline: none; 
  transition: all 0.3s ease;
}
.base-select:focus { border-color: var(--color-primary); background: var(--glass-bg-hover); }

.options-toggle { display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) 0; cursor: pointer; color: var(--color-text-muted); font-size: var(--font-size-caption); border-top: 1px solid var(--color-border); }
.options-manager { 
  background: var(--glass-bg-elevated); 
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  padding: var(--space-4); 
  border-radius: 12px; 
  box-shadow: var(--glass-shadow);
}
.option-section { margin-bottom: var(--space-3); }
.option-section h4 { margin: 0 0 var(--space-2) 0; font-size: var(--font-size-caption); color: var(--color-text-muted); }
.option-row { display: flex; gap: var(--space-2); margin-bottom: var(--space-1); }
.mini-input { flex: 1; background: var(--color-bg-surface); border: 1px solid var(--color-border); color: var(--color-text-primary); padding: 4px 8px; border-radius: 4px; }
.color-picker { width: 32px; height: 32px; padding: 0; border: none; background: none; cursor: pointer; }

/* Adjusted for BaseButton variants handling icon buttons */
.icon-btn-danger, .icon-btn-primary { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; border-radius: 4px; cursor: pointer; }
.icon-btn-danger { background: rgba(239, 68, 68, 0.2); color: var(--color-danger, #ef4444); }
.icon-btn-primary { background: rgba(66, 184, 131, 0.2); color: var(--color-primary); }
.options-actions { display: flex; justify-content: flex-end; gap: var(--space-2); margin-top: var(--space-3); }

/* Quick Add */
.quick-add-container { margin-bottom: var(--space-6); }
.quick-add-btn { background: none; border: none; color: var(--color-primary); cursor: pointer; display: flex; align-items: center; padding: 0 var(--space-1); }
.quick-add-btn:hover { color: var(--color-primary-dark); }
.quick-add-wrapper { display: flex; gap: var(--space-2); }
.quick-group-select {
    width: 140px;
    padding: 0 var(--space-3);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: var(--glass-border);
    border-radius: 8px;
    font-size: var(--font-size-body);
    appearance: none;
    outline: none;
    cursor: pointer;
    transition: all 0.3s ease;
}
.quick-group-select:focus { border-color: var(--color-primary); background: var(--glass-bg-hover); box-shadow: 0 0 0 4px var(--color-primary-glow); }
.quick-input-flex { flex: 1; }

@media (max-width: 640px) {
    .todo-page {
        padding: var(--mobile-shell-gutter);
    }

    .todo-header {
        align-items: stretch;
        gap: 10px;
        margin-bottom: 16px;
    }

    .header-actions {
        width: auto;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex-wrap: nowrap;
    }

    .primary-actions {
        width: auto;
        min-width: 0;
    }

    .action-btn {
        flex: 0 0 auto;
    }

    .icon-only-mobile {
        min-width: 96px;
    }

    .icon-only-mobile :deep(.base-button) {
        width: auto;
    }

    .page-title {
        font-size: 2.4rem;
        line-height: 0.98;
    }

    .desktop-text {
        display: none;
    }

    .mobile-text {
        display: inline-flex;
    }

    .quick-add-wrapper { flex-direction: column; }
    .quick-group-select { width: 100%; height: 40px; }
}

@keyframes pulse-primary {
    0% { box-shadow: 0 0 0 0 rgba(66, 184, 131, 0.36); }
    70% { box-shadow: 0 0 0 10px rgba(66, 184, 131, 0); }
    100% { box-shadow: 0 0 0 0 rgba(66, 184, 131, 0); }
}
.pulse-animation {
    animation: pulse-primary 2s infinite;
}

/* List transition */
.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(30px); }
</style>
