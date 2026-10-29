<template>
  <nav class="navigation-mobile">
    <router-link
      v-for="item in mobileItems"
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
const mobileItems = navigationItems.filter((item) => item.to !== "/account");
</script>

<style scoped>
.navigation-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(var(--mobile-nav-height) + var(--safe-bottom));
  padding: 7px 12px calc(7px + var(--safe-bottom));
  background: var(--color-bg-surface);
  border-top: 1px solid var(--color-border);
  z-index: 1000;
  justify-content: space-around;
  align-items: center;
}
.nav-item {
  min-height: 50px;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  position: relative;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
}
.icon-wrapper {
  font-size: 20px;
  display: flex;
}
.label {
  font-size: 11px;
  font-weight: 550;
}
.nav-item.active {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}
.nav-item.active::before {
  position: absolute;
  top: -7px;
  content: "";
  width: 17px;
  height: 2px;
  background: var(--color-primary);
}
</style>
