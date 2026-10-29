<template>
  <div class="app">
    <a-config-provider :theme="antTheme" :locale="koKR">
      <a-app class="ant-app-container">
        <PwaStatus />
        <navigation v-if="!route.meta.public" />
        <router-view v-else />
      </a-app>
    </a-config-provider>
  </div>
</template>

<script setup>
import Navigation from "@/components/Navigation.vue";
import PwaStatus from "@/components/PwaStatus.vue";
import { useAppStore } from "@/store/app";
import { theme } from "ant-design-vue";
import koKR from "ant-design-vue/es/locale/ko_KR";
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";
import "@/assets/styles/global.css";
import "@/app/styles/appearance.css";
import { getAppearance } from "@/features/appearance/lib/themes";

const route = useRoute();
const app = useAppStore();
const isDarkMode = computed(() => app.theme === "dark");

const appearance = computed(() => getAppearance(app.design, app.theme));
const antTheme = computed(() => ({
  algorithm: isDarkMode.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: appearance.value.ant,
}));

watchEffect(() => {
  document.documentElement.dataset.theme = app.theme;
  document.documentElement.dataset.design = app.design;
  for (const [key, value] of Object.entries(appearance.value.vars)) {
    document.documentElement.style.setProperty(`--${key}`, value);
  }
  document.documentElement.style.colorScheme = app.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", appearance.value.vars["color-bg-base"]);
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
