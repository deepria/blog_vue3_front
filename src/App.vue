<template>
  <div class="app">
    <SketchWidget />

    <a-config-provider 
      :theme="{ 
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#67e8b4',
          borderRadius: 16,
          colorBgContainer: 'rgba(255, 255, 255, 0.02)',
          colorBgElevated: 'rgba(255, 255, 255, 0.035)',
          colorBorder: 'rgba(255, 255, 255, 0.08)',
          colorText: '#ffffff',
          colorTextBase: '#ffffff',
          boxShadowSecondary: '0 24px 60px rgba(0, 0, 0, 0.28)'
        }
      }"
    >
      <a-app>
        <navigation />
      </a-app>
    </a-config-provider>
  </div>
</template>

<script setup>
import Navigation from "@/components/Navigation.vue";
import SketchWidget from "@/components/SketchWidget.vue";
import { theme } from "ant-design-vue";
import '@/assets/styles/global.css';
</script>

<style>
.app {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(103, 232, 180, 0.03), transparent 24%),
    radial-gradient(circle at bottom right, rgba(182, 255, 227, 0.025), transparent 20%),
    transparent;
  color: var(--color-text-primary);
  font-family: var(--font-family);
  position: relative;
  overflow-x: hidden;
}

/* Ensure content sits above blobs */
.ant-app {
  position: relative;
  z-index: 1;
  background: transparent !important;
}
</style>
