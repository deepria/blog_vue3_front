<template>
  <div class="messages-area" ref="containerRef">
    <div v-if="!messages.length && !loading" class="empty-state">
      <robot-outlined class="empty-icon" />
      <p>안녕하세요! 무엇을 도와드릴까요?</p>
    </div>

    <div
      v-for="(msg, index) in messages"
      :key="index"
      :class="['message-wrapper', msg.role === 'user' ? 'user' : 'assistant']"
    >
      <div class="message-content">
        <div class="specular-highlight"></div>
        <div v-if="msg.role === 'user'" class="text-content">
          {{ msg.content }}
        </div>
        <MarkdownViewer v-else :content="msg.content" />
      </div>
    </div>

    <div v-if="loading && messages.length" class="message-wrapper assistant loading">
      <div class="message-content">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from "vue";
import { RobotOutlined } from "@ant-design/icons-vue";
import MarkdownViewer from "@/components/ui/MarkdownViewer.vue";

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const containerRef = ref(null);

async function scrollToBottom() {
  await nextTick();
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight;
  }
}

watch(
  () => [props.messages.length, props.loading],
  () => {
    scrollToBottom();
  },
  { immediate: true },
);
</script>

<style scoped>
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  color: #ffffff;
}

.message-wrapper {
  display: flex;
  margin-bottom: 14px;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-wrapper.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: min(760px, 100%);
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  color: #ffffff;
}

.message-wrapper.user .message-content {
  background: rgba(66, 184, 131, 0.18);
}

.text-content,
.empty-state,
.typing-indicator {
  color: #ffffff;
}

.message-content :deep(*),
.message-content :deep(p),
.message-content :deep(span),
.message-content :deep(li),
.message-content :deep(code),
.message-content :deep(pre),
.message-content :deep(h1),
.message-content :deep(h2),
.message-content :deep(h3),
.message-content :deep(h4),
.message-content :deep(h5),
.message-content :deep(h6),
.message-content :deep(blockquote),
.message-content :deep(strong),
.message-content :deep(em),
.message-content :deep(a) {
  color: #ffffff !important;
}

.typing-indicator span {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: bounce 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
