<template>
  <PageShell
    class="account-page"
    title="Account"
    eyebrow="Profile"
    description="Manage your identity and connected sign-in providers."
  >
    <div class="account-header">
      <img v-if="app.user?.avatar_url" :src="app.user.avatar_url" alt="" class="avatar" />
      <div>
        <h1>{{ app.user?.name }}</h1>
        <p>{{ app.user?.email }}</p>
      </div>
      <a-button class="logout-button" @click="logout">Logout</a-button>
    </div>

    <div class="provider-list">
      <div v-for="provider in providers" :key="provider.id" class="provider-row">
        <div>
          <strong>{{ provider.label }}</strong>
          <span>{{ connected(provider.id) ? "Connected" : "Not connected" }}</span>
        </div>
        <a-button v-if="connected(provider.id)" :disabled="app.providers.length <= 1" @click="disconnect(provider.id)">
          Disconnect
        </a-button>
        <a-button v-else type="primary" @click="connect(provider.id)">
          Connect
        </a-button>
      </div>
    </div>
  </PageShell>
</template>

<script setup>
import { message } from "ant-design-vue";
import { useAppStore } from "@/store/app";
import { useRouter } from "vue-router";
import { authApi } from "@/features/auth/api/authApi";
import PageShell from "@/shared/ui/PageShell.vue";

const app = useAppStore();
const router = useRouter();
const providers = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
];

function connected(provider) {
  return app.providers.includes(provider);
}

function connect(provider) {
  window.location.assign(authApi.connectUrl(provider, window.location.href));
}

async function disconnect(provider) {
  try {
    app.setSession(await authApi.disconnect(provider));
  } catch (error) {
    message.error(error.userMessage || "Unable to disconnect provider.");
  }
}

async function logout() {
  await app.logout();
  router.push({ name: "Login" });
}
</script>

<style scoped>
.account-page {
  display: block;
}

.account-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
}

.logout-button {
  margin-left: auto;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
}

h1,
p {
  margin: 0;
}

h1 {
  font-size: 24px;
  color: var(--color-text-primary);
}

p,
span {
  color: var(--color-text-secondary);
}

.provider-list {
  display: grid;
  gap: 12px;
}

.provider-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-sm);
}

.provider-row div {
  display: grid;
  gap: 4px;
}

@media (max-width: 640px) {
  .account-header,
  .provider-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .logout-button {
    margin-left: 0;
  }
}
</style>
