import { ref } from "vue";
import { registerSW } from "virtual:pwa-register";

export const pwaUpdateAvailable = ref(false);
export const pwaOfflineReady = ref(false);

let updateServiceWorker;

export function registerPwa() {
  updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      pwaUpdateAvailable.value = true;
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
  if (!updateServiceWorker) return;
  await updateServiceWorker(true);
}
