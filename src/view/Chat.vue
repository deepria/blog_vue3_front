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
        <div 
          v-for="session in chatStore.sortedSessions" 
          :key="session.id"
          :class="['session-item', { active: chatStore.currentSessionId === session.id }]"
          @click="switchSession(session.id)"
        >
          <div class="session-title">
            <message-outlined class="session-icon" />
            <span class="text-truncate">{{ session.title || 'New Chat' }}</span>
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
      </div>
    </div>

    <!-- Mobile Drawer for Sidebar -->
    <a-drawer
      v-model:visible="drawerVisible"
      placement="left"
      :closable="false"
      class="mobile-sidebar-drawer"
      :bodyStyle="{ padding: 0, background: '#1f1f1f' }"
    >
      <div class="sidebar mobile">
        <div class="sidebar-header">
          <a-button type="primary" block @click="createNewSession">
            <plus-outlined /> New Chat
          </a-button>
        </div>
        <div class="session-list">
          <div 
            v-for="session in chatStore.sortedSessions" 
            :key="session.id"
            :class="['session-item', { active: chatStore.currentSessionId === session.id }]"
            @click="switchSession(session.id)"
          >
            <div class="session-title">
              <message-outlined class="session-icon" />
              <span class="text-truncate">{{ session.title || 'New Chat' }}</span>
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
        <div v-if="!currentMessages.length" class="empty-state">
          <robot-outlined class="empty-icon" />
          <p>안녕하세요! 무엇을 도와드릴까요?</p>
        </div>

        <div
          v-for="(msg, index) in currentMessages"
          :key="index"
          :class="['message-wrapper', msg.role === 'user' ? 'user' : 'assistant']"
        >
          <div class="avatar">
            <user-outlined v-if="msg.role === 'user'" />
            <robot-outlined v-else />
          </div>
          <div class="message-content">
            <div v-if="msg.role === 'user'" class="text-content">
              {{ msg.content }}
            </div>
            <div v-else class="markdown-content" :ref="el => setViewerRef(el, msg.content)"></div>
          </div>
        </div>
        
        <div v-if="chatStore.loading" class="message-wrapper assistant loading">
          <div class="avatar">
            <robot-outlined />
          </div>
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
            :loading="chatStore.loading"
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
import { useChatStore } from '@/store/chat';
import { 
  MessageOutlined, 
  SendOutlined, 
  UserOutlined, 
  RobotOutlined,
  PlusOutlined,
  MenuOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';

const chatStore = useChatStore();
const userInput = ref('');
const messagesContainer = ref(null);
const isMobile = ref(false);
const drawerVisible = ref(false);

// Reactive data from store
const currentMessages = computed(() => {
  return chatStore.currentSession?.messages || [];
});

const currentSessionTitle = computed(() => {
  return chatStore.currentSession?.title || 'New Chat';
});

// Responsive check
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Viewer handling
const setViewerRef = (el, content) => {
  // Use a unique key based on content length or timestamp to avoid collisions
  // But index is simple if we are careful. Here just re-init if needed.
  if (el) {
    // Check if viewer already exists for this element
    // Ideally we should manage viewers more robustly, but for now:
    el.innerHTML = ''; // Clear previous
    new Viewer({
      el: el,
      initialValue: content,
      theme: 'dark'
    });
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const handleSendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || chatStore.loading) return;
  
  userInput.value = '';
  await chatStore.sendMessage(text);
  await scrollToBottom();
};

const createNewSession = () => {
  chatStore.createSession();
  drawerVisible.value = false;
};

const switchSession = async (id) => {
  chatStore.selectSession(id);
  drawerVisible.value = false;
  await scrollToBottom();
};

const deleteSession = (id) => {
  chatStore.deleteSession(id);
};

onMounted(() => {
  chatStore.loadSessions();
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
  background-color: #121212;
  color: #e0e0e0;
  overflow: hidden;
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background-color: #1f1f1f;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar.mobile {
  width: 100%;
  height: 100%;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.session-item {
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #a0a0a0;
}

.session-item:hover {
  background-color: rgba(255, 255, 255, 0.04);
  color: #fff;
}

.session-item.active {
  background-color: rgba(23, 125, 220, 0.15);
  color: #177ddc;
}

.session-title {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  flex: 1;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
  color: #ff7875;
}

.session-item:hover .delete-btn {
  opacity: 1;
}

/* Main Chat Area Styles */
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #121212;
  min-width: 0; /* Prevent flex child overflow */
}

.mobile-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: rgba(31, 31, 31, 0.95);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 100;
  backdrop-filter: blur(10px);
}

.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(10px);
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
  background: rgba(82, 196, 26, 0.2);
  color: #52c41a;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(82, 196, 26, 0.3);
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Adjust top padding for mobile to account for header */
@media (max-width: 768px) {
  .messages-area {
    padding-top: 60px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  gap: 16px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.message-wrapper {
  display: flex;
  gap: 16px;
  max-width: 85%;
}

.message-wrapper.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #2c2c2c;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.user .avatar {
  background: #177ddc;
  color: white;
}

.assistant .avatar {
  background: linear-gradient(135deg, #722ed1 0%, #1890ff 100%);
  color: white;
}

.message-content {
  padding: 12px 16px;
  border-radius: 12px;
  background: #1f1f1f;
  border: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 0.95rem;
  line-height: 1.6;
}

.user .message-content {
  background: #177ddc;
  color: white;
  border: none;
  border-bottom-right-radius: 4px;
}

.assistant .message-content {
  border-top-left-radius: 4px;
  min-width: 200px;
}

.input-area {
  padding: 24px;
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: #2c2c2c;
  padding: 8px 8px 8px 16px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.3s;
}

.input-wrapper:focus-within {
  border-color: #177ddc;
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
  background: #888;
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
  color: #e0e0e0;
}

:deep(.toastui-editor-contents code) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ff7875;
}

:deep(.toastui-editor-contents pre) {
  background-color: #141414;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .input-area {
    padding: 16px;
    padding-bottom: 24px;
  }
}
</style>
