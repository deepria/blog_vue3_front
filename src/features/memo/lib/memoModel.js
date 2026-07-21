export const normalizeMemo = (memo = {}) => ({
  ...memo,
  updatedAt: memo.updatedAt || memo.updated_at || "",
  createdAt: memo.createdAt || memo.created_at || "",
});

export const normalizeMemoTimestamp = (value) => {
  if (!value) return 0;
  const text = String(value);
  const date = /^\d+$/.test(text) ? new Date(Number(text) * 1000) : new Date(text);
  const time = date.getTime();
  return Number.isFinite(time) ? time : 0;
};
