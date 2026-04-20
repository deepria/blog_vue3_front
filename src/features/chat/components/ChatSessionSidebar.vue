<template>
  <div class="sidebar-shell">
    <div class="sidebar-header">
      <BaseButton type="primary" block @click="$emit('create')">
        <plus-outlined /> New Chat
      </BaseButton>
    </div>
    <div class="session-list">
      <template v-for="session in sessions" :key="session.id">
        <div
          class="session-item"
          :class="{ active: currentSessionId === session.id }"
          @click="$emit('select', session.id)"
        >
          <div class="session-title">
            <message-outlined class="session-icon" />
            <span class="text-truncate">{{ session.title || "New Chat" }}</span>
          </div>
          <a-button type="text" size="small" class="delete-btn" @click.stop="$emit('delete', session.id)">
            <delete-outlined />
          </a-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { DeleteOutlined, MessageOutlined, PlusOutlined } from "@ant-design/icons-vue";
import BaseButton from "@/shared/ui/BaseButton.vue";

defineProps({
  sessions: {
    type: Array,
    default: () => [],
  },
  currentSessionId: {
    type: String,
    default: null,
  },
});

defineEmits(["create", "select", "delete"]);
</script>

<style scoped>
.sidebar-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #ffffff;
}

.sidebar-header {
  padding: 16px;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px 12px;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.015);
  color: #ffffff;
}

.session-item.active {
  background: rgba(66, 184, 131, 0.12);
}

.session-title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  opacity: 0.7;
}
</style>
