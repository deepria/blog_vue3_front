<template>
  <div class="main-layout">
    <div class="mobile-header" v-if="isMobile">
      <a-button type="text" @click="drawerVisible = true">
        <menu-outlined />
      </a-button>
      <span>AI Assistant</span>
    </div>

    <div class="sidebar" v-if="!isMobile">
      <ChatSessionSidebar
        :sessions="chatStore.sortedSessions"
        :current-session-id="chatStore.currentSessionId"
        @create="createNewSession"
        @select="switchSession"
        @delete="deleteSession"
      />
    </div>

    <a-drawer
      v-model:open="drawerVisible"
      placement="left"
      :closable="false"
      class="mobile-sidebar-drawer"
      :bodyStyle="{ padding: 0, background: 'rgba(3, 5, 4, 0.78)' }"
    >
      <div class="sidebar mobile">
        <ChatSessionSidebar
          :sessions="chatStore.sortedSessions"
          :current-session-id="chatStore.currentSessionId"
          @create="createNewSession"
          @select="switchSession"
          @delete="deleteSession"
        />
      </div>
    </a-drawer>

    <div class="chat-container">
      <div class="chat-header" v-if="!isMobile">
        <h2><message-outlined /> {{ currentSessionTitle }}</h2>
        <span class="status-badge">Online</span>
      </div>

      <ChatMessageList
        :messages="currentMessages"
        :loading="chatStore.loading"
      />

      <ChatComposer
        v-model="userInput"
        :loading="chatStore.loading"
        @send="handleSendMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { MenuOutlined, MessageOutlined } from "@ant-design/icons-vue";
import ChatComposer from "@/features/chat/components/ChatComposer.vue";
import ChatMessageList from "@/features/chat/components/ChatMessageList.vue";
import ChatSessionSidebar from "@/features/chat/components/ChatSessionSidebar.vue";
import { useChatStore } from "@/features/chat/store/chatStore";

const chatStore = useChatStore();
const userInput = ref("");
const isMobile = ref(false);
const drawerVisible = ref(false);

const currentMessages = computed(() => chatStore.currentSession?.messages || []);
const currentSessionTitle = computed(() => chatStore.currentSession?.title || "New Chat");

function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

async function handleSendMessage() {
  const text = userInput.value.trim();
  if (!text || chatStore.loading) return;
  userInput.value = "";
  await chatStore.sendMessage(text);
}

function createNewSession() {
  chatStore.createSession();
  drawerVisible.value = false;
}

function switchSession(id) {
  chatStore.selectSession(id);
  drawerVisible.value = false;
}

function deleteSession(id) {
  chatStore.deleteSession(id);
}

onMounted(() => {
  chatStore.initialize();
  if (chatStore.loading && chatStore.loadingSince && Date.now() - chatStore.loadingSince > 35000) {
    chatStore.clearLoading();
  }
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

/* ... replacing styles ... */
<style scoped>
.main-layout {
  display: flex;
  height: 100dvh;
  overflow: hidden;
  background-color: transparent;
}

@media (max-width: 1024px) {
  .main-layout {
    height: calc(100dvh - 92px - env(safe-area-inset-bottom, 0px));
  }
}

.sidebar {
  width: 280px;
  background-color: var(--color-bg-elevated);
  border-right: 1px solid var(--color-border);
}

.chat-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  z-index: 10;
}

.chat-header h2 {
  font-size: var(--font-size-title);
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.status-badge {
  font-size: var(--font-size-caption);
  color: var(--color-primary);
  background-color: var(--color-primary-glow);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-weight: 600;
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background-color: var(--glass-bg-elevated);
  backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--color-border);
  height: var(--header-height);
  font-weight: 600;
}

:deep(.ant-input),
:deep(.ant-input-textarea textarea),
:deep(.ant-drawer),
:deep(.ant-drawer-body),
:deep(.ant-btn) {
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .chat-container {
    padding-top: var(--header-height);
  }
}
</style>
