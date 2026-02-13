<template>
  <div class="todo-page">
    <header class="todo-header">
      <div class="header-content">
        <h1 class="page-title">Tasks</h1>
        <p class="page-subtitle">Manage your priorities</p>
      </div>
      <div class="header-actions">
         <BaseButton class="action-btn" variant="secondary" @click="openSettings(null)">
            <span>Options</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:6px"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 .51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
         </BaseButton>
         <div class="primary-actions">
             <BaseButton class="action-btn" variant="ghost" @click="refreshList">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
             </BaseButton>
             <BaseButton class="icon-only-mobile" :variant="hasUnsavedChanges ? 'primary' : 'secondary'" :class="{ 'pulse-animation': hasUnsavedChanges }" @click="saveTodos">
                <span class="desktop-text">{{ hasUnsavedChanges ? 'Save Changes' : 'Saved' }}</span>
                <span class="mobile-text"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg></span>
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
                :style="{ color: quickAddGroupKey ? getGroupColor(quickAddGroupKey) : 'var(--text-muted)' }"
             >
                 <option :value="null">Default</option>
                 <option v-for="g in groupOptions" :key="g.key" :value="g.key">{{ g.name }}</option>
            </select>
            <BaseInput
                v-model="quickAddText"
                placeholder="Add new task..."
                class="quick-input-flex"
                @keyup.enter="handleQuickAdd"
            >
                <template #suffix>
                     <button class="quick-add-btn" @click="handleQuickAdd">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                     </button>
                </template>
            </BaseInput>
        </div>
    </div>

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

             <!-- Task Item -->
             <div
                class="task-item"
                :class="{ 'is-completed': item.completed }"
                @click="openEditModal(item)"
             >
                <div class="task-priority-indicator" :style="{ backgroundColor: getPriorityColorByKey(item.priorityKey) }"></div>

                <!-- Delete Button (Left side) -->
                <button class="delete-btn" @click.stop="deleteItem(item)">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>

                <!-- Custom Checkbox (Moved after delete button but before content) -->
                 <div
                    class="custom-checkbox"
                    :class="{ 'checked': item.completed }"
                    :style="{ borderColor: item.completed ? 'var(--color-primary)' : 'var(--border-color)' }"
                    @click.stop="toggleCompletion(item)"
                >
                    <svg v-if="item.completed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>

                <div class="task-content">
                    <span class="task-text">{{ item.text }}</span>
                </div>

             </div>
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
                         <button class="icon-btn-danger" @click="removeGroup(idx)">×</button>
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
                         <button class="icon-btn-danger" @click="removePriority(idx)">×</button>
                    </div>
                    <div class="option-row add-new">
                        <input v-model="newPriority.name" class="mini-input" placeholder="New Priority" />
                        <input type="color" v-model="newPriority.color" class="color-picker" />
                        <button class="icon-btn-primary" @click="addPriority">+</button>
                    </div>
                 </div>

                 <div class="options-actions">
                     <BaseButton size="sm" variant="secondary" @click="resetDefaults">Reset Defaults</BaseButton>
                     <BaseButton size="sm" variant="primary" @click="saveMeta">Save Options</BaseButton>
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
import { computed,  onMounted, ref  } from "vue";
import { getData, postData } from "@/services/dynamoService.js";
import { message } from "ant-design-vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseModal from "@/components/base/BaseModal.vue";

// State
const items = ref([]);
const quickAddText = ref("");
const quickAddGroupKey = ref(null);
const showPopup = ref(false);
const isNewItem = ref(false);
const settingsMode = ref(false);
const hasUnsavedChanges = ref(false);

// Options
const groupOptions = ref([]);
const priorityOptions = ref([]);
const newGroup = ref({ name: "", color: "#666666" });
const newPriority = ref({ name: "", color: "#ff0000" });

// Selected Item for Edit
const selectedItem = ref({ text: '', groupKey: null, priorityKey: null });

// Helpers
const nextGroupKey = computed(() => groupOptions.value.length ? Math.max(...groupOptions.value.map(g => g.key ?? 0)) + 1 : 1);
const nextPriorityKey = computed(() => priorityOptions.value.length ? Math.max(...priorityOptions.value.map(p => p.key ?? 0)) + 1 : 1);
const priorityOrder = computed(() => {
    const map = {};
    priorityOptions.value.forEach((p, idx) => map[p.key] = idx);
    return map;
});

// Computed Sort
const sortedItems = computed(() => {
    return [...items.value].sort((a, b) => {
        if (a.groupKey !== b.groupKey) {
            const ai = groupOptions.value.findIndex(g => g.key === a.groupKey);
            const bi = groupOptions.value.findIndex(g => g.key === b.groupKey);
            return ai - bi;
        }
        return (priorityOrder.value[b.priorityKey] || 0) - (priorityOrder.value[a.priorityKey] || 0);
    });
});

// Logic
const getGroupNameByKey = (key) => groupOptions.value.find(x => x.key === key)?.name || "Default";
const getGroupColor = (key) => groupOptions.value.find(x => x.key === key)?.color || "var(--text-muted)";
const getPriorityColorByKey = (key) => priorityOptions.value.find(x => x.key === key)?.color || "#666";

const markUnsaved = () => {
    hasUnsavedChanges.value = true;
};

const handleQuickAdd = () => {
    if(!quickAddText.value.trim()) return;
    const newItem = {
        id: Date.now(),
        text: quickAddText.value,
        groupKey: quickAddGroupKey.value || (groupOptions.value[0]?.key ?? null),
        priorityKey: priorityOptions.value[0]?.key ?? null,
        completed: false
    };
    items.value.unshift(newItem);
    quickAddText.value = "";
    markUnsaved();
};

const openEditModal = (item) => {
    selectedItem.value = item;
    ensureValidSelection();
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

const toggleCompletion = (item) => {
    item.completed = !item.completed;
    markUnsaved();
};

const deleteItem = (item) => {
    const idx = items.value.findIndex(i => i.id === item.id);
    if(idx !== -1) {
        items.value.splice(idx, 1);
        markUnsaved();
    }
}

const ensureValidSelection = () => {
  if (!selectedItem.value) return;
  if (!groupOptions.value.some((g) => g.key === selectedItem.value.groupKey)) {
    selectedItem.value.groupKey = groupOptions.value[0]?.key ?? null;
  }
  if (!priorityOptions.value.some((p) => p.key === selectedItem.value.priorityKey)) {
    selectedItem.value.priorityKey = priorityOptions.value[0]?.key ?? null;
  }
};

// Option Management
const addGroup = () => {
    if(!newGroup.value.name) return;
    groupOptions.value.push({ key: nextGroupKey.value, name: newGroup.value.name, color: newGroup.value.color });
    newGroup.value = { name: "", color: "#666666" };
    markUnsaved();
};
const removeGroup = (idx) => {
    groupOptions.value.splice(idx, 1);
    markUnsaved();
};
const addPriority = () => {
    if(!newPriority.value.name) return;
    priorityOptions.value.push({ key: nextPriorityKey.value, name: newPriority.value.name, color: newPriority.value.color });
    newPriority.value = { name: "", color: "#ff0000" };
    markUnsaved();
};
const removePriority = (idx) => {
    priorityOptions.value.splice(idx, 1);
    markUnsaved();
};

const toggleSettingsMode = () => settingsMode.value = !settingsMode.value;

// Persistence
const loadMeta = async () => {
  try {
    const raw = await getData("todo", "meta");
    const meta = typeof raw === "string" ? JSON.parse(raw) : raw;
    if(meta?.groups) groupOptions.value = meta.groups;
    if(meta?.priorities) priorityOptions.value = meta.priorities;
    if(!groupOptions.value.length) groupOptions.value = [{key: 1, name: 'Default', color: '#42b983'}];
    if(!priorityOptions.value.length) priorityOptions.value = [{key: 1, name: 'High', color: '#ef4444'}];
  } catch (e) { console.error(e); }
};

const saveMeta = async () => {
    const meta = { groups: groupOptions.value, priorities: priorityOptions.value, updatedAt: Date.now() };
    await postData("todo", "meta", "meta", JSON.stringify(meta));
    // Meta saves are still instant or coupled with Todos?
    // Usually meta options are saved instantly or with the whole batch.
    // Let's assume options are saved instantly for now to avoid complexity,
    // OR coupled. User said "save button ... final reflect".
    // Let's keep meta save instant for now as it's separate modal,
    // BUT user might expect Save button to do everything.
    // Changing implementation to MARK UNSAVED for options too, and save everything on SAVE button.

    // Actually, saveMeta was called in 'Options Manager' explicitly.
    // Let's keep explicit save for options inside the modal for now to avoid losing config if they cancel the modal?
    // Wait, confirmPopup handles 'Done'.
    // Let's make 'Save Options' inside modal just close settings mode or mark unsaved.
    // For now, I will keep saveMeta as is BUT mark unsaved so user knows to sync everything?
    // No, let's make saveMeta ALSO just mark unsaved and save on main button for consistency?
    // User request: "save button to final reflect".
    // So let's make saveMeta internal-only until Main Save.
    markUnsaved();
    message.success("Options updated (Remember to Save)");
};

const loadItems = async () => {
    try {
        const raw = await getData("todo", "todo");
        items.value = raw || [];
        items.value.forEach(it => {
            if(!groupOptions.value.some(g => g.key === it.groupKey)) it.groupKey = groupOptions.value[0]?.key;
            if(!priorityOptions.value.some(p => p.key === it.priorityKey)) it.priorityKey = priorityOptions.value[0]?.key;
        });
        hasUnsavedChanges.value = false;
    } catch(e) { console.error(e); }
};

const refreshList = async () => {
    if(hasUnsavedChanges.value) {
        if(!confirm("You have unsaved changes. Discard them?")) return;
    }
    await loadMeta();
    await loadItems();
    hasUnsavedChanges.value = false;
    message.success("Refreshed");
}

const saveTodos = async () => {
    try {
        // Save Todo List
        await postData("todo", "todo", "todo", JSON.stringify(items.value));

        // Save Meta (Groups/Priorities) as well, to ensure consistency
        const meta = { groups: groupOptions.value, priorities: priorityOptions.value, updatedAt: Date.now() };
        await postData("todo", "meta", "meta", JSON.stringify(meta));

        hasUnsavedChanges.value = false;
        message.success("All changes saved");
    } catch(e) {
        console.error(e);
        message.error("Failed to save");
    }
};

const resetDefaults = async () => {
    await loadMeta();
    message.info("Reloaded options");
};

onMounted(async () => {
    await loadMeta();
    await loadItems();
});

// Warn before leave if unsaved
// window.onbeforeunload = () => hasUnsavedChanges.value ? true : null;
</script>

<style scoped>
.todo-page {
    padding: var(--space-xl);
    max-width: var(--max-width);
    margin: 0 auto;
    padding-bottom: 120px; /* Nav overlap fix */
}

.todo-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: var(--space-xl);
}
.page-title {
    font-size: var(--text-3xl);
    font-weight: 800;
    margin: 0;
}
.page-subtitle {
     color: var(--text-muted);
     margin-top: var(--space-xs);
}
.header-actions {
    display: flex;
    gap: var(--space-sm);
    flex-wrap: nowrap;
}
.primary-actions {
    display: flex;
    gap: var(--space-sm);
}

/* Responsive */
.mobile-text { display: none; }
@media (max-width: 640px) {
    .desktop-text { display: none; }
    .mobile-text { display: block; }
    .page-title { font-size: var(--text-2xl); }
}

/* List */
.task-list-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}
.group-header {
    font-size: var(--text-sm);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: var(--space-md);
    margin-bottom: var(--space-xs);
    padding-left: var(--space-xs);
}

.task-item {
    background-color: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--space-md) var(--space-lg);
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
    min-height: 60px;
}
.task-item:hover {
    border-color: var(--border-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}
.task-priority-indicator {
    width: 6px;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
}

.task-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.task-text {
    font-size: var(--text-lg);
    color: var(--text-main);
    font-weight: 500;
}

/* Delete Button */
.delete-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0;
    opacity: 0.5;
    transition: all 0.2s;
}
.delete-btn:hover {
    color: var(--color-danger);
    opacity: 1;
}

/* Custom Checkbox */
.custom-checkbox {
    width: 28px;
    height: 28px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    background: rgba(0,0,0,0.2);
    cursor: pointer;
}
.custom-checkbox.checked {
    border-color: var(--color-primary);
    background: rgba(66, 185, 131, 0.1);
}
.custom-checkbox:hover {
    border-color: var(--color-primary-hover);
}

.is-completed .task-text {
    opacity: 0.5;
    text-decoration: line-through;
    color: var(--text-muted);
}

/* Edit Form & Options styles unchanged ... */
.edit-form { display: flex; flex-direction: column; gap: var(--space-lg); }
.form-row { display: flex; gap: var(--space-md); }
.form-group { flex: 1; display: flex; flex-direction: column; gap: var(--space-xs); }
.form-group label { font-size: var(--text-xs); color: var(--text-muted); }
.select-wrapper { position: relative; }
.base-select { width: 100%; height: 48px; padding: 0 var(--space-md); background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-main); appearance: none; outline: none; }
.base-select:focus { border-color: var(--color-primary); }
.options-toggle { display: flex; align-items: center; justify-content: space-between; padding: var(--space-sm) 0; cursor: pointer; color: var(--text-muted); font-size: var(--text-sm); border-top: 1px solid var(--border-color); }
.options-manager { background: rgba(0,0,0,0.2); padding: var(--space-md); border-radius: var(--radius-md); }
.option-section { margin-bottom: var(--space-md); }
.option-section h4 { margin: 0 0 var(--space-sm) 0; font-size: var(--text-sm); color: var(--text-muted); }
.option-row { display: flex; gap: var(--space-sm); margin-bottom: var(--space-xs); }
.mini-input { flex: 1; background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-main); padding: 4px 8px; border-radius: var(--radius-sm); }
.color-picker { width: 32px; height: 32px; padding: 0; border: none; background: none; cursor: pointer; }
.icon-btn-danger, .icon-btn-primary { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; border-radius: var(--radius-sm); cursor: pointer; }
.icon-btn-danger { background: rgba(239, 68, 68, 0.2); color: var(--color-danger); }
.icon-btn-primary { background: rgba(66, 185, 131, 0.2); color: var(--color-primary); }
.options-actions { display: flex; justify-content: flex-end; gap: var(--space-sm); margin-top: var(--space-md); }

/* Quick Add */
.quick-add-container { margin-bottom: var(--space-xl); }
.quick-add-btn { background: none; border: none; color: var(--color-primary); cursor: pointer; display: flex; align-items: center; padding: 0 var(--space-sm); }
.quick-add-btn:hover { color: var(--color-primary-hover); }


@keyframes pulse-primary {
    0% { box-shadow: 0 0 0 0 rgba(66, 185, 131, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(66, 185, 131, 0); }
    100% { box-shadow: 0 0 0 0 rgba(66, 185, 131, 0); }
}
.pulse-animation {
    animation: pulse-primary 2s infinite;
}
.quick-add-wrapper {
    display: flex;
    gap: var(--space-sm);
}

.quick-group-select {
    width: 130px;
    padding: 0 var(--space-md);
    background-color: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-main);
    font-size: var(--text-base);
    appearance: none;
    outline: none;
    cursor: pointer;
    transition: all 0.2s;
}
.quick-group-select:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.quick-input-flex {
    flex: 1;
}

@media (max-width: 640px) {
    .header-actions {
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
    }

    .primary-actions {
        display: flex;
        gap: 8px; /* Gap between refresh and save */
    }

    .quick-add-wrapper {
        flex-direction: column;
    }

    .quick-group-select {
        width: 100%;
        height: 48px; /* Match input height */
    }
}
</style>
