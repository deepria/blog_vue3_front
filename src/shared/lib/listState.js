// Navigation memory only: never persist search strings or document content to disk.
const states = new Map();
export const readListState = (owner, area) =>
  states.get(`${owner || "anonymous"}:${area}`) || {};
export const writeListState = (owner, area, value) =>
  states.set(`${owner || "anonymous"}:${area}`, { ...value });
export const clearListState = () => states.clear();
