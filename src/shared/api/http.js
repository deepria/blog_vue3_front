import axios from "axios";
import { userMessage } from "../lib/userMessage.js";

export const apiClient = axios.create({
  baseURL:
    (typeof import.meta !== "undefined" &&
      import.meta.env?.VITE_API_BASE_URL) ||
    process.env.VITE_API_BASE_URL ||
    "",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error?.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/refresh") &&
      !originalRequest.url?.includes("/api/auth/logout")
    ) {
      originalRequest._retry = true;
      try {
        await apiClient.post("/api/auth/refresh");
        return apiClient(originalRequest);
      } catch {
        // Fall through to the normalized original error.
      }
    }
    return Promise.reject(normalizeHttpError(error));
  },
);

export function unwrapData(response) {
  return response?.data?.data;
}

export function normalizeHttpError(error) {
  const status = error?.response?.status ?? null;
  const apiError = error?.response?.data?.error;
  const isOffline =
    typeof navigator !== "undefined" && !navigator.onLine && !error?.response;
  const code = isOffline
    ? "offline"
    : apiError?.code || error?.code || "request_failed";
  const technicalMessage = apiError?.message || error?.message || "";
  const message = userMessage({
    status,
    code,
    technicalMessage,
    userMessage: /[가-힣]/.test(technicalMessage)
      ? technicalMessage
      : undefined,
  });

  return {
    ...error,
    technicalMessage,
    status,
    code: isOffline
      ? "offline"
      : apiError?.code || error?.code || "request_failed",
    details: apiError?.details ?? null,
    userMessage: message,
  };
}

export function getErrorMessage(error, fallback) {
  return userMessage(error, fallback);
}
