import { ref, computed } from 'vue';
import { todoApi } from '../api/todoApi';

export function useTodos() {
  const items = ref([]);
  const groupOptions = ref([]);
  const priorityOptions = ref([]);
  const hasUnsavedChanges = ref(false);

  // Computed state
  const nextGroupKey = computed(() => groupOptions.value.length ? Math.max(...groupOptions.value.map(g => g.key ?? 0)) + 1 : 1);
  const nextPriorityKey = computed(() => priorityOptions.value.length ? Math.max(...priorityOptions.value.map(p => p.key ?? 0)) + 1 : 1);
  
  const priorityOrder = computed(() => {
    const map = {};
    priorityOptions.value.forEach((p, idx) => map[p.key] = idx);
    return map;
  });

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

  // Action Helpers
  const markUnsaved = () => {
    hasUnsavedChanges.value = true;
  };

  const loadMeta = async () => {
    try {
      const meta = await todoApi.fetchMeta();
      if(meta?.groups) groupOptions.value = meta.groups;
      if(meta?.priorities) priorityOptions.value = meta.priorities;
      if(!groupOptions.value.length) groupOptions.value = [{key: 1, name: 'Default', color: '#42b983'}];
      if(!priorityOptions.value.length) priorityOptions.value = [{key: 1, name: 'High', color: '#ef4444'}];
    } catch (e) {
      console.error(e);
    }
  };

  const loadItems = async () => {
    try {
      items.value = await todoApi.fetchTodos();
      // Ensure validity on load
      items.value.forEach(it => {
        if(!groupOptions.value.some(g => g.key === it.groupKey)) it.groupKey = groupOptions.value[0]?.key;
        if(!priorityOptions.value.some(p => p.key === it.priorityKey)) it.priorityKey = priorityOptions.value[0]?.key;
      });
      hasUnsavedChanges.value = false;
    } catch(e) { 
      console.error(e); 
    }
  };

  const fetchAll = async () => {
    await loadMeta();
    await loadItems();
  };

  const saveAll = async () => {
    try {
      items.value = await todoApi.saveTodos(items.value);
      const meta = { groups: groupOptions.value, priorities: priorityOptions.value };
      const savedMeta = await todoApi.saveMeta(meta);
      groupOptions.value = savedMeta.groups || groupOptions.value;
      priorityOptions.value = savedMeta.priorities || priorityOptions.value;
      hasUnsavedChanges.value = false;
      return true;
    } catch(e) {
      console.error(e);
      throw e;
    }
  };

  const addItem = (text, groupKey, priorityKey) => {
    const newItem = {
      id: Date.now(),
      text,
      groupKey: groupKey || (groupOptions.value[0]?.key ?? null),
      priorityKey: priorityKey || (priorityOptions.value[0]?.key ?? null),
      completed: false
    };
    items.value.unshift(newItem);
    markUnsaved();
  };

  const deleteItem = (id) => {
    const idx = items.value.findIndex(i => i.id === id);
    if(idx !== -1) {
      items.value.splice(idx, 1);
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
    sortedItems,
    nextGroupKey,
    nextPriorityKey,
    markUnsaved,
    fetchAll,
    saveAll,
    loadMeta,
    loadItems,
    addItem,
    deleteItem,
    toggleCompletion
  };
}
