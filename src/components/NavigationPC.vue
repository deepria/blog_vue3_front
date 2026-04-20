<template>
  <div class="navigation-pc">
    <div class="sidebar">
      <div class="logo-area">
        <h1>Space</h1>
      </div>
      
      <nav class="nav-menu">
        <router-link
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="active"
        >
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
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
  width: 240px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01)),
    rgba(8, 14, 12, 0.22);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.logo-area {
  padding: 32px 24px;
}

.logo-area h1 {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #f8fffc 0%, #8ff2c6 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -0.5px;
}

.nav-menu {
  flex: 1;
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 15px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  transform: translateX(4px);
}

.nav-item.active {
  background: rgba(103, 232, 180, 0.14);
  color: var(--color-primary);
  border-left: 3px solid var(--color-primary);
  border-radius: 0 12px 12px 0;
}

.nav-item :deep(.anticon) {
  font-size: 18px;
}

.footer-area {
  padding: 24px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
