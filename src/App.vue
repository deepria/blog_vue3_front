<template>
  <div class="app">
    <a-config-provider :theme="antTheme">
      <a-app class="ant-app-container">
        <navigation v-if="!route.meta.public" />
        <router-view v-else />
      </a-app>
    </a-config-provider>
  </div>
</template>

<script setup>
import Navigation from "@/components/Navigation.vue";
import { useAppStore } from "@/store/app";
import { theme } from "ant-design-vue";
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import '@/assets/styles/global.css';

const route = useRoute();
const app = useAppStore();
const isDarkMode = computed(() => app.theme === "dark");

const antTheme = computed(() => ({
  algorithm: isDarkMode.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: isDarkMode.value ? "#60a5fa" : "#2563eb",
    borderRadius: 8,
    colorBgBase: isDarkMode.value ? "#0b1020" : "#f6f7fb",
    colorBgContainer: isDarkMode.value ? "#111827" : "#ffffff",
    colorBgElevated: isDarkMode.value ? "#111827" : "#ffffff",
    colorBorder: isDarkMode.value ? "rgba(255, 255, 255, 0.1)" : "#e5e7eb",
    colorTextBase: isDarkMode.value ? "#f9fafb" : "#111827",
    fontFamily: "'Inter', sans-serif",
  },
}));

watchEffect(() => {
  document.documentElement.dataset.theme = app.theme;
  document.documentElement.style.colorScheme = app.theme;
});
</script>

<style>
.app {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background-color: var(--color-bg-base);
}

.ant-app-container {
  position: relative;
  z-index: 10;
  background: transparent !important;
}
</style>
