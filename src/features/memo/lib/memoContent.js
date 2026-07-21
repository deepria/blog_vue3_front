export function formatMemoTime(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function parseMemoDate(value) {
  if (!value) return null;
  const text = String(value);
  const date = /^\d+$/.test(text) ? new Date(Number(text) * 1000) : new Date(text);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function toggleMarkdownTask(content, targetIndex) {
  let currentIndex = -1;
  let didToggle = false;
  const taskPattern = /^(\s*[-*+]\s+\[)( |x|X)(\]\s+)/;
  const nextContent = content
    .split("\n")
    .map((line) =>
      line.replace(taskPattern, (match, prefix, state, suffix) => {
        currentIndex += 1;
        if (currentIndex !== targetIndex) return match;
        didToggle = true;
        return `${prefix}${state === " " ? "x" : " "}${suffix}`;
      }),
    )
    .join("\n");
  return didToggle ? nextContent : null;
}
