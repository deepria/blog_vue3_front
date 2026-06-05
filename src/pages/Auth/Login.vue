<template>
  <section class="login-page">
    <div class="login-panel">
      <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>
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
import { computed } from "vue";
import { useRoute } from "vue-router";
import { authApi } from "@/features/auth/api/authApi";

const route = useRoute();

const errorMessage = computed(() => {
  if (route.query.error === "access_denied") {
    return "This account is not allowed to access the service.";
  }
  return "";
});

function login(provider) {
  const returnTo = route.query.returnTo || window.location.origin;
  window.location.assign(authApi.loginUrl(provider, returnTo));
}
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
</style>
