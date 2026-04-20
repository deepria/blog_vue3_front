<template>
  <LegacyBaseSkeleton :width="width" :height="height" :shape="shape" />
</template>

<script setup>
import LegacyBaseSkeleton from "@/components/base/BaseSkeleton.vue";

defineProps({
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "20px",
  },
  shape: {
    type: String,
    default: "rect",
  },
});
</script>
