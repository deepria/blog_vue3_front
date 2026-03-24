<template>
  <div class="main-layout">
    <!-- Mobile Sidebar Toggle -->
    <div class="mobile-header" v-if="isMobile">
      <a-button type="text" @click="drawerVisible = true">
        <menu-outlined />
      </a-button>
      <span>AI Assistant</span>
    </div>

    <!-- Sidebar (Desktop) -->
    <div class="sidebar" v-if="!isMobile">
      <div class="sidebar-header">
        <a-button type="primary" block @click="createNewSession">
          <plus-outlined /> New Chat
        </a-button>
      </div>
      <div class="session-list">
        <template v-for="session in (sortedSessions || [])" :key="session?.id || Math.random()">
          <div 
            v-if="session && session.id"
            :class="['session-item', { active: currentSessionId === session?.id }]"
            @click="switchSession(session.id)"
          >
            <div class="session-title">
              <message-outlined class="session-icon" />
              <span class="text-truncate">{{ session?.title || 'New Chat' }}</span>
            </div>
            <a-button 
              type="text" 
              size="small" 
              class="delete-btn"
              @click.stop="deleteSession(session.id)"
            >
              <delete-outlined />
            </a-button>
          </div>
        </template>
      </div>
    </div>

    <!-- Mobile Drawer for Sidebar -->
    <a-drawer
      v-model:open="drawerVisible"
      placement="left"
      :closable="false"
      class="mobile-sidebar-drawer"
      :bodyStyle="{ padding: 0, background: 'rgba(3, 5, 4, 0.78)' }"
    >
      <div class="sidebar mobile">
        <div class="sidebar-header">
          <a-button type="primary" block @click="createNewSession">
            <plus-outlined /> New Chat
          </a-button>
        </div>
        <div class="session-list">
          <template v-for="session in (sortedSessions || [])" :key="session?.id || 'm-' + Math.random()">
            <div 
              v-if="session && session.id"
              :class="['session-item', { active: currentSessionId === session?.id }]"
              @click="switchSession(session.id)"
            >
              <div class="session-title">
                <message-outlined class="session-icon" />
                <span class="text-truncate">{{ session?.title || 'New Chat' }}</span>
              </div>
              <a-button 
                type="text" 
                size="small" 
                class="delete-btn"
                @click.stop="deleteSession(session.id)"
              >
                <delete-outlined />
              </a-button>
            </div>
          </template>
        </div>
      </div>
    </a-drawer>

    <!-- Chat Area -->
    <div class="chat-container">
      <div class="chat-header" v-if="!isMobile">
        <h2><message-outlined /> {{ currentSessionTitle }}</h2>
        <span class="status-badge">Online</span>
      </div>

      <div class="messages-area" ref="messagesContainer">
        <div v-if="!currentMessages.length && !loading" class="empty-state">
          <robot-outlined class="empty-icon" />
          <p>안녕하세요! 무엇을 도와드릴까요?</p>
        </div>

        <div
          v-for="(msg, index) in currentMessages"
          :key="index"
          :class="['message-wrapper', msg.role === 'user' ? 'user' : 'assistant']"
        >
          <div class="message-content">
            <div class="specular-highlight"></div>
            <div v-if="msg.role === 'user'" class="text-content">
              {{ msg.content }}
            </div>
            <div v-else>
              <MarkdownViewer :content="msg.content" />
            </div>
          </div>
        </div>
        
        <div v-if="loading && currentMessages.length" class="message-wrapper assistant loading">
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="input-area">
        <div class="input-wrapper">
          <a-textarea
            v-model:value="userInput"
            placeholder="메시지를 입력하세요..."
            :auto-size="{ minRows: 1, maxRows: 4 }"
            @pressEnter.prevent="handleSendMessage"
          />
          <a-button 
            type="primary" 
            shape="circle" 
            @click="handleSendMessage" 
            :loading="loading"
            :disabled="!userInput.trim()"
          >
            <template #icon><send-outlined /></template>
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useChat } from '@/features/llm/composables/useChat';
import { 
  MessageOutlined, 
  SendOutlined,
  RobotOutlined,
  PlusOutlined,
  MenuOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';
import MarkdownViewer from '@/components/ui/MarkdownViewer.vue';

const {
  sortedSessions,
  currentSessionId,
  currentSession,
  loading,
  loadingSince,
  loadSessions,
  createSession,
  deleteSession: removeSession,
  selectSession,
  sendMessage,
  clearLoading
} = useChat();
const userInput = ref('');
const messagesContainer = ref(null);
const isMobile = ref(false);
const drawerVisible = ref(false);

// Reactive data from store
const currentMessages = computed(() => {
  return currentSession.value?.messages || [];
});

const currentSessionTitle = computed(() => {
  return currentSession.value?.title || 'New Chat';
});

// Responsive check
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// View removed, integrated in MarkdownViewer

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const handleSendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || loading.value) return;
  
  userInput.value = '';
  await sendMessage(text);
  await scrollToBottom();
};

const createNewSession = () => {
  createSession();
  drawerVisible.value = false;
};

const switchSession = async (id) => {
  selectSession(id);
  drawerVisible.value = false;
  await scrollToBottom();
};

const deleteSession = (id) => {
  removeSession(id);
};

onMounted(() => {
  loadSessions();
  if (loading.value && loadingSince.value && Date.now() - loadingSince.value > 35000) {
    clearLoading();
  }
  checkMobile();
  window.addEventListener('resize', checkMobile);
  scrollToBottom();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  background-color: transparent;
  color: var(--color-text-primary);
  overflow: hidden;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.028), rgba(255, 255, 255, 0.006)),
    rgba(255, 255, 255, 0.02);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: 20;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.03);
}

.sidebar.mobile {
  width: 100%;
  height: 100%;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  padding: 12px 14px;
  min-height: 52px;
  border-radius: 18px;
  cursor: pointer;
  transition: transform 0.22s ease, background-color 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, color 0.22s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.78);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.022), rgba(255, 255, 255, 0.008)),
    rgba(255, 255, 255, 0.014);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
}

.session-item:hover {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012)),
    rgba(255, 255, 255, 0.022);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.11);
  transform: translateX(2px);
}

.session-item.active {
  background:
    linear-gradient(180deg, rgba(66, 184, 131, 0.16), rgba(66, 184, 131, 0.06)),
    rgba(255, 255, 255, 0.026);
  color: #f5fff9;
  border-color: rgba(66, 184, 131, 0.24);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.session-title {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  flex: 1;
}

.session-icon {
  color: rgba(66, 184, 131, 0.88);
  font-size: 15px;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}

.delete-btn {
  opacity: 0.72;
  transition: opacity 0.2s;
  color: rgba(255, 255, 255, 0.48);
  border-radius: 12px;
}

.session-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #ff8f8d;
  background: rgba(255, 255, 255, 0.035);
}

/* Main Chat Area Styles */
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: transparent;
  min-width: 0; /* Prevent flex child overflow */
  min-height: 0;
}

.mobile-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.008)),
    rgba(3, 5, 4, 0.58);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  z-index: 100;
  backdrop-filter: blur(18px);
}

.chat-header {
  padding: 24px var(--space-8);
  border-bottom: var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  z-index: 10;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
}

.status-badge {
  font-size: 0.75rem;
  background: rgba(66, 184, 131, 0.08);
  color: #d7ffe9;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(66, 184, 131, 0.18);
}

.messages-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Adjust top padding for mobile to account for header */
@media (max-width: 768px) {
  .main-layout {
    height: calc(100dvh - 92px - var(--safe-bottom));
    max-height: calc(100dvh - 92px - var(--safe-bottom));
    overflow: hidden;
  }

  .chat-container {
    min-height: 0;
  }

  .messages-area {
    min-height: 0;
    padding-top: 60px;
    padding-bottom: 104px;
  }

  .input-area {
    position: sticky;
    bottom: 0;
    z-index: 120;
    padding: 12px 16px 0;
    background: transparent;
    border-top: none;
    backdrop-filter: none;
  }

  .messages-area {
    gap: 18px;
    padding-left: 14px;
    padding-right: 14px;
  }

  .message-wrapper {
    max-width: 96%;
  }

  .message-content {
    width: 100%;
    padding: 12px 14px;
  }

  .assistant .message-content {
    min-width: 0;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.64);
  gap: 16px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.message-wrapper {
  display: flex;
  max-width: 88%;
}

.message-wrapper.user {
  align-self: flex-end;
}

.message-content {
  padding: 14px 18px;
  border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  font-size: 0.95rem;
  line-height: 1.6;
  box-shadow: var(--glass-shadow);
  position: relative;
  overflow: hidden;
}

.specular-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  z-index: 5;
}

.user .message-content {
  background: linear-gradient(135deg, var(--color-primary) 0%, #1f6b4b 100%);
  color: white;
  border: none;
  border-top-right-radius: 4px;
  box-shadow: var(--glass-shadow);
}
.user .message-content::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--surface-gloss);
  opacity: 0.2;
}

.assistant .message-content {
  border-top-left-radius: 4px;
  min-width: 200px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.008)),
    var(--glass-bg-elevated);
}
.assistant .message-content::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--surface-gloss);
  opacity: 0.4;
  pointer-events: none;
}

.input-area {
  padding: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.006)),
    rgba(3, 5, 4, 0.42);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.025);
  padding: 8px 8px 8px 16px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: border-color 0.3s;
  backdrop-filter: blur(18px);
}

.input-wrapper :deep(.ant-input-textarea) {
  flex: 1;
  min-width: 0;
}

.input-wrapper:focus-within {
  border-color: rgba(66, 184, 131, 0.28);
}

.input-wrapper :deep(.ant-input) {
  background: transparent;
  border: none;
  color: #fff;
  padding: 8px 0;
  box-shadow: none !important;
  resize: none;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.58);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Toast UI Editor Dark Theme Overrides */
:deep(.toastui-editor-contents) {
  font-family: inherit;
  font-size: 0.95rem;
}

:deep(.toastui-editor-contents p) {
  color: rgba(255, 255, 255, 0.92);
}

:deep(.toastui-editor-contents code) {
  background-color: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

:deep(.toastui-editor-contents pre) {
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}
</style>
