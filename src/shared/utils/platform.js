/**
 * Utility to check if the app is currently running inside a WebView
 * Adjust this logic based on how your Android/iOS WebView injects flags
 * (e.g., via userAgent or custom window properties)
 */
export function isWebView() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  // Example detection for common webviews, modify as needed for your specific app shell
  const isIosWebView = /(iphone|ipod|ipad).*applewebkit(?!.*safari)/.test(userAgent);
  const isAndroidWebView = /wv/.test(userAgent) || /android.*applewebkit.*version\/[0-9.]+.*chrome/.test(userAgent);
  
  // Or if you inject a specific object from React Native / Flutter
  const hasInjectedBridge = !!window.ReactNativeWebView || !!window.AndroidBridge;
  
  return isIosWebView || isAndroidWebView || hasInjectedBridge;
}
