<template>
  <div class="app">
    <SketchWidget />

    <a-config-provider 
      :theme="{ 
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#42b883',
          borderRadius: 12,
          colorBgContainer: 'rgba(8, 12, 10, 0.72)',
          colorBgElevated: 'rgba(12, 18, 15, 0.88)',
          colorBorder: 'rgba(100, 255, 182, 0.18)',
          colorText: '#ffffff',
          colorTextBase: '#ffffff'
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
  background: var(--color-bg-base);
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
