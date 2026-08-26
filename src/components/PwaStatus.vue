<template>
  <div class="pwa-status" aria-live="polite">
    <div v-if="!isOnline" class="pwa-notice offline" role="status">
      <span>오프라인 상태입니다. 저장·업로드·채팅은 연결 후 이용할 수 있습니다.</span>
    </div>
    <div v-else-if="pwaUpdateAvailable" class="pwa-notice update" role="status">
      <span>새 버전을 사용할 수 있습니다.</span>
      <button type="button" @click="applyPwaUpdate">지금 업데이트</button>
    </div>
    <div v-else-if="showOfflineReady" class="pwa-notice ready" role="status">
      <span>앱이 오프라인 실행을 준비했습니다.</span>
      <button type="button" aria-label="알림 닫기" @click="dismissOfflineReady">닫기</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  applyPwaUpdate,
  pwaOfflineReady,
  pwaUpdateAvailable,
} from "@/shared/pwa";

const isOnline = ref(navigator.onLine);
const offlineReadyDismissed = ref(false);
const showOfflineReady = computed(
  () => pwaOfflineReady.value && !offlineReadyDismissed.value,
);

function updateConnectionStatus() {
  isOnline.value = navigator.onLine;
}

function dismissOfflineReady() {
  offlineReadyDismissed.value = true;
}

onMounted(() => {
  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);
});

onBeforeUnmount(() => {
  window.removeEventListener("online", updateConnectionStatus);
  window.removeEventListener("offline", updateConnectionStatus);
});
</script>

<style scoped>
.pwa-status {
  position: fixed;
  top: calc(12px + env(safe-area-inset-top, 0px));
  left: 50%;
  z-index: 1000;
  width: min(calc(100% - 24px), 640px);
  transform: translateX(-50%);
  pointer-events: none;
}

.pwa-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-lg);
  font-size: 13px;
  pointer-events: auto;
}

.pwa-notice.offline {
  border-color: color-mix(in srgb, var(--color-warning) 52%, transparent);
}

.pwa-notice.update {
  border-color: color-mix(in srgb, var(--color-primary) 52%, transparent);
}

.pwa-notice.ready {
  border-color: color-mix(in srgb, var(--color-success) 52%, transparent);
}

.pwa-notice button {
  flex-shrink: 0;
  padding: 5px 9px;
  border: 0;
  border-radius: var(--radius-sm);
  color: var(--text-inverse);
  background: var(--color-primary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 520px) {
  .pwa-notice {
    align-items: flex-start;
  }
}
</style>
