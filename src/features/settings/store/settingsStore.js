import { defineStore } from "pinia";
import { ref } from "vue";
import { settingsApi } from "../api/settingsApi.js";

export const useSettingsStore = defineStore("settings", () => {
  const dashboardGalleryEnabled = ref(true);
  const loaded = ref(false);
  const loading = ref(false);
  const saving = ref(false);
  let ownerId = null;
  let generation = 0;
  let pendingLoad = null;

  function setUser(userId) {
    if (ownerId === userId) return;
    ownerId = userId;
    generation += 1;
    pendingLoad = null;
    dashboardGalleryEnabled.value = true;
    loaded.value = false;
    loading.value = false;
    saving.value = false;
  }

  function applySettings(settings) {
    if (typeof settings?.dashboard_gallery_enabled !== "boolean") {
      throw new Error("Invalid account settings response");
    }
    dashboardGalleryEnabled.value = settings.dashboard_gallery_enabled;
    loaded.value = true;
  }

  function loadSettings() {
    if (!ownerId) return Promise.resolve(null);
    if (pendingLoad) return pendingLoad;
    // A save already in progress will supply the authoritative value.
    if (saving.value) return Promise.resolve(null);
    const requestGeneration = generation;
    loading.value = true;
    pendingLoad = (async () => {
      try {
        const settings = await settingsApi.get();
        if (generation !== requestGeneration) return null;
        applySettings(settings);
        return settings;
      } catch (error) {
        if (generation === requestGeneration) throw error;
        return null;
      } finally {
        if (generation === requestGeneration) {
          loading.value = false;
          pendingLoad = null;
        }
      }
    })();
    return pendingLoad;
  }

  async function saveDashboardGallery(enabled) {
    if (!ownerId || !loaded.value || loading.value || saving.value)
      return false;
    const requestGeneration = generation;
    saving.value = true;
    try {
      const settings = await settingsApi.save({
        dashboard_gallery_enabled: enabled,
      });
      if (generation !== requestGeneration) return false;
      applySettings(settings);
      return true;
    } catch (error) {
      if (generation === requestGeneration) throw error;
      return false;
    } finally {
      if (generation === requestGeneration) saving.value = false;
    }
  }

  return {
    dashboardGalleryEnabled,
    loaded,
    loading,
    saving,
    setUser,
    loadSettings,
    saveDashboardGallery,
  };
});
