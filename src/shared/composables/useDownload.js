import { isWebView } from '../utils/platform';
import apiClient from '@/services/api';

/**
 * A composable to handle file downloads seamlessly across Web and WebView (Android/iOS)
 */
export function useDownload() {
  
  /**
   * Downloads a file from a given URL or handles it via S3 API
   * 
   * @param {string} filename - The stored filename
   * @param {string} originalFileName - The human-readable file name
   */
  const downloadFile = async (filename, originalFileName) => {
    try {
      // 1. Get the pre-signed URL (this part is specific to your backend, keep it here or abstract it further if needed)
      const { data: downloadUrl } = await apiClient.get('/api/s3/download-url', {
        params: {
          filename: filename,
          originalName: originalFileName
        },
      });

      // 2. Platform specific download handling
      if (isWebView() && navigator.userAgent.includes("Android") && window.Android?.isApp?.()) {
        // --- Android WebView Logic ---
        const response = await apiClient.get(downloadUrl, {
          responseType: "blob",
        });

        const blob = new Blob([response.data]);
        const reader = new FileReader();
        reader.onload = function () {
          // Send base64 to the native bridge
          const base64Data = reader.result.split(",")[1];
          window.Android.downloadBlob(base64Data, originalFileName);
        };
        reader.readAsDataURL(blob);
        
      } else {
        // --- Web Browser Logic ---
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.target = "_blank";
        // The backend should set Content-Disposition for this to work natively
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      return true;
    } catch (error) {
      console.error("Download failed:", error);
      throw error;
    }
  };

  return { downloadFile };
}
