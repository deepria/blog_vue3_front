<template>
  <div>
    <top-navigation/>
    <a-config-provider :theme="{ algorithm: theme.darkAlgorithm }">
      <router-view/>
    </a-config-provider>
  </div>
</template>

<script setup>
import TopNavigation from "@/components/TopNavigation.vue";
import {theme} from "ant-design-vue";
</script>

