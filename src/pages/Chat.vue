<template>
  <div class="chat-workspace">
    <div class="mobile-header" v-if="isMobile">
      <a-button type="text" class="icon-button" aria-label="대화 목록 열기" @click="drawerVisible = true">
        <menu-outlined />
      </a-button>
      <span class="mobile-title">{{ currentSessionTitle }}</span>
      <a-button type="text" class="icon-button" aria-label="새 대화" @click="createNewSession">
        <plus-outlined />
      </a-button>
    </div>

    <aside class="sidebar" v-if="!isMobile">
      <ChatSessionSidebar
        :sessions="chatStore.sortedSessions"
        :current-session-id="chatStore.currentSessionId"
        @create="createNewSession"
        @select="switchSession"
        @delete="deleteSession"
        @rename="renameSession"
      />
    </aside>

    <a-drawer
      v-model:open="drawerVisible"
      placement="left"
      :closable="false"
      class="mobile-sidebar-drawer"
      :bodyStyle="{ padding: 0, background: 'var(--color-bg-surface)' }"
    >
      <div class="sidebar mobile">
        <ChatSessionSidebar
          :sessions="chatStore.sortedSessions"
          :current-session-id="chatStore.currentSessionId"
          @create="createNewSession"
          @select="switchSession"
          @delete="deleteSession"
          @rename="renameSession"
        />
      </div>
    </a-drawer>

    <main class="chat-container">
      <header class="chat-header" v-if="!isMobile">
        <div class="session-heading">
          <span class="session-avatar"><message-outlined /></span>
          <div>
            <h1>{{ currentSessionTitle }}</h1>
            <p>{{ messageCountLabel }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="toolbar-button" type="button" title="대화 다시 시도" :disabled="!currentMessages.length || chatStore.loading" @click="retryLastMessage">
            <reload-outlined />
          </button>
          <button class="toolbar-button primary" type="button" title="새 대화" @click="createNewSession">
            <plus-outlined />
          </button>
        </div>
      </header>

      <ChatMessageList
        :messages="currentMessages"
        :loading="chatStore.loading"
        @send-prompt="sendPrompt"
        @retry="retryMessage"
        @delete="deleteMessage"
      />

      <ChatComposer
        v-model="userInput"
        :loading="chatStore.loading"
        @send="handleSendMessage"
      />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { MenuOutlined, MessageOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons-vue";
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
const messageCountLabel = computed(() => {
  const count = currentMessages.value.length;
  if (!count) return "아직 메시지가 없습니다";
  return `${count}개의 메시지`;
});

function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

async function handleSendMessage() {
  const text = userInput.value.trim();
  if (!text || chatStore.loading) return;
  userInput.value = "";
  await chatStore.sendMessage(text);
}

async function sendPrompt(text) {
  userInput.value = text;
  await handleSendMessage();
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

function renameSession(payload) {
  chatStore.renameSession(payload.id, payload.title);
}

function deleteMessage(index) {
  chatStore.deleteMessage(index);
}

async function retryMessage(index) {
  await chatStore.retryMessage(index);
}

async function retryLastMessage() {
  await chatStore.retryLastMessage();
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
.chat-workspace {
  display: flex;
  height: 100dvh;
  overflow: hidden;
  background-color: var(--color-bg-base);
  padding: 20px;
  gap: 16px;
}

@media (max-width: 1024px) {
  .chat-workspace {
    height: calc(100dvh - 92px - env(safe-area-inset-bottom, 0px));
  }
}

.sidebar {
  width: 280px;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.sidebar.mobile {
  width: min(86vw, 320px);
  height: 100%;
  border: 0;
  border-radius: 0;
}

.chat-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  position: relative;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
  backdrop-filter: none;
  z-index: 10;
}

.session-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.session-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  flex-shrink: 0;
}

.chat-header h1 {
  max-width: min(52vw, 720px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

.chat-header p {
  margin: 3px 0 0;
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-button,
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.toolbar-button:hover:not(:disabled),
.icon-button:hover {
  background: var(--color-bg-panel);
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}

.toolbar-button:disabled {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.toolbar-button.primary {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-inverse);
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background-color: var(--glass-bg-elevated);
  backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--color-border);
  height: var(--header-height);
  font-weight: 600;
}

.mobile-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  color: var(--color-text-primary);
}

:deep(.ant-input),
:deep(.ant-input-textarea textarea),
:deep(.ant-drawer),
:deep(.ant-drawer-body),
:deep(.ant-btn) {
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .chat-workspace {
    padding: 0;
  }

  .chat-container {
    padding-top: var(--header-height);
    border: 0;
    border-radius: 0;
  }
}
</style>
