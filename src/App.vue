<template>
  <div class="app">
    <a-config-provider :theme="{ algorithm: theme.darkAlgorithm }">
      <navigation />
    </a-config-provider>
  </div>
</template>

<script setup>
import Navigation from "@/components/Navigation.vue";
import { theme } from "ant-design-vue";
import '@/assets/styles/global.css';
</script>
