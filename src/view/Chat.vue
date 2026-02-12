<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2><message-outlined /> AI Assistant</h2>
      <span class="status-badge">Online</span>
    </div>

    <div class="messages-area" ref="messagesContainer">
      <div v-if="messages.length === 0" class="empty-state">
        <robot-outlined class="empty-icon" />
        <p>안녕하세요! 무엇을 도와드릴까요?</p>
      </div>

      <div
        v-for="(msg, index) in messages"
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
          <div v-else class="markdown-content" :ref="el => setViewerRef(el, index)"></div>
        </div>
      </div>
      
      <div v-if="loading" class="message-wrapper assistant loading">
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
          @pressEnter.prevent="sendMessage"
        />
        <a-button 
          type="primary" 
          shape="circle" 
          @click="sendMessage" 
          :loading="loading"
          :disabled="!userInput.trim()"
        >
          <template #icon><send-outlined /></template>
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import { 
  MessageOutlined, 
  SendOutlined, 
  UserOutlined, 
  RobotOutlined 
} from '@ant-design/icons-vue';
import apiClient from '@/services/api';
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';

const messages = ref([]);
const userInput = ref('');
const loading = ref(false);
const messagesContainer = ref(null);
const viewers = ref({});

const setViewerRef = (el, index) => {
  if (el && !viewers.value[index]) {
    const viewer = new Viewer({
      el: el,
      initialValue: messages.value[index].content,
      theme: 'dark'
    });
    viewers.value[index] = viewer;
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || loading.value) return;

  // Add user message
  messages.value.push({
    role: 'user',
    content: text
  });
  
  userInput.value = '';
  loading.value = true;
  await scrollToBottom();

  try {
    const response = await apiClient.post('/api/chat', {
      message: text
    });

    // Add assistant message
    messages.value.push({
      role: 'assistant',
      content: response.data.reply
    });
  } catch (error) {
    console.error('Chat error:', error);
    // Error handling is partly done by interceptor, but we can add UI feedback here if needed
    // or rely on the interceptor's message.
    // If we want to show a message in the chat bubble specifically:
    messages.value.push({
      role: 'assistant',
      content: '죄송합니다. 오류가 발생했습니다.'
    });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #121212;
  color: #e0e0e0;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
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
  font-size: 1.25rem;
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
/* ... existing styles ... */

@media (max-width: 768px) {
  .chat-container {
    padding-bottom: 96px; /* Space for mobile navigation */
  }
  
  .input-area {
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
}
</style>
