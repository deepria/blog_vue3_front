// Serialize saves and acknowledge only the exact draft sent to the server.
export function createDraftSaver({ read, persist, acknowledge }) {
  let pending = null;
  function save() {
    if (pending) return pending;
    pending = (async () => {
      let result = null;
      for (;;) {
        const draft = { ...read() };
        result = await persist(draft);
        acknowledge(draft, result);
        const latest = read();
        if (latest.title === draft.title && latest.content === draft.content)
          break;
      }
      return result;
    })().finally(() => {
      pending = null;
    });
    return pending;
  }
  return { save };
}
