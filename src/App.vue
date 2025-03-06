<template>
  <div>
    <a-config-provider :theme="{ algorithm: theme.darkAlgorithm }">
      <router-view />
    </a-config-provider>
    <top-navigation />
  </div>
</template>

<script setup>
import TopNavigation from "@/components/TopNavigation.vue";
import { theme } from "ant-design-vue";
</script>
