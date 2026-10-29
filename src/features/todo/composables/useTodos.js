import { ref, computed } from "vue";
import { todoApi } from "../api/todoApi";

export function useTodos() {
  const items = ref([]),
    groupOptions = ref([]),
    priorityOptions = ref([]);
  const hasUnsavedChanges = ref(false),
    loading = ref(false),
    saving = ref(false),
    error = ref("");
  let version = 0;
  const nextGroupKey = computed(() =>
    groupOptions.value.length
      ? Math.max(...groupOptions.value.map((g) => g.key ?? 0)) + 1
      : 1,
  );
  const nextPriorityKey = computed(() =>
    priorityOptions.value.length
      ? Math.max(...priorityOptions.value.map((p) => p.key ?? 0)) + 1
      : 1,
  );
  const priorityOrder = computed(() =>
    Object.fromEntries(priorityOptions.value.map((p, i) => [p.key, i])),
  );
  const sortedItems = computed(() =>
    [...items.value].sort((a, b) =>
      a.groupKey !== b.groupKey
        ? groupOptions.value.findIndex((g) => g.key === a.groupKey) -
          groupOptions.value.findIndex((g) => g.key === b.groupKey)
        : (priorityOrder.value[b.priorityKey] || 0) -
          (priorityOrder.value[a.priorityKey] || 0),
    ),
  );
  const markUnsaved = () => {
    version++;
    hasUnsavedChanges.value = true;
  };
  // Fetch all parts before replacing any live data. A partial failure must not
  // discard an edited list or reset metadata to defaults.
  const fetchAll = async () => {
    if (loading.value || saving.value) return false;
    const startingVersion = version;
    loading.value = true;
    error.value = "";
    try {
      const [meta, todos] = await Promise.all([
        todoApi.fetchMeta(),
        todoApi.fetchTodos(),
      ]);
      if (version !== startingVersion) return false;
      const groups = meta?.groups?.length
        ? meta.groups
        : [{ key: 1, name: "기본 그룹", color: "#42b983" }];
      const priorities = meta?.priorities?.length
        ? meta.priorities
        : [{ key: 1, name: "높음", color: "#ef4444" }];
      items.value = todos.map((item) => ({
        ...item,
        groupKey:
          item.groupKey != null && !groups.some((g) => g.key === item.groupKey)
            ? groups[0].key
            : item.groupKey,
        priorityKey: priorities.some((p) => p.key === item.priorityKey)
          ? item.priorityKey
          : priorities[0].key,
      }));
      groupOptions.value = groups;
      priorityOptions.value = priorities;
      hasUnsavedChanges.value = false;
      return true;
    } catch {
      error.value = "할 일을 불러오지 못했습니다. 기존 내용은 유지됩니다.";
      return false;
    } finally {
      loading.value = false;
    }
  };
  const saveAll = async () => {
    if (saving.value || loading.value || error.value) return false;
    const revision = version;
    const list = items.value.map((item) => ({ ...item }));
    const meta = {
      groups: groupOptions.value.map((g) => ({ ...g })),
      priorities: priorityOptions.value.map((p) => ({ ...p })),
    };
    saving.value = true;
    try {
      // Do not overwrite the live draft with a response to an older snapshot.
      await todoApi.saveTodos(list);
      await todoApi.saveMeta(meta);
      if (version === revision) hasUnsavedChanges.value = false;
      return true;
    } finally {
      saving.value = false;
    }
  };
  const addItem = (text, groupKey, priorityKey) => {
    items.value.unshift({
      id: Date.now(),
      text,
      groupKey: groupKey ?? null,
      priorityKey: priorityKey ?? priorityOptions.value[0]?.key ?? null,
      completed: false,
    });
    markUnsaved();
  };
  const deleteItem = (id) => {
    const index = items.value.findIndex((i) => i.id === id);
    if (index !== -1) {
      items.value.splice(index, 1);
      markUnsaved();
    }
  };
  const toggleCompletion = (item) => {
    item.completed = !item.completed;
    markUnsaved();
  };
  return {
    items,
    groupOptions,
    priorityOptions,
    hasUnsavedChanges,
    loading,
    saving,
    error,
    sortedItems,
    nextGroupKey,
    nextPriorityKey,
    markUnsaved,
    fetchAll,
    saveAll,
    addItem,
    deleteItem,
    toggleCompletion,
  };
}
