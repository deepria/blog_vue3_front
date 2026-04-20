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
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeHttpError(error)),
);

export function unwrapData(response) {
  return response?.data?.data;
}

export function normalizeHttpError(error) {
  const status = error?.response?.status ?? null;
  const apiError = error?.response?.data?.error;
  const message =
    apiError?.message ||
    error?.message ||
    "Request failed. Please try again.";

  return {
    ...error,
    status,
    code: apiError?.code || error?.code || "request_failed",
    details: apiError?.details ?? null,
    userMessage: message,
  };
}

export function getErrorMessage(error, fallback = "Request failed.") {
  return error?.userMessage || fallback;
}
