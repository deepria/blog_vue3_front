<template>
  <div class="app">
    <a-config-provider 
      :theme="{ 
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#5EEAD4',
          borderRadius: 8,
          colorBgContainer: '#18181B',
          colorBgElevated: '#27272A',
          colorBorder: 'rgba(255, 255, 255, 0.08)',
          colorTextBase: '#FAFAFA',
          fontFamily: '\'Inter\', sans-serif'
        }
      }"
    >
      <a-app class="ant-app-container">
        <navigation v-if="!route.meta.public" />
        <router-view v-else />
      </a-app>
    </a-config-provider>
  </div>
</template>

<script setup>
import Navigation from "@/components/Navigation.vue";
import { theme } from "ant-design-vue";
import { useRoute } from "vue-router";
import '@/assets/styles/global.css';

const route = useRoute();
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
