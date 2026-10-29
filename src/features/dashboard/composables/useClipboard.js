import { ref } from "vue";
import { clipboardApi } from "@/features/dashboard/api/clipboardApi";
import { useAsync } from "@/shared/composables/useAsync";

export function useClipboard() {
  const { loading: clipboardLoading, execute: executeFetch } = useAsync(
    clipboardApi.fetchClipboard,
    { initialState: { text: "" } },
  );

  const { loading: clipboardSaving, execute: executeSave } = useAsync(
    clipboardApi.saveClipboard,
    {
      showErrorMsg: true,
      errorMsg: "Failed to save clipboard",
    },
  );

  // Local state to bind to UI immediately
  const clipboardText = ref("");

  const fetchClipboard = async () => {
    const resp = (await executeFetch()) || {};
    clipboardText.value = resp.text || "";
  };

  const saveClipboard = async (text) => {
    // Never replace edits made while this request was in flight.
    await executeSave(text);
  };

  return {
    clipboardText,
    clipboardLoading,
    clipboardSaving,
    fetchClipboard,
    saveClipboard,
  };
}
