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

/* ... replacing css ... */
<style scoped>
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6) var(--space-4);
  background-color: var(--color-bg-panel);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  scroll-behavior: smooth;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
  gap: var(--space-4);
  background: transparent;
  border: 0;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-wrapper.user {
  justify-content: flex-end;
}

.message-wrapper.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: min(800px, 90%);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-body);
  line-height: 1.6;
  position: relative;
  overflow: hidden;
}

.message-wrapper.user .message-content {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  border: 1px solid var(--color-primary);
  border-bottom-right-radius: 4px;
}

.message-wrapper.assistant .message-content {
  background-color: var(--color-bg-surface);
  color: var(--color-text-primary);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-bottom-left-radius: 4px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-text-muted);
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

:deep(pre) {
  background-color: #0f172a !important;
  border-radius: var(--radius-md) !important;
  border: 1px solid var(--color-border) !important;
  margin: var(--space-3) 0 !important;
}

:deep(code) {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9em;
}

:deep(h1),
:deep(h2),
:deep(h3),
:deep(h4),
:deep(h5),
:deep(h6),
:deep(p),
:deep(span),
:deep(div),
:deep(li),
:deep(strong),
:deep(em) {
    color: var(--color-text-primary) !important;
}

:deep(a) {
    color: var(--color-primary) !important;
}

:deep(code),
:deep(pre) {
    color: var(--color-primary-strong) !important;
}

:deep(p) {
  margin: 0 0 var(--space-2) 0;
}

:deep(p:last-child) {
  margin-bottom: 0;
}
</style>
