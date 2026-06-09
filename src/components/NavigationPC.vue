<template>
  <div class="navigation-pc">
    <div class="sidebar">
      <div class="logo-area">
        <div class="brand-mark">D</div>
        <div>
          <h1>Deepria Cloud</h1>
          <p>Personal workspace</p>
        </div>
      </div>
      
      <nav class="nav-menu">
        <router-link
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="active"
        >
          <component :is="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
      
      <div class="footer-area">
        <div v-if="app.user" class="user-area">
          <span class="user-kicker">Signed in</span>
          <span class="user-name">{{ app.user.name }}</span>
          <a-button size="small" @click="logout">Logout</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { navigationItems } from "@/shared/navigation/items";
import { useRouter } from "vue-router";
import { useAppStore } from "@/store/app";

const router = useRouter();
const app = useAppStore();

async function logout() {
  await app.logout();
  router.push({ name: "Login" });
}
</script>

<style scoped>
.navigation-pc {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--nav-width);
  background-color: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 18px 14px;
}

.logo-area {
  padding: 8px 8px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--text-inverse);
  font-weight: 800;
}

.logo-area h1 {
  font-size: 15px;
  font-weight: 760;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: 0;
}

.logo-area p {
  margin: 2px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
}

.nav-menu {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.15s ease;
  font-weight: 650;
  font-size: var(--font-size-body);
}

.nav-item:hover {
  background-color: var(--color-bg-panel);
  color: var(--color-text-primary);
}

.nav-item.active {
  background-color: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.nav-item.active .nav-icon {
  color: var(--color-primary);
}

.nav-icon {
  font-size: 16px;
  transition: color 0.15s ease;
}

.footer-area {
  padding: 16px 0 0;
}

.user-area {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-panel);
}

.user-kicker {
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.user-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-secondary);
  font-size: 13px;
}
</style>
