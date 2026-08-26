export const OFFLINE_MESSAGE =
  "인터넷 연결이 없습니다. 연결 후 다시 시도해 주세요.";

export function assertOnline() {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw {
      code: "offline",
      userMessage: OFFLINE_MESSAGE,
    };
  }
}

export async function fetchOnline(...args) {
  assertOnline();

  try {
    return await fetch(...args);
  } catch (error) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw {
        ...error,
        code: "offline",
        userMessage: OFFLINE_MESSAGE,
      };
    }
    throw error;
  }
}
