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
  bottom: calc(12px + var(--safe-bottom));
  left: var(--mobile-shell-gutter);
  right: var(--mobile-shell-gutter);
  height: 72px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.012)),
    rgba(8, 14, 12, 0.24);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 26px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  box-shadow: var(--glass-shadow);
  padding: 0 10px;
  max-width: 520px;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 0;
  height: 56px;
  border-radius: 20px;
  gap: 3px;
}

.icon-wrapper {
  font-size: 20px;
  transition: transform 0.3s ease, color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label {
  font-size: 10px;
  opacity: 0.88;
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.nav-item.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.nav-item.active .icon-wrapper {
  transform: translateY(-2px);
}

.nav-item.active .label {
  opacity: 1;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  top: 8px;
  right: 10px;
  width: 5px;
  height: 5px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 8px #fff;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

.nav-item:hover {
  color: rgba(255, 255, 255, 0.8);
}

@keyframes fadeIn {
  to { opacity: 1; }
}

@media (max-width: 420px) {
  .navigation-mobile {
    left: 10px;
    right: 10px;
    height: 68px;
    padding: 0 6px;
    border-radius: 22px;
  }

  .nav-item {
    height: 52px;
    gap: 2px;
  }

  .icon-wrapper {
    font-size: 18px;
  }

  .label {
    font-size: 9px;
  }
}
</style>
