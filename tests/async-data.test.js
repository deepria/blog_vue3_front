import { createServer as createHttpServer } from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

async function modules(t) {
  const server = await createServer({
    configFile: false,
    optimizeDeps: { noDiscovery: true, include: [] },
    root: fileURLToPath(new URL("..", import.meta.url)),
    resolve: {
      alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) },
    },
    server: { middlewareMode: true, hmr: { server: createHttpServer() } },
    appType: "custom",
  });
  t.after(() => server.close());
  return (path) => server.ssrLoadModule(path);
}
function deferred() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
test("todo refresh commits the list and metadata together and preserves an edited list after failure", async (t) => {
  const load = await modules(t);
  const { useTodos } = await load("/src/features/todo/composables/useTodos.js");
  const { todoApi } = await load("/src/features/todo/api/todoApi.js");
  todoApi.fetchMeta = async () => ({
    groups: [{ key: 1, name: "사용자 그룹" }],
    priorities: [{ key: 1, name: "중요" }],
  });
  todoApi.fetchTodos = async () => [
    { id: 1, text: "원래 작업", groupKey: 1, priorityKey: 1 },
  ];
  const data = useTodos();
  assert.equal(await data.fetchAll(), true);
  data.addItem("아직 저장하지 않은 작업", 1, 1);
  todoApi.fetchMeta = async () => ({
    groups: [{ key: 2, name: "응답 일부" }],
    priorities: [],
  });
  todoApi.fetchTodos = async () => {
    throw Error("offline");
  };
  assert.equal(await data.fetchAll(), false);
  assert.ok(data.error.value);
  assert.equal(data.groupOptions.value[0].name, "사용자 그룹");
  assert.equal(data.items.value[0].text, "아직 저장하지 않은 작업");
  assert.equal(data.hasUnsavedChanges.value, true);
});
test("todo saving an older snapshot cannot overwrite newer edits or mark them saved", async (t) => {
  const load = await modules(t);
  const { useTodos } = await load("/src/features/todo/composables/useTodos.js");
  const { todoApi } = await load("/src/features/todo/api/todoApi.js");
  const first = deferred();
  todoApi.saveTodos = async () => first.promise;
  todoApi.saveMeta = async (meta) => meta;
  const data = useTodos();
  data.addItem("첫 작업", 1, 1);
  const saving = data.saveAll();
  data.addItem("저장 중 새 작업", 1, 1);
  first.resolve([]);
  await saving;
  assert.equal(data.items.value.length, 2);
  assert.equal(data.items.value[0].text, "저장 중 새 작업");
  assert.equal(data.hasUnsavedChanges.value, true);
});
test("storage load errors preserve the current files and a successful retry clears the error", async (t) => {
  const load = await modules(t);
  const { useStorage } = await load(
    "/src/features/storage/composables/useStorage.js",
  );
  const { storageApi } = await load("/src/features/storage/api/storageApi.js");
  storageApi.listFiles = async () => [
    { key: "original", display_name: "사용자 파일.txt" },
  ];
  const data = useStorage();
  await data.loadFiles();
  storageApi.listFiles = async () => {
    throw Error("offline");
  };
  await assert.rejects(data.loadFiles());
  assert.equal(data.files.value[0].key, "original");
  assert.ok(data.error.value);
  storageApi.listFiles = async () => [];
  await data.loadFiles();
  assert.equal(data.error.value, "");
  assert.deepEqual(data.files.value, []);
});
