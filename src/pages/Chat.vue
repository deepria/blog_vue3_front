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

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  color: #ffffff;
}

.sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.07);
}

.chat-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 25;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(6, 10, 8, 0.85);
}

.status-badge {
  color: #ffffff;
}

:deep(.ant-input),
:deep(.ant-input-textarea textarea),
:deep(.ant-drawer),
:deep(.ant-drawer-body),
:deep(.ant-btn) {
  color: #ffffff;
}

@media (max-width: 768px) {
  .chat-container {
    padding-top: 52px;
  }
}
</style>
