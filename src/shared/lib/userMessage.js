const DEFAULT_MESSAGE =
  "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
export function userMessage(error, fallback = DEFAULT_MESSAGE) {
  const supplied = error?.userMessage;
  if (typeof supplied === "string" && /[가-힣]/.test(supplied)) return supplied;
  const raw = String(
    error?.technicalMessage || supplied || error?.message || "",
  );
  const code = error?.code;
  const status = error?.status ?? error?.response?.status;
  if (code === "offline")
    return "인터넷 연결이 없습니다. 연결 후 다시 시도해 주세요.";
  if (code === "ECONNABORTED" || code === "ETIMEDOUT")
    return "응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.";
  if (/password|auth.?key|protection.?key/i.test(raw))
    return "보호 키를 확인한 뒤 다시 시도해 주세요.";
  if (status === 401 || code === "unauthorized")
    return "로그인이 필요합니다. 다시 로그인해 주세요.";
  if (status === 403 || code === "forbidden")
    return "이 작업을 수행할 권한이 없습니다.";
  if (status === 404 || code === "not_found")
    return "요청한 항목을 찾을 수 없습니다. 목록을 새로고침해 주세요.";
  if (status === 409)
    return "다른 변경사항과 충돌했습니다. 최신 내용을 확인해 주세요.";
  if (status === 413)
    return "파일이 너무 큽니다. 파일 크기를 줄여 다시 시도해 주세요.";
  if (status === 429) return "요청이 많습니다. 잠시 후 다시 시도해 주세요.";
  if (status >= 500)
    return "서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요.";
  if (status === 400 || code === "bad_request")
    return "입력한 내용을 확인한 뒤 다시 시도해 주세요.";
  return typeof fallback === "string" && /[가-힣]/.test(fallback)
    ? fallback
    : DEFAULT_MESSAGE;
}
