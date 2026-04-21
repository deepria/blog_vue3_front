import { ref } from 'vue';
import { clipboardApi } from '@/features/dashboard/api/clipboardApi';
import { useAsync } from '@/shared/composables/useAsync';

export function useClipboard() {
  const { 
    data: clipboardResponse, 
    loading: clipboardLoading, 
    execute: executeFetch 
  } = useAsync(clipboardApi.fetchClipboard, { initialState: { text: '' } });

  const {
    loading: clipboardSaving,
    execute: executeSave
  } = useAsync(clipboardApi.saveClipboard, { 
    showErrorMsg: true, 
    errorMsg: "Failed to save clipboard" 
  });

  // Local state to bind to UI immediately
  const clipboardText = ref('');

  const fetchClipboard = async () => {
    try {
      const resp = await executeFetch() || {};
      clipboardText.value = resp.text || '';
    } catch {
      console.warn("Clipboard not found or initialized");
      clipboardText.value = '';
    }
  };

  const saveClipboard = async (text) => {
    await executeSave(text);
    clipboardText.value = text;
  };

  return {
    clipboardText,
    clipboardLoading,
    clipboardSaving,
    fetchClipboard,
    saveClipboard
  };
}
