import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import apiClient from '@/services/api';

export const useChatStore = defineStore('chat', () => {
  // State
  const sessions = ref([]);
  const currentSessionId = ref(null);
  const loading = ref(false);

  // Getters
  const currentSession = computed(() => {
    return sessions.value.find(s => s.id === currentSessionId.value) || null;
  });

  const sortedSessions = computed(() => {
    return [...sessions.value].sort((a, b) => b.createdAt - a.createdAt);
  });

  // Actions
  const loadSessions = () => {
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
  };

  const createSession = () => {
    const newSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    
    sessions.value.unshift(newSession);
    currentSessionId.value = newSession.id;
    return newSession.id;
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

  const updateSessionTitle = (id, title) => {
    const session = sessions.value.find(s => s.id === id);
    if (session) {
      session.title = title;
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !currentSession.value) return;

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
      // Simple truncation for title
      session.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
    }

    loading.value = true;

    try {
      const response = await apiClient.post('/api/chat', {
        message: text,
        // Optional: send history if API supports context
        // history: session.messages
      });

      const assistantMsg = {
        role: 'assistant',
        content: response.data.reply,
        timestamp: Date.now()
      };

      session.messages.push(assistantMsg);
      session.lastModified = Date.now();
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = {
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다.',
        isError: true,
        timestamp: Date.now()
      };
      session.messages.push(errorMsg);
    } finally {
      loading.value = false;
    }
  };

  // Persist to localStorage whenever sessions change
  watch(
    sessions,
    (newSessions) => {
      localStorage.setItem('chat_sessions', JSON.stringify(newSessions));
    },
    { deep: true }
  );

  // Persist current session ID
  watch(currentSessionId, (newId) => {
    if (newId) {
      localStorage.setItem('last_chat_session_id', newId);
    }
  });

  return {
    sessions,
    sortedSessions,
    currentSessionId,
    currentSession,
    loading,
    loadSessions,
    createSession,
    deleteSession,
    selectSession,
    updateSessionTitle,
    sendMessage
  };
});
