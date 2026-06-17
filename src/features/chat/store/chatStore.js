import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { chatApi } from "@/features/llm/api/chatApi";

const STORAGE_KEY = "chat_sessions";
const LAST_SESSION_KEY = "last_chat_session_id";
const STALE_LOADING_MS = 35000;

export const useChatStore = defineStore("chat", () => {
  const sessions = ref([]);
  const currentSessionId = ref(null);
  const loading = ref(false);
  const loadingSince = ref(0);
  const initialized = ref(false);

  const currentSession = computed(
    () => sessions.value.find((session) => session.id === currentSessionId.value) || null,
  );
  const sortedSessions = computed(() =>
    [...sessions.value]
      .filter((session) => session?.id)
      .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0)),
  );

  function clearLoading() {
    loading.value = false;
    loadingSince.value = 0;
  }

  function ensureFreshLoading() {
    if (
      loading.value &&
      loadingSince.value &&
      Date.now() - loadingSince.value > STALE_LOADING_MS
    ) {
      clearLoading();
    }
  }

  function createSession() {
    const session = {
      id: crypto.randomUUID(),
      title: "New Chat",
      interactionId: null,
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now(),
    };
    sessions.value.unshift(session);
    currentSessionId.value = session.id;
    return session.id;
  }

  function initialize() {
    if (initialized.value) return;

    ensureFreshLoading();
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        sessions.value = JSON.parse(stored);
      } catch {
        sessions.value = [];
      }
    }

    const lastSessionId = localStorage.getItem(LAST_SESSION_KEY);
    if (lastSessionId && sessions.value.some((session) => session.id === lastSessionId)) {
      currentSessionId.value = lastSessionId;
    } else if (sessions.value.length > 0) {
      currentSessionId.value = sessions.value[0].id;
    } else {
      createSession();
    }

    initialized.value = true;
  }

  function deleteSession(id) {
    const index = sessions.value.findIndex((session) => session.id === id);
    if (index === -1) return;
    sessions.value.splice(index, 1);
    if (currentSessionId.value === id) {
      currentSessionId.value = sessions.value[0]?.id || null;
      if (!currentSessionId.value) createSession();
    }
  }

  function selectSession(id) {
    if (sessions.value.some((session) => session.id === id)) {
      currentSessionId.value = id;
    }
  }

  async function requestAssistantReply(session, content) {
    loading.value = true;
    loadingSince.value = Date.now();

    try {
      const reply = await chatApi.sendMessage(content, session.interactionId);
      session.interactionId = reply.interactionId || session.interactionId;
      session.messages.push({
        role: "assistant",
        content: reply.reply,
        timestamp: Date.now(),
      });
      session.lastModified = Date.now();
    } catch (error) {
      session.messages.push({
        role: "assistant",
        content:
          error?.code === "ECONNABORTED"
            ? "응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
            : error?.userMessage || "죄송합니다. 오류가 발생했습니다.",
        isError: true,
        timestamp: Date.now(),
      });
      session.lastModified = Date.now();
    } finally {
      clearLoading();
    }
  }

  async function sendMessage(text) {
    const session = currentSession.value;
    const content = text.trim();
    if (!session || !content) return;

    session.messages.push({
      role: "user",
      content,
      timestamp: Date.now(),
    });
    session.lastModified = Date.now();
    if (session.messages.length === 1 && session.title === "New Chat") {
      session.title = content.length > 30 ? `${content.slice(0, 30)}...` : content;
    }

    await requestAssistantReply(session, content);
  }

  function renameSession(id, title) {
    const session = sessions.value.find((item) => item.id === id);
    const nextTitle = title.trim();
    if (!session || !nextTitle) return;
    session.title = nextTitle.slice(0, 80);
    session.lastModified = Date.now();
  }

  function deleteMessage(index) {
    const session = currentSession.value;
    if (!session || index < 0 || index >= session.messages.length) return;
    session.messages.splice(index, 1);
    session.lastModified = Date.now();
  }

  async function retryMessage(index) {
    const session = currentSession.value;
    if (!session || loading.value) return;

    const userMessageIndex = session.messages
      .slice(0, index + 1)
      .map((item, itemIndex) => ({ ...item, itemIndex }))
      .reverse()
      .find((item) => item.role === "user")?.itemIndex;

    if (userMessageIndex === undefined) return;

    const content = session.messages[userMessageIndex]?.content?.trim();
    if (!content) return;

    const nextMessages = session.messages.slice(0, userMessageIndex + 1);
    session.messages.splice(0, session.messages.length, ...nextMessages);
    session.lastModified = Date.now();
    await requestAssistantReply(session, content);
  }

  async function retryLastMessage() {
    const session = currentSession.value;
    if (!session?.messages.length) return;
    const lastIndex = session.messages.length - 1;
    if (session.messages[lastIndex]?.role === "assistant") {
      await retryMessage(lastIndex);
      return;
    }
    await retryMessage(lastIndex);
  }

  watch(
    sessions,
    (value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    },
    { deep: true },
  );

  watch(currentSessionId, (value) => {
    if (value) localStorage.setItem(LAST_SESSION_KEY, value);
  });

  return {
    sessions,
    sortedSessions,
    currentSessionId,
    currentSession,
    loading,
    loadingSince,
    initialize,
    createSession,
    deleteSession,
    selectSession,
    renameSession,
    sendMessage,
    deleteMessage,
    retryMessage,
    retryLastMessage,
    clearLoading,
  };
});
