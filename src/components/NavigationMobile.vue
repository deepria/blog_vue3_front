<template>
  <nav class="navigation-mobile">
    <router-link
      v-for="item in navigationItems"
      :key="item.to"
      :to="item.to"
      class="nav-item"
      active-class="active"
    >
      <div class="icon-wrapper">
        <component :is="item.icon" />
      </div>
      <span class="label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { navigationItems } from "@/shared/navigation/items";
</script>

<style scoped>
.navigation-mobile {
  position: fixed;
  bottom: calc(16px + var(--safe-bottom));
  left: 50%;
  transform: translateX(-50%);
  height: 64px;
  background-color: var(--glass-bg-elevated);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-full);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: var(--shadow-lg);
  padding: 0 var(--space-2);
  width: calc(100% - 32px);
  max-width: 400px;
}

.nav-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  height: 48px;
  border-radius: var(--radius-full);
  gap: 4px;
}

.icon-wrapper {
  font-size: 20px;
  transition: color 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  opacity: 0.8;
  transition: all 0.2s ease;
}

.nav-item.active {
  color: var(--color-primary);
  background-color: var(--color-bg-elevated);
}

.nav-item.active .icon-wrapper {
  color: var(--color-primary);
  transform: translateY(-1px);
}

.nav-item.active .label {
  opacity: 1;
}

.nav-item:hover:not(.active) {
  color: var(--color-text-primary);
}

@media (max-width: 380px) {
  .navigation-mobile {
    width: calc(100% - 16px);
  }
}
</style>
