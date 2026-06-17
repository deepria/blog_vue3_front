<template>
  <section class="messages-area" ref="containerRef">
    <div v-if="!messages.length && !loading" class="empty-state">
      <div class="empty-mark">
        <robot-outlined />
      </div>
      <div class="empty-copy">
        <h2>무엇부터 정리해볼까요?</h2>
        <p>아래 예시를 누르거나 직접 입력해서 대화를 시작하세요.</p>
      </div>
      <div class="prompt-grid">
        <button
          v-for="prompt in starterPrompts"
          :key="prompt.title"
          type="button"
          class="prompt-card"
          @click="$emit('send-prompt', prompt.text)"
        >
          <span>{{ prompt.title }}</span>
          <small>{{ prompt.description }}</small>
        </button>
      </div>
    </div>

    <article
      v-for="(msg, index) in messages"
      :key="`${msg.timestamp || index}-${index}`"
      :class="['message-row', msg.role === 'user' ? 'user' : 'assistant', { error: msg.isError }]"
    >
      <div class="message-avatar" aria-hidden="true">
        <user-outlined v-if="msg.role === 'user'" />
        <robot-outlined v-else />
      </div>

      <div class="message-stack">
        <div class="message-meta">
          <span>{{ msg.role === "user" ? "나" : "Assistant" }}</span>
          <time v-if="msg.timestamp">{{ formatTime(msg.timestamp) }}</time>
        </div>

        <div class="message-content">
          <div v-if="msg.role === 'user'" class="text-content">
            {{ msg.content }}
          </div>
          <MarkdownViewer v-else :content="msg.content" />
        </div>

        <div class="message-actions">
          <button type="button" title="복사" @click="copyMessage(msg.content)">
            <copy-outlined />
          </button>
          <button
            v-if="msg.role === 'assistant'"
            type="button"
            title="다시 생성"
            :disabled="loading"
            @click="$emit('retry', index)"
          >
            <reload-outlined />
          </button>
          <button type="button" title="삭제" @click="$emit('delete', index)">
            <delete-outlined />
          </button>
        </div>
      </div>
    </article>

    <div v-if="loading" class="message-row assistant loading">
      <div class="message-avatar" aria-hidden="true">
        <robot-outlined />
      </div>
      <div class="message-stack">
        <div class="message-meta">
          <span>Assistant</span>
          <time>응답 생성 중</time>
        </div>
        <div class="message-content loading-content">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { nextTick, ref, watch } from "vue";
import { message } from "ant-design-vue";
import {
  CopyOutlined,
  DeleteOutlined,
  ReloadOutlined,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";
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

defineEmits(["send-prompt", "retry", "delete"]);

const starterPrompts = [
  {
    title: "긴 글 요약",
    description: "핵심만 뽑아 구조화",
    text: "아래 내용을 핵심 bullet로 요약하고, 마지막에 다음 액션을 제안해줘.\n\n",
  },
  {
    title: "코드 리뷰",
    description: "버그와 개선점 찾기",
    text: "다음 코드를 리뷰해줘. 버그 가능성, UX 리스크, 테스트 포인트 순서로 정리해줘.\n\n",
  },
  {
    title: "계획 세우기",
    description: "실행 가능한 단계로 분해",
    text: "이 목표를 실행 계획으로 쪼개줘. 우선순위, 예상 리스크, 첫 작업을 포함해줘.\n\n",
  },
  {
    title: "문장 다듬기",
    description: "톤과 흐름 정리",
    text: "아래 문장을 더 자연스럽고 명확하게 다듬어줘. 원문 의도는 유지해줘.\n\n",
  },
];

const containerRef = ref(null);

async function copyMessage(content) {
  try {
    await navigator.clipboard.writeText(content || "");
    message.success("복사했습니다.");
  } catch {
    message.error("복사하지 못했습니다.");
  }
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

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
  padding: 28px clamp(16px, 4vw, 48px);
  background: var(--color-bg-panel);
  display: flex;
  flex-direction: column;
  gap: 18px;
  scroll-behavior: smooth;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  color: var(--color-text-primary);
  gap: 20px;
}

.empty-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-size: 24px;
}

.empty-copy h2 {
  margin: 0;
  font-size: 26px;
  line-height: 1.25;
  letter-spacing: 0;
}

.empty-copy p {
  margin: 8px 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-body);
}

.prompt-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.prompt-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 88px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
}

.prompt-card:hover {
  border-color: var(--color-border-bright);
  background: var(--color-bg-elevated);
  transform: translateY(-1px);
}

.prompt-card span {
  font-weight: 650;
  font-size: var(--font-size-body);
}

.prompt-card small {
  margin-top: 6px;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}

.message-row {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  width: min(900px, 100%);
}

.message-row.user {
  align-self: flex-end;
  grid-template-columns: minmax(0, 1fr) 34px;
}

.message-row.user .message-avatar {
  grid-column: 2;
}

.message-row.user .message-stack {
  grid-column: 1;
  grid-row: 1;
  align-items: flex-end;
}

.message-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.message-row.user .message-avatar {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-inverse);
}

.message-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  gap: 6px;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-caption);
  color: var(--color-text-muted);
}

.message-meta span {
  color: var(--color-text-secondary);
  font-weight: 650;
}

.message-content {
  max-width: min(780px, 100%);
  padding: 13px 15px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  line-height: 1.65;
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-sm);
}

.message-row.user .message-content {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--text-inverse);
}

.message-row.error .message-content {
  border-color: rgba(220, 38, 38, 0.38);
  background: color-mix(in srgb, var(--color-danger) 8%, var(--color-bg-surface));
}

.message-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.message-row:hover .message-actions,
.message-row:focus-within .message-actions {
  opacity: 1;
  transform: translateY(0);
}

.message-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
}

.message-actions button:hover:not(:disabled) {
  background: var(--color-bg-surface);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.message-actions button:disabled {
  cursor: not-allowed;
  color: var(--color-text-disabled);
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 82px;
}

.loading-content span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-text-muted);
  animation: pulse 1.3s infinite ease-in-out both;
}

.loading-content span:nth-child(1) { animation-delay: -0.26s; }
.loading-content span:nth-child(2) { animation-delay: -0.13s; }

@keyframes pulse {
  0%, 80%, 100% { opacity: 0.32; transform: scale(0.72); }
  40% { opacity: 1; transform: scale(1); }
}

:deep(pre) {
  position: relative;
  background-color: #0f172a !important;
  border-radius: var(--radius-md) !important;
  border: 1px solid var(--color-border) !important;
  margin: var(--space-3) 0 !important;
}

:deep(code) {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.9em;
}

:deep(p) {
  margin: 0 0 var(--space-2) 0;
}

:deep(p:last-child) {
  margin-bottom: 0;
}

:deep(a) {
  color: var(--color-primary) !important;
}

@media (max-width: 768px) {
  .messages-area {
    padding: 20px 14px;
    gap: 16px;
  }

  .empty-state {
    justify-content: flex-start;
    padding-top: 24px;
  }

  .empty-copy h2 {
    font-size: 22px;
  }

  .prompt-grid {
    grid-template-columns: 1fr;
  }

  .message-row,
  .message-row.user {
    grid-template-columns: minmax(0, 1fr);
    width: 100%;
  }

  .message-avatar {
    display: none;
  }

  .message-row.user .message-stack {
    grid-column: 1;
  }

  .message-content {
    max-width: 92%;
  }

  .message-row.assistant .message-content {
    max-width: 100%;
  }

  .message-actions {
    opacity: 1;
    transform: none;
  }
}
</style>
