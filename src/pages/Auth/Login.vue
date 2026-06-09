<template>
  <section class="login-page">
    <div class="login-copy">
      <div class="brand-mark">D</div>
      <h1>Deepria Cloud</h1>
      <p>Your memos, tasks, files, and AI workspace in one quiet place.</p>
    </div>
    <div class="login-panel">
      <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>
      <p v-if="statusMessage" class="auth-status">{{ statusMessage }}</p>
      <h2>Sign in</h2>
      <div class="provider-actions">
        <a-button size="large" block @click="login('google')">
          Continue with Google
        </a-button>
        <a-button size="large" block @click="login('github')">
          Continue with GitHub
        </a-button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { authApi } from "@/features/auth/api/authApi";
import { useAppStore } from "@/store/app";

const route = useRoute();
const router = useRouter();
const app = useAppStore();
const statusMessage = ref("");

const errorMessage = computed(() => {
  if (route.query.error === "access_denied") {
    return "This account is not allowed to access the service.";
  }
  return "";
});

function login(provider) {
  const returnTo = route.query.returnTo || window.location.origin;
  if ((hasMobileAuthBridge() || isAndroidWebView()) && provider === "google") {
    openExternalAuth(authApi.mobileLoginUrl(provider));
    return;
  }
  window.location.assign(authApi.loginUrl(provider, returnTo));
}

function isAndroidWebView() {
  const ua = navigator.userAgent || "";
  return /Android/i.test(ua) && /wv|Version\/\d+\.\d+.*Chrome/i.test(ua);
}

function hasMobileAuthBridge() {
  return Boolean(window.Android?.openExternalAuth || window.ReactNativeWebView?.postMessage);
}

function openExternalAuth(url) {
  if (window.Android?.openExternalAuth) {
    window.Android.openExternalAuth(url);
    statusMessage.value = "Continue in the browser, then return to the app.";
    return;
  }
  if (window.ReactNativeWebView?.postMessage) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: "openExternalAuth", url }),
    );
    statusMessage.value = "Continue in the browser, then return to the app.";
    return;
  }
  window.location.assign(url);
}

async function completeMobileLogin(code) {
  if (!code) return;
  statusMessage.value = "Completing sign in...";
  try {
    app.setSession(await authApi.completeMobileLogin(code));
    await router.replace("/");
  } catch (error) {
    message.error(error.userMessage || "Unable to complete mobile sign in.");
    statusMessage.value = "";
  }
}

function handleMobileAuthCode(event) {
  completeMobileLogin(event.detail?.code);
}

watch(
  () => route.query.mobile_code || route.query.code,
  (code) => completeMobileLogin(code),
  { immediate: true },
);

onMounted(() => {
  window.addEventListener("mobile-auth-code", handleMobileAuthCode);
  window.deepriaCompleteMobileLogin = completeMobileLogin;
});

onBeforeUnmount(() => {
  window.removeEventListener("mobile-auth-code", handleMobileAuthCode);
  if (window.deepriaCompleteMobileLogin === completeMobileLogin) {
    delete window.deepriaCompleteMobileLogin;
  }
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(320px, 420px);
  align-items: center;
  gap: 48px;
  padding: 24px;
  width: min(100%, 980px);
  margin: 0 auto;
}

.login-copy {
  display: grid;
  gap: 14px;
}

.brand-mark {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--text-inverse);
  font-size: 22px;
  font-weight: 800;
}

.login-panel {
  width: 100%;
  padding: 28px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-lg);
}

h1,
h2 {
  margin: 0;
  color: var(--color-text-primary);
}

h1 {
  font-size: clamp(34px, 6vw, 56px);
  line-height: 1.05;
}

h2 {
  margin: 0 0 20px;
  font-size: 24px;
  color: var(--color-text-primary);
}

.login-copy p {
  max-width: 520px;
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 16px;
}

.provider-actions {
  display: grid;
  gap: 12px;
}

.auth-error {
  margin: 0 0 16px;
  color: #fca5a5;
  font-size: 14px;
}

.auth-status {
  margin: 0 0 16px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

@media (max-width: 780px) {
  .login-page {
    grid-template-columns: 1fr;
    align-content: center;
    gap: 28px;
  }
}
</style>
