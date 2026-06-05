<template>
  <section class="login-page">
    <div class="login-panel">
      <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>
      <p v-if="statusMessage" class="auth-status">{{ statusMessage }}</p>
      <h1>Sign in</h1>
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
  place-items: center;
  padding: 24px;
}

.login-panel {
  width: min(100%, 360px);
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
}

h1 {
  margin: 0 0 20px;
  font-size: 24px;
  color: var(--color-text-primary);
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
</style>
