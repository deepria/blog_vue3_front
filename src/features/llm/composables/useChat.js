import { ref, computed, watch } from 'vue';
import { chatApi } from '../api/chatApi';

/**
 * Global shared state for chat sessions extracted from Pinia
 * Placed outside the composable so it acts as a singleton for the chat feature
 */
const sessions = ref([]);
const currentSessionId = ref(null);
const loading = ref(false);
const loadingSince = ref(0);
const LOADING_STALE_MS = 35000;

let initialized = false;

const clearLoading = () => {
  loading.value = false;
  loadingSince.value = 0;
};

export function useChat() {
  const currentSession = computed(() => {
    return sessions.value.find(s => s.id === currentSessionId.value) || null;
  });

  const sortedSessions = computed(() => {
    return [...sessions.value]
      .filter(s => s && s.id)
      .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
  });

  const createSession = () => {
    const newSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      interactionId: null,
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    
    sessions.value.unshift(newSession);
    currentSessionId.value = newSession.id;
    return newSession.id;
  };

  const loadSessions = () => {
    if (loading.value && loadingSince.value && Date.now() - loadingSince.value > LOADING_STALE_MS) {
      clearLoading();
    }

    if (initialized) return;
    
    const stored = localStorage.getItem('chat_sessions');
    if (stored) {
      try {
        sessions.value = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse chat sessions', e);
        sessions.value = [];
      }
    }
    
    // Restore last active session or default to first/new
    const lastSessionId = localStorage.getItem('last_chat_session_id');
    if (lastSessionId && sessions.value.some(s => s.id === lastSessionId)) {
      currentSessionId.value = lastSessionId;
    } else if (sessions.value.length > 0) {
      currentSessionId.value = sessions.value[0].id;
    } else {
      createSession();
    }
    initialized = true;
  };

  const deleteSession = (id) => {
    const index = sessions.value.findIndex(s => s.id === id);
    if (index !== -1) {
      sessions.value.splice(index, 1);
      
      // If we deleted the current session, switch to another one
      if (currentSessionId.value === id) {
        if (sessions.value.length > 0) {
          currentSessionId.value = sessions.value[0].id;
        } else {
          createSession();
        }
      }
    }
  };

  const selectSession = (id) => {
    if (sessions.value.some(s => s.id === id)) {
      currentSessionId.value = id;
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !currentSession.value) return;

    if (loading.value && loadingSince.value && Date.now() - loadingSince.value > LOADING_STALE_MS) {
      clearLoading();
    }

    const session = currentSession.value;
    const userMsg = {
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    session.messages.push(userMsg);
    session.lastModified = Date.now();
    
    // Auto-update title if it's the first message and title is default
    if (session.messages.length === 1 && session.title === 'New Chat') {
      session.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
    }

    loading.value = true;
    loadingSince.value = Date.now();

    try {
      const reply = await chatApi.sendMessage(text, session.interactionId);
      session.interactionId = reply.interactionId || session.interactionId;
      const assistantMsg = {
        role: 'assistant',
        content: reply.reply,
        timestamp: Date.now()
      };

      session.messages.push(assistantMsg);
      session.lastModified = Date.now();
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = {
        role: 'assistant',
        content: error?.code === 'ECONNABORTED'
          ? '응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
          : '죄송합니다. 오류가 발생했습니다.',
        isError: true,
        timestamp: Date.now()
      };
      session.messages.push(errorMsg);
    } finally {
      clearLoading();
    }
  };

  // Setup persistence watchers only once
  if (!initialized) {
    watch(
      sessions,
      (newSessions) => {
        localStorage.setItem('chat_sessions', JSON.stringify(newSessions));
      },
      { deep: true }
    );

    watch(currentSessionId, (newId) => {
      if (newId) {
        localStorage.setItem('last_chat_session_id', newId);
      }
    });
  }

  return {
    sessions,
    sortedSessions,
    currentSessionId,
    currentSession,
    loading,
    loadingSince,
    loadSessions,
    createSession,
    deleteSession,
    selectSession,
    sendMessage,
    clearLoading
  };
}
