import { ref } from "vue";

const EMPTY_ITEM = () => ({ text: "", groupKey: null, priorityKey: null });
const EMPTY_GROUP = () => ({ name: "", color: "#666666" });
const EMPTY_PRIORITY = () => ({ name: "", color: "#ef4444" });

export function useTodoEditor({
  groupOptions,
  priorityOptions,
  nextGroupKey,
  nextPriorityKey,
  markUnsaved,
}) {
  let editingTarget = null;
  const quickAddText = ref("");
  const showPopup = ref(false);
  const isNewItem = ref(false);
  const settingsMode = ref(false);
  const selectedItem = ref(EMPTY_ITEM());
  const newGroup = ref(EMPTY_GROUP());
  const newPriority = ref(EMPTY_PRIORITY());

  function addQuickItem(addItem) {
    const text = quickAddText.value.trim();
    if (!text) return;
    addItem(text, null, null);
    quickAddText.value = "";
  }

  function openEditModal(item) {
    editingTarget = item;
    selectedItem.value = { ...item };
    settingsMode.value = false;
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
    if (!settingsMode.value && editingTarget) {
      const changed = ["text", "groupKey", "priorityKey"].some(
        (key) => selectedItem.value[key] !== editingTarget[key],
      );
      if (changed) {
        Object.assign(editingTarget, selectedItem.value);
        markUnsaved();
      }
    }
    showPopup.value = false;
  }

  function addGroup() {
    if (!newGroup.value.name.trim()) return;
    groupOptions.value.push({ key: nextGroupKey.value, ...newGroup.value });
    newGroup.value = EMPTY_GROUP();
    markUnsaved();
  }

  function addPriority() {
    if (!newPriority.value.name.trim()) return;
    priorityOptions.value.push({
      key: nextPriorityKey.value,
      ...newPriority.value,
    });
    newPriority.value = EMPTY_PRIORITY();
    markUnsaved();
  }

  return {
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
  };
}
