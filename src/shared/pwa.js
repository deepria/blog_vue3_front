import { ref } from "vue";
import { applyWhenIdle, blockingWork } from "./lib/workProtection.js";
import { registerSW } from "virtual:pwa-register";

export const pwaReloadRequired = ref(false);
let updateRequested = false;
export const pwaUpdateAvailable = ref(false);
export const pwaOfflineReady = ref(false);

let updateServiceWorker;

export function registerPwa() {
  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      pwaUpdateAvailable.value = true;
    },
    onNeedReload() {
      pwaReloadRequired.value = true;
      pwaUpdateAvailable.value = true;
      // Another tab can activate a waiting worker. Never reload this tab's draft.
      if (updateRequested && !blockingWork.value.length)
        window.location.reload();
    },
    onOfflineReady() {
      pwaOfflineReady.value = true;
    },
    onRegisterError(error) {
      console.error("Service worker registration failed", error);
    },
  });
}

export async function applyPwaUpdate() {
  if (!updateServiceWorker && !pwaReloadRequired.value) return false;
  if (pwaReloadRequired.value)
    return applyWhenIdle(() => window.location.reload());
  return applyWhenIdle(async () => {
    updateRequested = true;
    await updateServiceWorker?.(true);
  });
}
