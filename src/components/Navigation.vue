<template>
  <div class="app-layout">
    <NavigationPC class="nav-pc" />
    <NavigationMobile class="nav-mobile" />

    <main class="content-area content">
      <header class="app-topbar">
        <router-link to="/" class="mobile-brand"
          ><span aria-hidden="true">✳</span> deepria
          <small>cloud</small></router-link
        ><span class="desktop-breadcrumb"
          >내 작업 공간 <span>/</span> {{ pageTitle }}</span
        ><router-link to="/account" class="profile-link" aria-label="설정 열기"
          ><SettingOutlined /><span>{{
            app.user?.name || "설정"
          }}</span></router-link
        >
      </header>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { SettingOutlined } from "@ant-design/icons-vue";
import { useAppStore } from "@/store/app";
import { navigationItems } from "@/shared/navigation/items";
import NavigationPC from "./NavigationPC.vue";
import NavigationMobile from "./NavigationMobile.vue";
import "@/assets/styles/layout.css";
const app = useAppStore();
const route = useRoute();
const pageTitle = computed(
  () =>
    navigationItems.find(
      (item) => item.to !== "/" && route.path.startsWith(item.to),
    )?.label || "홈",
);
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: transparent;
}

.content-area {
  padding-left: var(--nav-width);
  min-height: 100vh;
  transition: padding-left 0.3s ease;
  padding-right: 0;
}

.nav-mobile {
  display: none;
}

.nav-pc {
  display: flex;
}

.app-topbar {
  height: var(--header-height);
  padding: 0 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-base);
  position: sticky;
  top: 0;
  z-index: 30;
}
.desktop-breadcrumb {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  gap: 12px;
}
.desktop-breadcrumb > span {
  color: var(--color-text-muted);
}
.profile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  max-width: 180px;
  padding: 8px 10px;
  color: var(--color-text-primary);
  font-size: 12px;
  text-decoration: none;
  border-radius: var(--radius-md);
}
.profile-link span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.profile-link:hover {
  background: var(--color-bg-panel);
}
.mobile-brand {
  display: none;
  font-size: 22px;
  font-weight: 750;
  color: var(--color-text-primary);
  letter-spacing: -1px;
  text-decoration: none;
}
.mobile-brand > span {
  color: var(--color-primary);
  font-size: 28px;
}
.mobile-brand small {
  font-size: 12px;
  font-weight: 450;
  margin-left: 3px;
}
/* Mobile & Tablet Styles */
@media (max-width: 1024px) {
  .app-topbar {
    padding: 0 18px;
  }
  .mobile-brand {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .desktop-breadcrumb {
    display: none;
  }
  .content-area {
    padding-left: 0;
    padding-right: 0;
    padding-bottom: calc(var(--mobile-nav-height) + var(--safe-bottom));
  }

  .nav-pc {
    display: none;
  }

  .nav-mobile {
    display: flex;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
