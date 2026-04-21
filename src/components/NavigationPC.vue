<template>
  <div class="navigation-pc">
    <div class="sidebar">
      <div class="logo-area">
        <h1>Workspace</h1>
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
        <!-- Future Settings or User Profile could go here -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { navigationItems } from "@/shared/navigation/items";
</script>

<style scoped>
.navigation-pc {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--nav-width);
  background-color: var(--color-bg-base);
  border-right: 1px solid var(--color-border);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logo-area {
  padding: var(--space-6) var(--space-6) var(--space-6);
  display: flex;
  align-items: center;
}

.logo-area h1 {
  font-size: var(--font-size-title);
  font-weight: 700;
  background: linear-gradient(135deg, #FAFAFA 0%, #A1A1AA 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: var(--tracking-tight);
}

.nav-menu {
  flex: 1;
  padding: 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.15s ease;
  font-weight: 500;
  font-size: var(--font-size-body);
}

.nav-item:hover {
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.nav-item.active {
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.nav-item.active .nav-icon {
  color: var(--color-primary);
}

.nav-icon {
  font-size: 16px;
  transition: color 0.15s ease;
}

.footer-area {
  padding: var(--space-4);
}
</style>
