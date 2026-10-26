import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { createRenderer, nextTick } from "vue";
import { createPinia } from "pinia";

test("disabled gallery skips file requests and ignores work after disable or unmount", async (t) => {
  const server = await createServer({
    configFile: false,
    optimizeDeps: { noDiscovery: true, include: [] },
    root: fileURLToPath(new URL("..", import.meta.url)),
    resolve: {
      alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) },
    },
    server: { middlewareMode: true },
    appType: "custom",
  });
  const savedStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  const savedWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  let timers = 0;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => null },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      setInterval: () => ++timers,
      clearInterval: () => {
        timers -= 1;
      },
    },
  });
  t.after(async () => {
    await server.close();
    for (const [name, descriptor] of [
      ["localStorage", savedStorage],
      ["window", savedWindow],
    ]) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  const { useDashboardGallery } = await server.ssrLoadModule(
    "/src/features/dashboard/composables/useDashboardGallery.js",
  );
  const { useAppStore } = await server.ssrLoadModule("/src/store/app.js");
  const { useSettingsStore } = await server.ssrLoadModule(
    "/src/features/settings/store/settingsStore.js",
  );
  const { settingsApi } = await server.ssrLoadModule(
    "/src/features/settings/api/settingsApi.js",
  );
  const { storageApi } = await server.ssrLoadModule(
    "/src/features/storage/api/storageApi.js",
  );
  settingsApi.get = async () => ({ dashboard_gallery_enabled: false });
  settingsApi.save = async (value) => value;
  let fileCalls = 0;
  let downloadCalls = 0;
  let resolveFiles;
  let resolveDownload;
  storageApi.getOrganization = async () => ({
    file_locations: { photo: "dashboard", second: "dashboard" },
  });
  storageApi.listFiles = () => {
    fileCalls += 1;
    return new Promise((resolve) => {
      resolveFiles = resolve;
    });
  };
  storageApi.createDownload = () => {
    downloadCalls += 1;
    return new Promise((resolve) => {
      resolveDownload = resolve;
    });
  };
  const renderer = createRenderer({
    insert() {},
    remove() {},
    createElement: () => ({}),
    createText: () => ({}),
    createComment: () => ({}),
    setText() {},
    setElementText() {},
    parentNode: () => null,
    nextSibling: () => null,
    patchProp() {},
  });
  const pinia = createPinia();
  let gallery;
  const component = renderer.createApp({
    setup() {
      gallery = useDashboardGallery();
      return () => null;
    },
  });
  component.use(pinia);
  const app = useAppStore(pinia);
  const settings = useSettingsStore(pinia);
  app.setSession({ user: { id: "alice" } });
  const flush = async () => {
    for (let count = 0; count < 8; count += 1) await Promise.resolve();
    await nextTick();
  };
  component.mount({});
  await flush();
  assert.equal(fileCalls, 0);
  assert.equal(gallery.activeSlide.value, null);

  await settings.saveDashboardGallery(true);
  assert.equal(fileCalls, 1);
  await settings.saveDashboardGallery(false);
  resolveFiles([{ key: "photo", display_name: "photo.png" }]);
  await flush();
  assert.equal(downloadCalls, 0);
  assert.equal(gallery.activeSlide.value, null);

  storageApi.createDownload = async ({ key }) => ({
    url: `https://example.com/${key}.png`,
  });
  await settings.saveDashboardGallery(true);
  resolveFiles([
    { key: "photo", display_name: "photo.png" },
    { key: "second", display_name: "second.png" },
  ]);
  await flush();
  assert.equal(gallery.activeSlide.value.url, "https://example.com/photo.png");
  assert.equal(timers, 1);
  await settings.saveDashboardGallery(false);
  assert.equal(gallery.activeSlide.value, null);
  assert.equal(timers, 0);

  storageApi.createDownload = () => {
    downloadCalls += 1;
    return new Promise((resolve) => {
      resolveDownload = resolve;
    });
  };
  await settings.saveDashboardGallery(true);
  resolveFiles([{ key: "photo", display_name: "photo.png" }]);
  await flush();
  assert.equal(downloadCalls, 1);
  component.unmount();
  resolveDownload({ url: "https://example.com/photo.png" });
  await flush();
  assert.equal(gallery.activeSlide.value, null);
  assert.equal(gallery.loading.value, false);
  assert.equal(timers, 0);
});
