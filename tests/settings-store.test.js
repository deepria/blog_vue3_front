import test from "node:test";
import assert from "node:assert/strict";
import { createPinia, setActivePinia } from "pinia";
import { useSettingsStore } from "../src/features/settings/store/settingsStore.js";
import { settingsApi } from "../src/features/settings/api/settingsApi.js";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(t) {
  setActivePinia(createPinia());
  const originalGet = settingsApi.get;
  const originalSave = settingsApi.save;
  t.after(() => {
    settingsApi.get = originalGet;
    settingsApi.save = originalSave;
  });
  const settings = useSettingsStore();
  settings.setUser("alice");
  return settings;
}

test("loads saved disabled preference and persists a change through the account API", async (t) => {
  const settings = setup(t);
  settingsApi.get = async () => ({ dashboard_gallery_enabled: false });
  await settings.loadSettings();
  assert.equal(settings.loaded, true);
  assert.equal(settings.dashboardGalleryEnabled, false);
  settingsApi.save = async (payload) => {
    assert.deepEqual(payload, { dashboard_gallery_enabled: true });
    return payload;
  };
  assert.equal(await settings.saveDashboardGallery(true), true);
  assert.equal(settings.dashboardGalleryEnabled, true);
});

test("deduplicates loads and ignores a response from the previous account", async (t) => {
  const settings = setup(t);
  const alice = deferred();
  const bob = deferred();
  let calls = 0;
  settingsApi.get = () => (++calls === 1 ? alice.promise : bob.promise);
  const oldRequest = settings.loadSettings();
  const duplicateRequest = settings.loadSettings();
  assert.equal(calls, 1);
  settings.setUser("bob");
  const newRequest = settings.loadSettings();
  alice.resolve({ dashboard_gallery_enabled: false });
  assert.equal(await oldRequest, null);
  assert.equal(await duplicateRequest, null);
  assert.equal(settings.loaded, false);
  assert.equal(settings.loading, true);
  bob.resolve({ dashboard_gallery_enabled: true });
  await newRequest;
  assert.equal(settings.dashboardGalleryEnabled, true);
  assert.equal(settings.loading, false);
});

test("failed save preserves the previous setting and can be retried", async (t) => {
  const settings = setup(t);
  settingsApi.get = async () => ({ dashboard_gallery_enabled: true });
  await settings.loadSettings();
  settingsApi.save = async () => {
    throw new Error("offline");
  };
  await assert.rejects(settings.saveDashboardGallery(false), /offline/);
  assert.equal(settings.dashboardGalleryEnabled, true);
  assert.equal(settings.saving, false);
});

test("logout clears settings and an in-flight save cannot restore them", async (t) => {
  const settings = setup(t);
  settingsApi.get = async () => ({ dashboard_gallery_enabled: false });
  await settings.loadSettings();
  const pending = deferred();
  settingsApi.save = () => pending.promise;
  const save = settings.saveDashboardGallery(true);
  settings.setUser(null);
  pending.resolve({ dashboard_gallery_enabled: false });
  assert.equal(await save, false);
  assert.equal(settings.loaded, false);
  assert.equal(settings.saving, false);
  assert.equal(settings.dashboardGalleryEnabled, true);
  assert.equal(await settings.loadSettings(), null);
});

test("failed initial load remains unloaded and retries successfully", async (t) => {
  const settings = setup(t);
  settingsApi.get = async () => {
    throw new Error("offline");
  };
  await assert.rejects(settings.loadSettings(), /offline/);
  assert.equal(settings.loaded, false);
  assert.equal(settings.loading, false);
  settingsApi.get = async () => ({ dashboard_gallery_enabled: false });
  await settings.loadSettings();
  assert.equal(settings.loaded, true);
  assert.equal(settings.dashboardGalleryEnabled, false);
});
