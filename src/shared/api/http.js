import axios from "axios";

export const apiClient = axios.create({
  baseURL:
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
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
    typeof navigator !== "undefined" &&
    !navigator.onLine &&
    !error?.response;
  const message =
    (isOffline
      ? "인터넷 연결이 없습니다. 연결 후 다시 시도해 주세요."
      : apiError?.message ||
        error?.message ||
        "Request failed. Please try again.");

  return {
    ...error,
    status,
    code: isOffline
      ? "offline"
      : apiError?.code || error?.code || "request_failed",
    details: apiError?.details ?? null,
    userMessage: message,
  };
}

export function getErrorMessage(error, fallback = "Request failed.") {
  return error?.userMessage || fallback;
}
