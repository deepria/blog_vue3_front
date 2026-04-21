import { ref } from 'vue';
import { message } from 'ant-design-vue';

/**
 * A highly reusable composable for managing async API calls.
 * Automatically tracks `loading` state, handles `try/catch`, and provides consistent UI error messages via Ant Design.
 * 
 * @param {Function} asyncFn - The async API function to execute
 * @param {Object} options - Configuration options
 * @param {any} options.initialState - Initial value for the `data` ref (default: null)
 * @param {boolean} options.showSuccessMsg - Whether to show a success message upon completion (default: false)
 * @param {string} options.successMsg - Custom success message
 * @param {boolean} options.showErrorMsg - Whether to show an error message upon failure (default: true)
 * @param {string} options.errorMsg - Custom fallback error message if the API doesn't provide one
 */
export function useAsync(asyncFn, options = {}) {
  const {
    initialState = null,
    showSuccessMsg = false,
    successMsg = "Operation successful",
    showErrorMsg = true,
    errorMsg = "An error occurred",
  } = options;

  const data = ref(initialState);
  const loading = ref(false);
  const error = ref(null);

  const execute = async (...args) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await asyncFn(...args);
      data.value = result;
      
      if (showSuccessMsg) {
        message.success(successMsg);
      }
      
      return result;
    } catch (e) {
      error.value = e;
      if (showErrorMsg) {
        // Try to stringify backend error or fallback
        const errMsg = e?.userMessage || e?.message || errorMsg;
        message.error(errMsg);
      }
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    data,
    loading,
    error,
    execute,
  };
}
