import { isWebView } from "@/shared/utils/platform";

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to read file blob"));
    reader.readAsDataURL(blob);
  });
}

function triggerBrowserDownload(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function handoffToNative(blob, filename) {
  const base64Data = await blobToBase64(blob);

  if (window.Android?.downloadBlob) {
    window.Android.downloadBlob(base64Data, filename);
    return true;
  }

  if (window.AndroidBridge?.downloadBlob) {
    window.AndroidBridge.downloadBlob(base64Data, filename);
    return true;
  }

  if (window.webkit?.messageHandlers?.downloadBlob?.postMessage) {
    window.webkit.messageHandlers.downloadBlob.postMessage({
      base64: base64Data,
      filename,
      mimeType: blob.type || "application/octet-stream",
    });
    return true;
  }

  if (window.ReactNativeWebView?.postMessage) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "downloadBlob",
        base64: base64Data,
        filename,
        mimeType: blob.type || "application/octet-stream",
      }),
    );
    return true;
  }

  return false;
}

export function useDownload() {
  async function downloadFromUrl(url, filename) {
    if (!url) {
      throw { userMessage: "Download URL is missing" };
    }

    if (!isWebView()) {
      triggerBrowserDownload(url, filename);
      return true;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw {
        userMessage: `Download failed (${response.status})`,
        status: response.status,
      };
    }

    const blob = await response.blob();
    const handledByNative = await handoffToNative(blob, filename);

    if (handledByNative) {
      return true;
    }

    const objectUrl = URL.createObjectURL(blob);
    try {
      triggerBrowserDownload(objectUrl, filename);
    } finally {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }
    return true;
  }

  return { downloadFromUrl };
}
